class Lightning extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.startTime = 0; // Store the start time of the lightning
        this.duration = 1000; // Duration of the lightning in milliseconds
        this.shockCircle = null;
        this.stopped = false; // Flag to track if the lightning has stopped
    }

    fire(x, y) {
        this.body.reset(x, y);
        this.setScale(0.6);
        this.setDepth(10);
        this.setActive(true);
        this.setVisible(true);
        const speed = 700;
        const player = this.scene.player;
        const dx = player.x - x;
        const dy = player.y - y;
        const angle = Math.atan2(dy, dx);
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);

        this.body.setVelocity(vx, vy);
        this.setRotation(angle); // Set the rotation angle

        this.startTime = this.scene.time.now; // Set the start time of the lightning
    }


    createShockCircle() {
        const shockCircle = new ShockCircle(
            this.scene,
            this.x,
            this.y,
            'shock_circle',
            this.frameConfig,
            'shock_circle',
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        );

        this.scene.add.existing(shockCircle);
        shockCircle.show(this);
        this.shockCircle = shockCircle; // Set the reference to the associated ShockCircle
    }

    update(time) {
        if (!this.stopped) {
            // Check for collision with the player
            const player = this.scene.player;
            if (player && Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), player.getBounds())) {
                // Delay the creation of the shock circle and setting 'stopped' flag
                this.scene.time.delayedCall(200, () => {
                    if (!this.stopped) {
                        this.createShockCircle();
                        this.stopped = true; // Set the stopped flag to true
                    }
                }, [], this);
            } else if (time > this.startTime + this.duration) {
                this.createShockCircle();
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
    constructor(scene, x, y, texture, frameConfig, animationKey, animationFrames) {
        super(scene, x, y, texture, frameConfig, animationKey, animationFrames);
        this.duration = 1500;
        this.startTime = 0;
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
        this.startTime = this.scene.time.now; // Set the start time of the sprite

        // Create a color tint transition
        this.tintTransition = this.scene.tweens.addCounter({
            from: 0xFFFFFF, // Starting tint color (white)
            to: 0xFF0000 , // Ending tint color (red)
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


    fireLightning(x, y) {
        this.scene.time.delayedCall(250, () => {
        const lightning = this.create(0, 0, 'lightning');
        if (lightning) {
            lightning.fire(x, y);
        }});
    }


    update(time) {
        this.getChildren().forEach(function (lightning) {
            if (lightning.active) {
                lightning.update(time);
            }
        }, this);
    }

}
