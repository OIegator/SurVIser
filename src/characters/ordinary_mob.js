import Character from "./character";
import Vector2 from 'phaser/src/math/Vector2';
import {Patrol} from "../ai/steerings/patrol";
import Seek from "../ai/steerings/seek";

export default class Ordinary extends Character {
    constructor(scene, x, y, name, frame, maxSpeed, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.body.setCircle(75);
        this.body.setOffset(120, 210);
        this.isOffset(120, 210);
        this.hp = 0;
        this.maxSpeed = 50;
        this.lastAttackTime = 0;
        this.state = "idle";
        this.isDead = false;
        this.isDying = false;
        this.gotDamage = false;
    }


    update(collide) {
        if (!this.isDead) {
            if (this.state !== 'patrol' && !this.IsPlayerInRange()) {
                this.setSteerings([
                        new Patrol(this, this.patrolPoints, 1, this.maxSpeed),
                    ]
                )
                this.state = 'patrol';
            } else if (this.state !== 'seek' && this.IsPlayerInRange()) {
                this.setSteerings([
                        new Seek(this, [this.scene.player], 1, this.maxSpeed, this.scene.player.maxSpeed),
                    ]
                )
                this.state = 'seek';
            }
        }

        const body = this.body;
        this.body.setVelocity(0);
        let velocity = new Vector2();

        this.steerings.forEach(steering => velocity.add(steering.calculateImpulse()));
        let target = velocity.multiply(this.speed);
        this.body.velocity.add(target);


        const speed = this.maxSpeed;
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        if (!this.isDying) {
            body.velocity.normalize().scale(speed);
            this.body.velocity.add(target);
        } else
            return this.Die();

        if (this.gotDamage)
            this.GetHit();
        else
            this.updateAnimation();
    }

    GetHit(damage = null) {
        if (!this.isDying || !this.isDead) {

            if (this.hp < 0)
                this.isDying = true;

            const animations = this.animationSets.get('Hit');
            const animsController = this.anims;
            animsController.play(animations[0], true);

            const numb = animsController.currentFrame.frame.name;
            if (numb == 70) {
                const strength = this.scene.player.isConfig.strength;
                const criticalRate = this.scene.player.isConfig.criticalRate;
                const criticalMultiplier = this.scene.player.isConfig.critical;

                if (Math.random() < criticalRate) {
                    // Critical hit
                    this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength) * criticalMultiplier, '#ff0000', 32);
                    this.hp -= (damage ? damage : strength) * criticalMultiplier;
                } else {
                    // Regular hit
                    this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength), '#000000');
                    this.hp -= damage ? damage : strength;
                }

                this.gotDamage = false;
            }
        }
    }

    Attack() {
        if (!this.isDead && !this.gotDamage) {
            const currentTime = this.scene.time.now;
            // Calculate the elapsed time since the last attack
            const elapsedTime = currentTime - this.lastAttackTime;

            const animations = this.animationSets.get('Attack');
            const animsController = this.anims;
            animsController.play(animations[0], true);
            this.attackAnimationEnded = false;
            const numb = animsController.currentFrame.frame.name;
            if (numb == 82) {
                if (elapsedTime >= 500 && this.scene.player.isAlive) {
                    this.scene.player.GetHit(15);
                    this.lastAttackTime = currentTime;
                }
            }
        }
    }

    Die() {
        this.setSteerings([]);
        const animations = this.animationSets.get('Death');
        const animsController = this.anims;
        animsController.play(animations[0], true);
        const numb = animsController.currentFrame.frame.name;
        if (numb == 54)
            this.isDead = true;
    }

    IsPlayerInRange() {
        const screenHeight = this.scene.cameras.main.height;
        const Range = new Phaser.Geom.Circle(this.x, this.y, screenHeight);
        const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
        return Phaser.Geom.Circle.ContainsPoint(Range, playerPos);
    }

}
