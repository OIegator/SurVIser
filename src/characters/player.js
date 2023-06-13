export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame, container) {
        super(scene, x, y, name, frame);
        this.setScale(0.5);
        this.container = container;
        scene.add.existing(this);
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.container.body.velocity.x;
        const y = this.container.body.velocity.y;
        if (this.container.state === "attack") {
            const attackAnimations = this.animationSets.get('Attack');
            if (x < 0) {
                this.setScale(0.5, 0.5);
                this.container.body.setOffset(-22, -9);
                animsController.play(attackAnimations[0], true);
            } else if (x > 0) {
                this.setScale(-0.5, 0.5);
                animsController.play(attackAnimations[0], true);
                this.container.body.setOffset(-44, -9);
            }
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                this.container.state = "";
                this.container.isAttacking = false;
                this.container.IsTossed = false;
            }
        } else if (this.container.state === "damaged") {
            const hitAnimations = this.animationSets.get('Hit');
            if (x < 0) {
                this.setScale(0.5, 0.5);
                this.container.body.setOffset(-22, -9);
                animsController.play(hitAnimations[0], true);
            } else if (x > 0) {
                this.setScale(-0.5, 0.5);
                animsController.play(hitAnimations[0], true);
                this.container.body.setOffset(-44, -9);
            }
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                this.container.state = "";
                this.container.IsTossed = false;
            }
        } else if (!this.container.isAlive) {
            const deathAnimations = this.animationSets.get('Death');
            animsController.play(deathAnimations[0], true);
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the death animation
                animsController.currentAnim.paused = true;
            }
        } else if (x < 0) {
            this.setScale(0.5, 0.5);
            this.container.body.setOffset(-22, -9);
            animsController.play(animations[0], true);
        } else if (x > 0) {
            this.setScale(-0.5, 0.5);
            animsController.play(animations[1], true);
            this.container.body.setOffset(-44, -9);
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
