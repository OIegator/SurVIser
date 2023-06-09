import Vector2 from 'phaser/src/math/Vector2'

export default class Character extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame, velocity = null) {
        super(scene, x, y, name, frame);
        this.setScale(0.5);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.animMultiplier = 2.2;
        this.velocity = velocity;
        this.steerings = [];
        this.offset = {x: x, y: 0};
    }

    isOffset(x, y) {
        this.offset = {x: x, y: y};
    }

    update(collide) {
        const body = this.body;
        this.body.setVelocity(0);
        let velocity = new Vector2();
        // if (this.velocity) {
        //     velocity.add(this.velocity);
        //     let target = velocity.multiply(this.speed);
        //     this.body.velocity.add(target);
        // }

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
        const hitAnimations = this.animationSets.get('Hit');
        const deathAnimations = this.animationSets.get('Death');

        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (animsController.isPlaying && deathAnimations.includes(animsController.currentAnim.key)) {
            // Death animation is playing
            if (!this.deathAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the death animation
                this.deathAnimationEnded = true;
                animsController.stop(); // Stop the death animation
            }
        } else if (animsController.isPlaying && hitAnimations.includes(animsController.currentAnim.key)) {
            // Hit animation is playing
            if (!this.hitAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the hit animation
                this.hitAnimationEnded = true;
                animsController.stop(); // Stop the hit animation
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0]); // Play the idle animation
            }
        } else if (animsController.isPlaying && attackAnimations.includes(animsController.currentAnim.key)) {
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
                this.body.setOffset(this.animMultiplier * this.offset.x, this.offset.y);
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