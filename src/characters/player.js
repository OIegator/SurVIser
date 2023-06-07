export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        this.setScale(0.5);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.isAttacking = false;
    }

    update(collide) {
        const body = this.body;
        this.body.setVelocity(0);
        const speed = this.maxSpeed;
        const cursors = this.cursors;

        if (cursors.left.isDown) {
            body.velocity.x -= speed;
        } else if (cursors.right.isDown) {
            body.velocity.x += speed;
        }

        // Vertical movement
        if (cursors.up.isDown) {
            body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            body.setVelocityY(speed);
        }
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        body.velocity.normalize().scale(speed);
        if (this.isAttacking)
            this.attack();
        else
            this.updateAnimation();
    };

    attack() {
        const animations = this.animationSets.get('Attack');
        const animsController = this.anims;
        animsController.play(animations[0], true);

        const numb = animsController.currentFrame.frame.name;
        if (numb == 86) {
            this.isAttacking = false;
        }
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (x < 0) {
            this.setScale(0.5, 0.5);
            this.body.setOffset(100, 120);
            animsController.play(animations[0], true);
        } else if (x > 0) {
            this.setScale(-0.5, 0.5);
            animsController.play(animations[1], true);
            this.body.setOffset(220, 120);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const idle = this.animationSets.get('Idle');
            // const currentAnimation = animsController.currentAnim;
            // if (currentAnimation) {
            //     const frame = currentAnimation.getLastFrame();
            //     this.setTexture(frame.textureKey, frame.textureFrame);
            // }
            animsController.play(idle[0], true);
        }
    }
}
