import Boss from "./boss";
import {State, BehaviourTree} from "mistreevous";
import Vector2 from 'phaser/src/math/Vector2';
import {Patrol} from "../ai/steerings/patrol";
import {Pursuit} from "../ai/steerings/pursuit";
import {Evade} from "../ai/steerings/evade";
import PowerUp from "../power-ups/power-up";

const treeDefinition = `root {
            selector {
                repeat until(IsPlayerSpotted) {
                    action [Patrol]
                }
                sequence {
                    action [InitHealthBar]
                    flip {
                        repeat until(IsDead) {  
                            selector {  
                                repeat until(IsCloseEnough) {   
                                    action [Pursuit]
                                }
                                    sequence { 
                                        action [Attack]
                                        wait[1800]
                                    }
                            }
                        }
                    }
                    action [Die] 
                    wait [1000]
                    action [Disappear]
                }
            }
        }`;

export default class Golem extends Boss {
    constructor(scene, x, y, name, frame, maxHP, velocity = null) {
        super(scene, x, y, name, frame, maxHP, velocity);
        this.body.setSize(330, 330);
        this.body.setOffset(350, 240);
        this.isOffset(350, 240);
        this.state = "patrol";
        this.isDead = false;
        this.constName = "Golem";
        this.patrolPoints = [
            new Vector2(x - 1000, y),
            new Vector2(x + 1000, y),
        ];
        this.gotHit = false;
        this.startX = x;
        this.startY = y;
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
    }

    update(collide) {
        if (!this.isDead) {
            if (this.hp > 0) {
                super.update(collide);
            } else {
                this.body.setVelocity(0, 0);
            }
            this.behaviourTree.step();
        }
        this.updateAnimation();
    }

    behaviour = {
        Patrol: () => {
            if (this.state !== "patrol") {
                this.changeState("patrol");
            }
            this.setSteerings([
                new Patrol(this, this.patrolPoints, 1, this.maxSpeed)
            ]);
            this.steerings = [];
            return State.SUCCEEDED;
        },
        Pursuit: () => {
            this.changeState("pursuit");
            this.setSteerings([
                new Pursuit(this, [this.scene.player], 1, this.speed, this.scene.player.speed)
            ]);
            return State.SUCCEEDED;
        },
        Evade: () => {
            this.changeState("evade");
            this.setSteerings([
                new Evade(this, [this.scene.player], 1, this.speed, this.scene.player.speed, 500)
            ]);
            return State.SUCCEEDED;
        },
        Attack: () => {
            this.changeState("attack");
            this.setSteerings([]);

            if (!this.attackSoundCooldown) {
                this.scene.sound.play("golem_attack_sound");

                // Set a cooldown to prevent playing the sound again too soon
                this.attackSoundCooldown = true;
                this.scene.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.attackSoundCooldown = false;
                    }
                });
            }
            // Play attack animation
            const attackAnimations = this.animationSets.get('Attack');
            const animsController = this.anims;

            animsController.play(attackAnimations[0]);
            animsController.msPerFrame = 45;
            this.attackAnimationEnded = false;
            this.scene.EnemyAttack(this.x, this.y + 30, this, 180, 100, 385);
            return State.SUCCEEDED;
        },

        GetHit: (damage) => {
            this.gotHit = true;
            this.hp -= damage;
            this.setMeterPercentageAnimated(this.hp < 0 ? 0 : this.hp / 100);
            if (!this.hitSoundCooldown) {
                this.scene.sound.play("hit_sound");

                // Set a cooldown to prevent playing the sound again too soon
                this.hitSoundCooldown = true;
                this.scene.time.addEvent({
                    delay: 150,
                    callback: () => {
                        this.hitSoundCooldown = false;
                    }
                });
            }
            // Play hit animation
            const hitAnimations = this.animationSets.get('Hit');
            const animsController = this.anims;
            animsController.play(hitAnimations[0]);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        Die: () => {
            this.changeState("dead");
            this.isVulnerable = false;

            const deathAnimations = this.animationSets.get('Death');
            const animsController = this.anims;
            animsController.play(deathAnimations[0]);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        Disappear: () => {
            this.removeHealthBar();
            this.isDead = true;

            this.scene.powerUpsGroup.add(new PowerUp(this.scene, this.x, this.y, 'armor', 'armor_icon'));
            this.scene.deadBosses++;

            return State.SUCCEEDED;
        },
        InitHealthBar: () => {
            this.initHealthBar(this.scene.scale.width * 0.35, this.scene.scale.height * 0.95);
            return State.SUCCEEDED;
        },
        IsFarEnough: () => {
            const screenHeight = this.scene.cameras.main.height;
            const closeRange = new Phaser.Geom.Circle(this.x, this.y, screenHeight / 4);
            const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
            return !Phaser.Geom.Circle.ContainsPoint(closeRange, playerPos);
        },
        IsCloseEnough: () => {

            const attackZone = {
                x: this.scene.player.x - 100,
                y: this.scene.player.y - 100,
                width: 210,
                height: 210
            };
            return Phaser.Geom.Rectangle.ContainsPoint(attackZone, this);
        },
        IsPlayerSpotted: () => {
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;
            // Calculate the range zone based on screen size
            const rangeZone = {
                x: this.scene.player.x - screenWidth / 2,
                y: this.scene.player.y - screenHeight / 2,
                width: screenWidth,
                height: screenHeight
            };

            return Phaser.Geom.Rectangle.ContainsPoint(rangeZone, this);
        },
        IsDead: () => {
            if (this.hp <= 0) this.isVulnerable = false;
            return this.hp <= 0;
        },

    }

    outsideCameraCheck(scene) {
        if (!scene.cameras.main.worldView.contains(this.x, this.y)) {
            if (!this.timer) {
                this.timer = scene.time.now + 3000; // Set the timer to the current time plus 3 seconds
            } else if (scene.time.now > this.timer) {
                this.reset(scene);
                this.timer = scene.time.now + 3000; // Reset the timer to the current time plus 3 seconds
            }
        } else {
            this.timer = null; // Reset the timer if the game object is back within the camera bounds
        }

    }

    reset() {
        this.removeHealthBar();
        this.x = this.startX;
        this.y = this.startY;
        this.changeState("patrol");
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const attackAnimations = this.animationSets.get('Attack');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (attackAnimations && this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('SPACE'), 200)) {
            // Play attack animation if the SPACE key is pressed
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;
        }

        if (animsController.isPlaying && this.state === "attack") {
            // Attack animation is playing
            if (!this.attackAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.attackAnimationEnded = true;
                animsController.stop(); // Stop the attack animation
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0]); // Play the idle animation
            }
        } else if (this.gotHit) {

            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.gotHit = false;
                animsController.stop(); // Stop the attack animation
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
                this.body.setOffset(2 * this.offset.x, this.offset.y);
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


    // Add a method to change the state of Zeus
    changeState(newState) {
        this.state = newState;
    }
}
