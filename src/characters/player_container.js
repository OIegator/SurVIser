import Player from "./player";
import Projectile from "../projectiles/Projectile";
import HealthBar from "../ui/healthbar";
import Vector2 from 'phaser/src/math/Vector2';
import AnimationLoader from "../utils/animation-loader";
import viConfigJson from "../../assets/animations/vi.json";

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
        this.Invc = false;
        this.doubleAtt = true;
        this.biome = 'border'
        this.tossedVector = new Vector2(0, 0);
        this.sprite = new Player(scene, 0, 0, name, frame, this);
        this.healthBar = new HealthBar(scene, -15, 65, 6, 60, this);
        this.shieldIcon = null;
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
            this.checkPickUpCollision(this.scene.pickUps);
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

    checkPickUpCollision(powerUpsGroup) {
        this.scene.physics.overlap(this, powerUpsGroup, this.collectPickUp, null, this);
    }

    GetHit(damage) {
        if (!this.Invc && this.isAlive) {
            if (!this.hitSoundCooldown) {
                this.scene.sound.play("player_hit_sound");

                // Set a cooldown to prevent playing the sound again too soon
                this.hitSoundCooldown = true;
                this.scene.time.addEvent({
                    delay: 150,
                    callback: () => {
                        this.hitSoundCooldown = false;
                    }
                });
            }
            const dodgeRate = this.scene.player.isConfig.dodgeRate;
            if (Math.random() < dodgeRate) {
                this.scene.showDamageNumber(this.x, this.y, 'Dodge!', '#000000', 36);
                this.hp -= 0;
            } else {
                // Regular hit
                this.hp -= this.powerUps.some(powerUp => powerUp.texture.key === 'armor') ? damage * 0.7 : damage;
            }
            this.isAttacking = false;
            this.healthBar.updateBar();
            const hitAnimations = this.sprite.animationSets.get('Hit');
            const animsController = this.sprite.anims;
            animsController.play(hitAnimations[0], true);

            this.state = "damaged"
        }
    }

    GetTossed(damage, x, y, multiplier = 3.5) {
        if (!this.Invc) {
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

        if(powerUp.name === "armor") {
            this.changeSpritesheet('vi_skull', 2);
        }
        // Remove the power-up from the scene
        powerUp.destroy();
    }

    collectPickUp(player, pickUp) {
        switch (pickUp.name) {
            case 'bigHeal':
                this.scene.sound.play('heal_sound2');
                this.hp = this.maxHp;
                this.healthBar.updateBar();
                break;
            case 'heal':
                this.scene.sound.play('heal_sound');
                this.hp += this.maxHp * 0.25;
                if (this.hp > this.maxHp)
                    this.hp = this.maxHp;
                this.healthBar.updateBar();
                break;
            case 'invincible':
                this.scene.sound.play('inv_sound');
                this.Invc = true;
                this.sprite.postFX.addGlow(0x0000ff);
                const delayDuration = 6000; // Duration of the delay in milliseconds
                this.healthBar.invincibilityWidth = this.healthBar.width;
                this.healthBar.updateBar()

                // Create a tween to gradually decrease the invincibility rectangle width
                this.scene.tweens.add({
                    targets: this.healthBar,
                    invincibilityWidth: 0,
                    duration: delayDuration,
                    onUpdate: (tween, target) => {
                        this.healthBar.updateBar()
                    },
                    onComplete: () => {
                        this.Invc = false;
                        this.sprite.postFX.clear();
                    }
                });
                break;

            case 'damage':
                this.scene.tacticalNuke();
                break;

        }
        pickUp.destroy();
    }

    attack() {
        if (!this.attackCooldown) {
            this.scene.sound.play("attack_sound");
            const animations = this.sprite.animationSets.get('Attack');
            const animsController = this.sprite.anims;
            animsController.play(animations[0], true);
            this.state = "attack";

            // Set a cooldown to prevent playing the sound again too soon
            this.attackCooldown = true;
            this.scene.time.addEvent({
                delay: 1000, // 1 second delay
                callback: () => {
                    this.attackCooldown = false;
                }
            });
        }
    }

    changeSpritesheet(name, frame) {
        // Create a new player sprite with the updated spritesheet
        const newPlayer = new Player(this.scene, 0, 0, name, frame, this);
        newPlayer.scale = this.sprite.scale; // Preserve the scale of the previous player sprite

        const animSets = this.sprite.animationSets
        // Remove the old player sprite from the container
        this.remove(this.sprite, true);

        // Assign the new player sprite to the container
        this.sprite = newPlayer;
        this.sprite.animationSets = new AnimationLoader(this.scene, 'vi_skull', viConfigJson, 'vi_skull', 28).createAnimations();
        this.add(this.sprite);

        this.shieldIcon = this.scene.add.sprite(-45, 65, 'shield'); // Adjust the position as needed
        this.shieldIcon.setDepth(1); // Ensure the shield is displayed above other sprites
        this.add(this.shieldIcon);
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

    calculateDamage() {
        if (Math.random() < this.isConfig.criticalRate) {
            return this.isConfig.strength * this.isConfig.critical;
        } else {
            return this.isConfig.strength;
        }
    }

}
