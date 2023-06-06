import Vector2 from 'phaser/src/math/Vector2'

export default class Character extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame, velocity = null) {
        super(scene, x, y, name, frame);
        this.setScale(0.5);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.velocity = velocity;
        this.steerings = [];
        this.offset = {x: x, y: 0};
    }

    isOffset(x, y){
        this.offset = {x: x, y: y};
    }

    update(collide) {
        const body = this.body;
        this.body.setVelocity(0);
        let velocity = new Vector2();
        if (this.velocity) {
            velocity.add(this.velocity);
            let target = velocity.multiply(this.speed);
            this.body.velocity.add(target);
        }

        this.steerings.forEach(steering => velocity.add(steering.calculateImpulse()));
        let target = velocity.multiply(this.speed);
        this.body.velocity.add(target);


        const speed = this.maxSpeed;
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        body.velocity.normalize().scale(speed);
        this.updateAnimation();
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const attackAnimations = this.animationSets.get('Attack');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (attackAnimations && this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('SPACE'), 200)) {
            // Play attack animation if the SPACE key is pressed
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;
        }

        if (animsController.isPlaying && attackAnimations.includes(animsController.currentAnim.key)) {
            // Attack animation is playing
            if (!this.attackAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.attackAnimationEnded = true;
                animsController.stop(); // Stop the attack animation
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0]); // Play the idle animation
            }
        } else {
            // Play walk or idle animations if no attack animation is playing
            if (x < 0) {
                this.setScale(0.5, 0.5);
                animsController.play(animations[0], true);
                this.body.setOffset(this.offset.x, this.offset.y);
            } else if (x > 0) {
                this.setScale(-0.5, 0.5);
                animsController.play(animations[1], true);
                this.body.setOffset(2 * this.offset.x, this.offset.y);
            } else if (y < 0) {
                animsController.play(animations[2], true);
            } else if (y > 0) {
                animsController.play(animations[3], true);
            } else {
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0], true);
            }
        }
    }



    setSteerings(steerings) {
        this.steerings = steerings;
    }
}