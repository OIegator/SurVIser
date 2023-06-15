import Player from "./player";
import Projectile from "../projectiles/Projectile";
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
        this.maxSpeed = 150;
        this.body.setCircle(35);
        this.body.setOffset(-22, -9);
        this.powerUps = [];
        this.maxHp = 100;
        this.hp = 100;
        this.isAttacking = false;
        this.isAlive = true;
        this.IsTossed = false;
        this.tossedVector = new Vector2(0, 0);
        this.sprite = new Player(scene, 0, 0, name, frame, this);
        this.healthBar = new HealthBar(scene, -15, 65, 6, 60, this);
        this.fire = [];
        this.add(this.sprite);
        this.add(this.healthBar);
        this.isConfig = {
            maxHP: this.maxHp,
            strength: 20,
            moveSpeed: 1,
            attackSpeed: 1,
            attackRange: 1,
            critical: 1.4,
            criticalRate: 0.1,
            dodgeRate: 0.1,
            powerUps: this.powerUps,
            lvl: 1,
            time: '00:00'
        }
    }

    update(collide) {
        if (this.isAlive) {
            const body = this.body;
            this.body.setVelocity(0);
            this.scene.attack_timer.delay = 2000 * (1 - (this.isConfig.attackSpeed - 1) * 0.1)
            const speed = this.maxSpeed + 25 * (this.isConfig.moveSpeed - 1);
            const cursors = this.cursors;
            const wasd = this.wasd;
            if (this.IsTossed === false) {
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
            } else {
                body.velocity.add(this.tossedVector);
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

        this.sprite.updateAnimation();
    };

    checkPowerUpCollision(powerUpsGroup) {
        this.scene.physics.overlap(this, powerUpsGroup, this.collectPowerUp, null, this);
    }

    GetHit(damage) {
        const dodgeRate = this.scene.player.isConfig.dodgeRate;
        if (Math.random() < dodgeRate) {
            this.scene.showDamageNumber(this.x, this.y, 'Dodge!', '#000000', 36);
            this.hp -= 0;
        } else {
            // Regular hit
            this.hp -= damage;
        }
        this.isAttacking = false;
        this.healthBar.updateBar();
        const hitAnimations = this.sprite.animationSets.get('Hit');
        const animsController = this.sprite.anims;
        animsController.play(hitAnimations[0], true);

        this.state = "damaged"

    }

    GetTossed(damage, x, y) {
        this.isAttacking = false;
        this.IsTossed = true;
        this.hp -= damage;
        this.healthBar.updateBar();
        const hitAnimations = this.sprite.animationSets.get('Hit');
        const animsController = this.sprite.anims;
        animsController.play(hitAnimations[0], true);

        const desired = new Vector2(this.x - x, this.y - y);
        this.tossedVector = new Vector2(desired.x * 50.5, desired.y * 50.5);
        this.state = "damaged"
    }

    Die() {
        this.body.setVelocity(0);
        this.isAlive = false;
    }

    collectPowerUp(player, powerUp) {
        // Add the power-up to the power-ups array
        this.powerUps.push(powerUp);
        this.scene.displayPowerUps();
        // Remove the power-up from the scene
        powerUp.destroy();
    }

    attack() {
        this.IsTossed = false;
        const animations = this.sprite.animationSets.get('Attack');
        const animsController = this.sprite.anims;
        animsController.play(animations[0], true);
        this.state = "attack"
    }

    addFireBonus(scene) {
        const curve = new Phaser.Curves.Ellipse(0, 30, 100, 100, 0, 360, false, 0);
        var tempVec = new Phaser.Math.Vector2();
        var start = curve.getStartPoint();
        var distance = curve.getLength();
        var duration = 3500;
        var speed = distance / duration;
        var speedSec = 1000 * speed;


        const fire = new Projectile(this.scene, 0, 0, 'fire');
        fire.scale = 0.3;
        fire.flipX = true;
        fire.setCircle(60);
        fire.setOffset(30, 0);
        this.fire = fire
        this.add(this.fire);

        var resetFire = function (counter) {
            var start = curve.getStartPoint();
            fire.body.reset(start.x, start.y);
            updateFire(counter);
        };

        var updateFire = function (counter) {
            var t = counter.getValue();
            if (fire != null) {
                curve.getTangent(t, tempVec);
                fire.body.velocity.copy(tempVec.scale(speedSec));
                fire.setRotation(tempVec.angle());
            }
        };

        this.scene.tweens.addCounter({
            duration: duration,
            loop: -1,
            onStart: resetFire,
            onLoop: resetFire,
            onUpdate: updateFire,
        });
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

}
