class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.startTime = 0; // Store the start time of the bullet
        this.duration = 1500; // Duration of the bullet in milliseconds
        this.target = null;
        this.canDamage = true;
    }

    fire(x, y, target, duration) {
        this.body.reset(x, y);
        this.body.setSize(20, 20);
        this.duration = duration;
        this.target = target;
        this.setScale(0.4);
        this.setDepth(10);
        this.setActive(true);
        this.setVisible(true);
        const speed = 500;
        const dx = target.x - x;
        const dy = target.y - y;
        const angle = Math.atan2(dy, dx);
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);

        this.body.setVelocity(vx, vy);
        this.setRotation(angle); // Set the rotation angle

        this.startTime = this.scene.time.now; // Set the start time of the bullet
    }


    update(time) {
        this.scene.physics.overlap(this, this.target, () => {
            if (this.canDamage) {
                this.target.GetHit(10);
                this.canDamage = false;

                setTimeout(() => {
                    this.canDamage = true; // Set the flag to true after the delay
                }, 1500); // 1.5 seconds delay
                setTimeout(() => {
                    this.hide();
                }, 50);
            }
        });

        const sceneWidth = this.scene.width;
        const sceneHeight = this.scene.height;
        const padding = 100;

        // Check for collision with the target
        if (time > this.startTime + this.duration ||
            this.x <= padding ||
            this.x >= sceneWidth - padding ||
            this.y <= padding ||
            this.y >= sceneHeight - padding) {
            this.hide();
        }
    }

    hide() {
        this.setActive(false);
        this.setVisible(false);
        this.anims.stop(); // Stop the animation
        this.destroy(); // Destroy the parent bullet sprite
    }


    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.x <= 0 || this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 1,
            active: false,
            visible: false,
            key: 'bullet'
        });
    }


    fireBullet(x, y, target, duration = 1000) {
        this.scene.time.delayedCall(250, () => {
            const timestamp = Date.now(); // Get the current timestamp
            const animationKey = `bullet_${timestamp}`; // Append the timestamp to the animation key
            const bullet = this.create(0, 0, animationKey); // Use the unique animation key

            if (bullet) {
                bullet.fire(x, y, target, duration);
            }
        });
    }


    update(time) {
        this.getChildren().forEach(function (bullet) {
            if (bullet.active) {
                bullet.update(time);
            }
        }, this);
    }

}
