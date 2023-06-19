class TargetDummy {
    constructor(target) {
        this.target = target;
    }

    getBounds() {
        return new Phaser.Geom.Rectangle(this.target.x, this.target.y, 100, 100);
    }

    GetHit() {
        console.log("dummy get hit");
    }
}

class Lightning extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.startTime = 0; // Store the start time of the lightning
        this.duration = 1000; // Duration of the lightning in milliseconds
        this.shockCircle = null;
        this.target = null;
        this.affectedEnemies = [];
        this.canDamage = true;
        this.stopped = false; // Flag to track if the lightning has stopped
    }

    fire(x, y, target, duration) {
        this.body.reset(x, y);
        this.body.setSize(20, 20);
        this.duration = duration;
        this.target = target;
        if (Array.isArray(target)) {
            target = this.findNearestEnemy(target);
        }
        this.setScale(0.6);
        this.postFX.addGlow(0xf0d700);
        this.setDepth(10);
        this.setActive(true);
        this.setVisible(true);
        const speed = 700;
        const dx = target.x - x;
        const dy = target.y - y;
        const angle = Math.atan2(dy, dx);
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);

        this.body.setVelocity(vx, vy);
        this.setRotation(angle); // Set the rotation angle

        this.startTime = this.scene.time.now; // Set the start time of the lightning
    }


    createShockCircle() {
        const timestamp = Date.now(); // Get the current timestamp
        const animationKey = `shock_circle_${timestamp}`; // Append the timestamp to the animation key

        const shockCircle = new ShockCircle(
            this.scene,
            this.x,
            this.y,
            'shock_circle',
            this.frameConfig,
            animationKey, // Use the unique animation key
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            this.target
        );

        this.scene.add.existing(shockCircle);
        shockCircle.show(this);
        this.shockCircle = shockCircle; // Set the reference to the associated ShockCircle
        this.scene.attacks.push(shockCircle);
    }

    findNearestEnemy(enemies) {
        if (enemies.length === 0) {
            const randomX = Phaser.Math.Between(-this.scene.cameras.main.width / 2, this.scene.cameras.main.width / 2);
            const randomY = Phaser.Math.Between(-this.scene.cameras.main.height / 2, this.scene.cameras.main.height / 2);
            return new Phaser.Math.Vector2(this.x + randomX, this.y + randomY);
        }

        let nearestEnemy = null;
        let nearestDistance = Infinity;
        const playerPosition = new Phaser.Math.Vector2(this.x, this.y);

        enemies.forEach(enemy => {
            const enemyPosition = new Phaser.Math.Vector2(enemy.x, enemy.y);
            const distance = playerPosition.distance(enemyPosition);

            if (distance < nearestDistance) {
                nearestEnemy = enemy;
                nearestDistance = distance;
            }
        });
        return nearestEnemy;
    }

    update(time) {
        if (!this.stopped) {
            this.scene.physics.overlap(this, this.target, (attack, mob) => {
                if (!attack.affectedEnemies.includes(mob)) {
                    if (mob.constructor.name === "Shooter") {
                        mob.behaviour.GetHit();
                    } else {
                        mob.gotDamage = true;
                    }
                    setTimeout(() => {
                        if (!this.stopped) {
                            this.createShockCircle();
                            this.body.setSize(10, 10);
                            this.stopped = true; // Set the stopped flag to true
                        }
                    }, 50);
                    attack.affectedEnemies.push(mob); // Add the enemy to affectedEnemies
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
                this.createShockCircle();
                this.body.setSize(10, 10);
                this.stopped = true; // Set the stopped flag to true
            }

        }

        if (this.stopped) {
            this.body.setVelocity(0, 0);
            this.shockCircle.update(time);
            this.setVisible(false); // Set the lightning as invisible
        }
    }


    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.x <= 0 || this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class ShockCircle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frameConfig, animationKey, animationFrames, target) {
        super(scene, x, y, texture, frameConfig, animationKey, animationFrames);
        this.duration = 1500;
        this.startTime = 0;
        this.canDamage = true;
        this.target = target;
        this.affectedEnemies = [];
        this.lightning = null; // Reference to the parent lightning sprite
        this.tintTransition = null; // Reference to the color tint transition

        // Create the animation using the provided configuration
        scene.anims.create({
            key: animationKey,
            frames: scene.anims.generateFrameNumbers(texture, animationFrames),
            frameRate: 30,
            repeat: -1 // Set repeat to -1 for continuous looping
        });

        this.play(animationKey); // Start playing the animation
    }

    show(lightning) {
        this.lightning = lightning; // Set the reference to the parent lightning sprite
        this.setActive(true);
        this.setVisible(true);
        this.postFX.addGlow(0xf0d700);
        this.startTime = this.scene.time.now; // Set the start time of the sprite

        // Create a color tint transition
        this.tintTransition = this.scene.tweens.addCounter({
            from: 0xFFFFFF, // Starting tint color (white)
            to: 0xFF0000, // Ending tint color (red)
            duration: this.duration, // Duration of the transition
            onUpdate: (tween) => {
                const color = tween.getValue();
                this.setTint(color);
            },
            onComplete: () => {
                this.tintTransition = null; // Clear the reference to the color tint transition
            }
        });
    }

    update(time) {
        this.lightning.body.setCircle(this.width * 0.57);
        this.lightning.body.x = this.x - this.width * 0.37;
        this.lightning.body.y = this.y - this.height * 0.37;
        if (this.active && time > this.startTime + this.duration * 0.8) {
            this.scene.physics.overlap(this.lightning, this.target, (attack, mob) => {
                if (!attack.affectedEnemies.includes(mob)) {
                    if (mob.constructor.name === "Shooter") {
                        mob.behaviour.GetHit();
                    } else {
                        mob.gotDamage = true;
                    }
                    attack.affectedEnemies.push(mob); // Add the enemy to affectedEnemies
                }
            });
        }


        if (this.active && time > this.startTime + this.duration) {
            this.hide();
        }
    }

    hide() {
        this.setActive(false);
        this.setVisible(false);
        this.anims.stop(); // Stop the animation

        if (this.lightning) {
            this.lightning.setActive(false);
            this.lightning.destroy(); // Destroy the parent lightning sprite
        }

        if (this.tintTransition) {
            this.tintTransition.stop(); // Stop the color tint transition if it's still active
            this.tintTransition = null;
        }
        this.destroy();
    }
}

export class LightningGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: Lightning,
            frameQuantity: 1,
            active: false,
            visible: false,
            key: 'lightning'
        });
    }


    fireLightning(x, y, target, duration = 1000) {
        this.scene.time.delayedCall(250, () => {
            const timestamp = Date.now(); // Get the current timestamp
            const animationKey = `lightning_${timestamp}`; // Append the timestamp to the animation key
            const lightning = this.create(0, 0, animationKey); // Use the unique animation key

            if (lightning) {
                lightning.fire(x, y, target, duration);
            }
        });
    }


    update(time) {
        this.getChildren().forEach(function (lightning) {
            if (lightning.active) {
                lightning.update(time);
            }
        }, this);
    }

}
