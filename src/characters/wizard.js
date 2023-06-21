import Boss from "./boss";
import { State, BehaviourTree } from "mistreevous";
import Vector2 from 'phaser/src/math/Vector2';
import { Patrol } from "../ai/steerings/patrol";
import { Pursuit } from "../ai/steerings/pursuit";
import { Evade } from "../ai/steerings/evade";
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
                                repeat until(IsFarEnough) {   
                                    action [Evade]
                                }
                                repeat until(IsCloseEnough) {   
                                    action [Pursuit]
                                } 
                                    sequence { 
                                        action [Attack]
                                        wait [2500]
                                    }
                                
                                
                            }
                        }
                    }
                    action [Die] 
                    wait [1100]
                    action [Disappear]
                }
            }
        }`;

export default class Wizard extends Boss {
    constructor(scene, x, y, name, frame, maxHP, velocity = null) {
        super(scene, x, y, name, frame, maxHP, velocity);
        this.body.setSize(150, 190);
        this.body.setOffset(200, 265);
        this.isOffset(200, 265);
        this.state = "patrol";
        this.isVulnerable = false;
        this.isDead = false;
        this.gotHit = false;
        this.patrolPoints = [
            new Vector2(x - 800, y),
            new Vector2(x + 800, y),
        ];
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
        this.startX = x;
        this.startY = y;
    }

    update(collide) {
        if (!this.isDead) {
            if (this.hp > 0) {
                super.update(collide);
            }
            else {
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
            this.scene.ProjectAttack(this.x, this.y, this.scene.player, 555, true);
            this.scene.ProjectAttack(this.x, this.y, this.scene.player, 1100, false);
            // Play attack animation

            if (!this.attackSoundCooldown) {
                const detune = Phaser.Math.RND.integerInRange(-100, 100); // Random detune in cents

                this.scene.sound.play("fire_sound", {
                    detune: detune
                });

                this.scene.sound.play("fire_sound", {
                    delay: 0.5,
                    detune: detune
                });

                this.scene.time.addEvent({
                    delay: 1000, // 1 second delay
                    callback: () => {
                        this.attackSoundCooldown = false;
                    }
                });
            }
            const attackAnimations = this.animationSets.get('Attack');
            const animsController = this.anims;
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;

            return State.SUCCEEDED;
        },
        GetHit: (damage) => {
            if (this.hp > 0) {
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
                this.gotHit = true;
                this.hp -= damage;
                this.setMeterPercentageAnimated(this.hp / 100);
                // Play hit animation
                const hitAnimations = this.animationSets.get('Hit');
                const animsController = this.anims;
                animsController.play(hitAnimations[0]);
                animsController.currentAnim.paused = false;
            }

            return State.SUCCEEDED;
        },
        Die: () => {
            this.setSteerings([]);
            this.changeState("dead");
            this.isVulnerable = false;

            const deathAnimations = this.animationSets.get('Death');
            const animsController = this.anims;
            animsController.play(deathAnimations[0], true);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        Disappear: () => {
            this.removeHealthBar();
            this.isDead = true;

            this.scene.powerUpsGroup.add(new PowerUp(this.scene, this.x, this.y + 100, 'magic', 'magic_icon'));
            this.scene.deadBosses++;

            return State.SUCCEEDED;
        },
        InitHealthBar: () => {
            this.initHealthBar(550, 850);
            return State.SUCCEEDED;
        },
        IsFarEnough: () => {
            const screenHeight = this.scene.cameras.main.height;
            const closeRange = new Phaser.Geom.Circle(this.x, this.y, screenHeight / 4);
            const playerPos = new Phaser.Geom.Point(this.scene.player.x, this.scene.player.y);
            return !Phaser.Geom.Circle.ContainsPoint(closeRange, playerPos);
        },
        IsCloseEnough: () => {
            // Get the screen size
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;
            // Calculate the range zone based on screen size

            const attackZone = {
                x: this.scene.player.x - screenWidth / 3,
                y: this.scene.player.y - screenHeight / 3,
                width: screenWidth,
                height: screenHeight
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
        } else if (this.gotHit) {
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.gotHit = false;
                animsController.stop(); // Stop the attack animation
            }

        } else if (this.state === "dead") {
            const deathAnimations = this.animationSets.get('Death');
            const animsController = this.anims;
            animsController.play(deathAnimations[0], true);
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the death animation
                animsController.stop();
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
                this.body.setOffset( this.offset.x + 150, this.offset.y);
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
