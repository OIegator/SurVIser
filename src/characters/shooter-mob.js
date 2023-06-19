import Character from "./character";
import {Patrol} from "../ai/steerings/patrol";
import {BehaviourTree, State} from "mistreevous";
import {Pursuit} from "../ai/steerings/pursuit";
import {Evade} from "../ai/steerings/evade";
import {Wander} from "../ai/steerings/wander";

const treeDefinition = `root {
            selector {
                repeat until(IsPlayerSpotted) {
                    action [Patrol]
                }
                sequence {
                    flip {
                        repeat until(IsDead) {  
                            selector {  
                                repeat until(IsFarEnough) {   
                                    action [Evade]
                                }
                                repeat until(IsCloseEnough) {   
                                    action [Pursuit]
                                }
                                sequence { 
                                    action [Attack]
                                    wait [2000, 6000]
                                }
                            }
                        }
                    }
                    action [Die] 
                    wait [800]
                    action [Disappear]
                }
            }
        }`;

export default class Shooter extends Character {
    constructor(scene, x, y, name, frame, maxSpeed, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.body.setCircle(75);
        this.isOffset(80, 160);
        this.animMultiplier = 1.8;
        this.hp = 0;
        this.maxSpeed = 120;
        this.lastAttackTime = 0;
        this.state = "idle";
        this.isDead = false;
        this.gotDamage = false;
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
    }

    update(collide) {
        super.update(collide);
        if (!this.isDead) this.behaviourTree.step();
        this.updateAnimation();
    }

    behaviour = {
        Patrol: () => {
            if (this.state !== "patrol") {
                this.state = "patrol";
                this.setSteerings([
                        new Patrol(this, this.patrolPoints, 1, this.maxSpeed),
                    ]
                );
            }
            return State.SUCCEEDED;
        },
        Pursuit: () => {
            this.state = "pursuit";
            this.setSteerings([
                new Pursuit(this, [this.scene.player], 1, this.speed, this.scene.player.speed)
            ]);
            return State.SUCCEEDED;
        },
        Evade: () => {
            this.state = "evade";
            this.setSteerings([
                new Evade(this, [this.scene.player], 1, this.speed, this.scene.player.speed, 500)
            ]);
            return State.SUCCEEDED;
        },
        Wander: () => {
            this.state = "wander";
            this.setSteerings([
                new Wander(this, [this.scene.player], 1, 100, 1, 25, 0.05)
            ]);
            return State.SUCCEEDED;
        },
        Attack: () => {
            this.state = "attack";
            this.setSteerings([]);
            this.scene.bulletGroup.fireBullet(this.x, this.y + 35, this.scene.player);

            // Play attack animation
            const attackAnimations = this.animationSets.get('Attack');
            const animsController = this.anims;
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;

            return State.SUCCEEDED;
        },
        GetHit: (damage) => {
            if (!this.isDead) {
                this.state = "hit";
                const strength = this.scene.player.isConfig.strength;
                const criticalRate = this.scene.player.isConfig.criticalRate;
                const criticalMultiplier = this.scene.player.isConfig.critical;
                const animations = this.animationSets.get('Hit');
                const animsController = this.anims;
                animsController.play(animations[0], true);
                animsController.currentAnim.paused = false;
                this.gotDamage = true;
                this.hitAnimationEnded = false;
                if (Math.random() < criticalRate) {
                    // Critical hit
                    this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength) * criticalMultiplier, '#ff0000', 32);
                    this.hp -= (damage ? damage : strength) * criticalMultiplier;
                } else {
                    // Regular hit
                    this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength), '#000000');
                    this.hp -= damage ? damage : strength;
                }
            }
            return State.SUCCEEDED;
        },
        Die: () => {
            this.state = "dead"
            this.setSteerings([]);

            const animations = this.animationSets.get('Death');
            const animsController = this.anims;
            animsController.play(animations[0], true);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        Disappear: () => {
            this.isDead = true;

            return State.SUCCEEDED;
        },
        IsFarEnough: () => {
            const screenHeight = this.scene.cameras.main.height;
            const closeRange = new Phaser.Geom.Circle(this.x, this.y, screenHeight * 0.4);
            const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
            return !Phaser.Geom.Circle.ContainsPoint(closeRange, playerPos);
        },
        IsCloseEnough: () => {
            // Get the screen size
            const screenHeight = this.scene.cameras.main.height;
            const Range = new Phaser.Geom.Circle(this.x, this.y, screenHeight * 0.45);
            const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
            return Phaser.Geom.Circle.ContainsPoint(Range, playerPos);
        },
        IsPlayerSpotted: () => {
            const screenHeight = this.scene.cameras.main.height;
            const Range = new Phaser.Geom.Circle(this.x, this.y, screenHeight);
            const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
            return Phaser.Geom.Circle.ContainsPoint(Range, playerPos);
        },
        IsDead: () => {
            if (this.hp <= 0) this.isVulnerable = false;
            return this.hp <= 0;
        },
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const attackAnimations = this.animationSets.get('Attack');
        const hitAnimations = this.animationSets.get('Hit');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;


        if (animsController.isPlaying && this.state === "attack") {
            // Attack animation is playing
            if (!this.attackAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.attackAnimationEnded = true;
                animsController.stop(); // Stop the attack animation
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0]); // Play the idle animation
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
        } else if (this.state === "dead") {
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the death animation
                animsController.currentAnim.paused = true;
            }
        } else {
            // Play walk or idle animations if no attack or death animation is playing
            if (x < 0) {
                this.setScale(0.5, 0.5);
                animsController.play(animations[0], true);
                this.body.setOffset(this.offset.x, this.offset.y);
            } else if (x > 0) {
                this.setScale(-0.5, 0.5);
                animsController.play(animations[1], true);
                this.body.setOffset(this.offset.x + 150, this.offset.y);
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
}
