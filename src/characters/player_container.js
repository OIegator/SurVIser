import Player from "./player";
import HealthBar from "../ui/healthbar";
import Vector2 from 'phaser/src/math/Vector2';

export default class PlayerContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, name, frame) {
        super(scene);
        this.x = x;
        this.y = y;
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.speed = new Vector2(1);
        this.body.setCircle(35);
        this.body.setOffset(-22, -9);
        this.powerUps = [];
        this.maxHp = 100;
        this.hp = 100;
        this.isAttacking = false;
        this.isAlive = true;
        this.sprite = new Player(scene, 0, 0, name, frame, this);
        this.healthBar = new HealthBar(scene, -15, 65, 6, 60, this);
        this.add(this.sprite);
        this.add(this.healthBar);
    }

    update(collide) {
        if (this.isAlive) {
            const body = this.body;
            this.body.setVelocity(0);
            const speed = this.maxSpeed;
            const cursors = this.cursors;
            const wasd = this.wasd;
            if (cursors.left.isDown || wasd.left.isDown) {
                body.velocity.x -= speed;
                this.healthBar.updateBar();
            } else if (cursors.right.isDown || wasd.right.isDown) {
                body.velocity.x += speed;
                this.healthBar.updateBar();
            }

            // Vertical movement
            if (cursors.up.isDown || wasd.up.isDown) {
                body.setVelocityY(-speed);
            } else if (cursors.down.isDown || wasd.down.isDown) {
                body.setVelocityY(speed);
            }

            this.checkPowerUpCollision(this.scene.powerUpsGroup);
            // Normalize and scale the velocity so that player can't move faster along a diagonal
            body.velocity.normalize().scale(speed);
        }
        if (this.hp <= 0 && this.isAlive) {
            this.Die();
        }
        if (this.isAttacking && this.isAlive)
            this.attack();
        else
            this.sprite.updateAnimation();
    };

    checkPowerUpCollision(powerUpsGroup) {
        this.scene.physics.overlap(this, powerUpsGroup, this.collectPowerUp, null, this);
    }

    GetHit(damage) {
        this.hp -= damage;
        this.healthBar.updateBar();
        const hitAnimations = this.sprite.animationSets.get('Hit');
        const animsController = this.sprite.anims;
        animsController.play(hitAnimations[0], true);

        this.state = "damaged"

    }

    Die() {
        this.body.setVelocity(0);
        this.isAlive = false;
    }

    collectPowerUp(player, powerUp) {
        // Add the power-up to the power-ups array
        this.powerUps.push(powerUp);

        // Remove the power-up from the scene
        powerUp.destroy();
    }

    attack() {
        const animations = this.sprite.animationSets.get('Attack');
        const animsController = this.sprite.anims;
        animsController.play(animations[0], true);
        this.state = "attack"
        const numb = animsController.currentFrame.frame.name;
        if (numb == 86) {
            this.isAttacking = false;
        }
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
}
