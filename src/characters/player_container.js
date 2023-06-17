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
        this.maxHp = 1000;
        this.hp = 1000;
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
            if(this.IsTossed === false) body.velocity.normalize().scale(speed);
        }
        if (this.hp <= 0 && this.isAlive) {
            this.Die();
        }
        if (this.isAttacking && this.isAlive)
            this.attack();
        // else??
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

    GetTossed(damage, x, y, multiplier = 3.5) {
        this.isAttacking = false;
        this.IsTossed = true;
        this.hp -= damage;
        this.healthBar.updateBar();
        const hitAnimations = this.sprite.animationSets.get('Hit');
        const animsController = this.sprite.anims;
        animsController.play(hitAnimations[0], true);

        const desired = new Vector2(this.x - x, this.y - y);
        this.tossedVector = new Vector2(desired.x * multiplier, desired.y * multiplier);
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

        if(powerUp.name === "magic") {
            this.addFireBonus();
            this.scene.attacks.push(this.fire);
        }
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
        const tempVec = new Phaser.Math.Vector2();
        const start = curve.getStartPoint();
        const distance = curve.getLength();
        const duration = 3500;
        const speed = distance / duration;
        const speedSec = 1000 * speed;

        const fire = new Projectile(this.scene, 0, 0, 'fire');
        fire.scale = 0.3;
        fire.flipX = true;
        fire.setCircle(60);
        fire.setOffset(60, 20);
        fire.postFX.addGlow(0xffea00);
        this.fire = fire
        this.add(this.fire);

        const resetFire = function (counter) {
            const start = curve.getStartPoint();
            fire.body.reset(start.x, start.y);
            updateFire(counter);
        };

        const updateFire = function (counter) {
            const t = counter.getValue();
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

}
