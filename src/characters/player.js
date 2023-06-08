export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        this.setScale(0.5);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.powerUps = [];
        this.hp = 100;
        this.isAttacking = false;
    }

    update(collide) {
        const body = this.body;
        this.body.setVelocity(0);
        const speed = this.maxSpeed;
        const cursors = this.cursors;
        const wasd = this.wasd;
        if (cursors.left.isDown || wasd.left.isDown) {
            body.velocity.x -= speed;
        } else if (cursors.right.isDown || wasd.right.isDown) {
            body.velocity.x += speed;
        }

        // Vertical movement
        if (cursors.up.isDown || wasd.up.isDown) {
            body.setVelocityY(-speed);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            body.setVelocityY(speed);
        }
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        body.velocity.normalize().scale(speed);
        if (this.isAttacking)
            this.attack();
        else
            this.updateAnimation();
    };

    checkPowerUpCollision(powerUpsGroup) {
        this.scene.physics.overlap(this, powerUpsGroup, this.collectPowerUp, null, this);
    }

    GetHit(damage) {
        this.hp -= damage;
        console.log(this.hp);

        const hitAnimations = this.animationSets.get('Hit');
        const animsController = this.anims;
        animsController.play(hitAnimations[0], true);

        this.state = "damaged"

    }

    collectPowerUp(player, powerUp) {
        // Add the power-up to the power-ups array
        this.powerUps.push(powerUp);

        // Remove the power-up from the scene
        powerUp.destroy();
    }

    attack() {
        const animations = this.animationSets.get('Attack');
        const animsController = this.anims;
        animsController.play(animations[0], true);
        this.state = "attack"
        const numb = animsController.currentFrame.frame.name;
        if (numb == 86) {
            this.isAttacking = false;
        }
    }

    findNearestEnemy(enemies) {
        if (enemies.length === 0) {
            const randomX = Phaser.Math.Between(- this.scene.cameras.main.width / 2, this.scene.cameras.main.width / 2);
            const randomY = Phaser.Math.Between(- this.scene.cameras.main.height / 2, this.scene.cameras.main.height / 2);
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


    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (this.state === "damaged") {
            const hitAnimations = this.animationSets.get('Hit');
            animsController.play(hitAnimations[0], true);
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                this.state = "";
            }
        } else if (x < 0) {
            this.setScale(0.5, 0.5);
            this.body.setOffset(110, 135);
            animsController.play(animations[0], true);
        } else if (x > 0) {
            this.setScale(-0.5, 0.5);
            animsController.play(animations[1], true);
            this.body.setOffset(240, 135);
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
