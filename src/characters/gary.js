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
                                repeat until(IsFarEnough) {   
                                    action [Evade]
                                }
                                repeat until(IsCloseEnough) {   
                                    action [Pursuit]
                                }
                                repeat until(IsOutOfAmmo) {   
                                    sequence { 
                                        action [Dash]
                                        wait [5000]
                                    }
                                }
                                sequence { 
                                    wait [1000]
                                    action [Fell]
                                    wait [4000]
                                    action [Rise]
                                    wait [650]
                                }
                            }
                        }
                    }
                    action [Die] 
                    wait [2000]
                    action [Disappear]
                }
            }
        }`;

export default class Gary extends Boss {
    constructor(scene, x, y, name, frame, maxHP, velocity = null) {
        super(scene, x, y, name, frame, maxHP, velocity);
        this.body.setSize(200, 270);
        this.setOffset(200, 130);
        this.isOffset(200, 130);
        this.state = "idle";
        this.ammo = 1;
        this.isVulnerable = false;

        this.chargeLine = null; // Store the line object
        this.chargeStartPos = new Vector2(); // Store the start position of the line
        this.chargeEndPos = new Vector2();

        this.isDead = false;
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
    }

    update(collide) {
        super.update(collide);

        if (!this.isDead) {
            this.behaviourTree.step();
        }

        this.updateAnimation();
    }

    behaviour = {
        Patrol: () => {
            if (this.state !== "patrol") {
                this.changeState("patrol");
                const patrolPoints = [
                    new Vector2(880, 520),
                    new Vector2(580, 520),
                ];
                this.setSteerings([
                    new Patrol(this, patrolPoints, 1, this.maxSpeed)
                ]);
            }
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

            // Play attack animation
            const attackAnimations = this.animationSets.get('Attack');
            const animsController = this.anims;
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;

            return State.SUCCEEDED;
        },
        Fell: () => {
            this.changeState("fell");
            this.isVulnerable = true;
            const stanAnimations = this.animationSets.get('Fell');
            const animsController = this.anims;
            animsController.play(stanAnimations[0], true);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        Rise: () => {
            this.changeState("rise");
            this.isVulnerable = false;
            this.ammo = 3;

            const stanAnimations = this.animationSets.get('Fell');
            const animsController = this.anims;
            animsController.playReverse(stanAnimations[0]);
            animsController.currentAnim.paused = false;

            return State.SUCCEEDED;
        },
        GetHit: (damage) => {
            const strength = this.scene.player.isConfig.strength;
            const criticalRate = this.scene.player.isConfig.criticalRate;
            const criticalMultiplier = this.scene.player.isConfig.critical;

            if (Math.random() < criticalRate) {
                // Critical hit
                this.hp -= damage ? damage * criticalMultiplier : strength * criticalMultiplier;
            } else {
                // Regular hit
                this.hp -= damage ? damage : strength;
            }
            this.setMeterPercentageAnimated(this.hp / 100);
            // Play hit animation
            const hitAnimations = this.animationSets.get('Hit');
            const animsController = this.anims;
            animsController.play(hitAnimations[0], true);

            return State.SUCCEEDED;
        },
        Charge: () => {
            this.changeState("charge");
            this.setSteerings([]);

            const startX = this.x;
            const startY = this.y;
            const endX = this.scene.player.x;
            const endY = this.scene.player.y;

            // Display the charging line
            const chargeLine = new Phaser.Geom.Line(startX, startY, endX, endY);
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0x00ff00, 0.7);
            graphics.strokeLineShape(chargeLine);
            this.chargeLine = graphics;

            let chargeTime = 3;
            const timerLabel = this.scene.add.text(startX, startY - 20, chargeTime.toString(), { fill: 'white' });
            timerLabel.setOrigin(0.5, 1);

            const timer = this.scene.time.addEvent({
                delay: 1000,
                repeat: chargeTime - 1,
                callback: () => {
                    chargeTime--;
                    timerLabel.setText(chargeTime.toString());

                    switch (chargeTime) {
                        case 2:
                            graphics.clear();
                            graphics.lineStyle(2, 0xffff00, 0.3); // Change color to yellow
                            graphics.strokeLineShape(chargeLine);
                            break;
                        case 1:
                            graphics.clear();
                            graphics.lineStyle(2, 0xff0000, 0.3); // Change color to red
                            graphics.strokeLineShape(chargeLine);
                            break;
                    }
                },
                callbackScope: this,
                onComplete: () => {
                    console.log("fgagdfgd")
                    timerLabel.destroy(); // Remove the timer label
                    graphics.destroy(); // Remove the charging line

                    // Perform the dash towards the last player position
                    const dashX = this.scene.player.x;
                    const dashY = this.scene.player.y;
                    this.scene.tweens.add({
                        targets: this,
                        x: dashX,
                        y: dashY,
                        duration: 500,
                        ease: 'Power1',
                        onComplete: () => {
                            console.log("CHSS")
                            this.changeState("attack"); // Change state back to "attack"
                        }
                    });
                }
            });

            return State.SUCCEEDED;
        },
        Dash: () => {
            this.changeState("dash");
            this.setSteerings([]);

            const startX = this.x;
            const startY = this.y;
            const endX = this.scene.player.x;
            const endY = this.scene.player.y;

            const dashSpeed = 1000; // Adjust the speed as desired
            const traceInterval = 100; // Adjust the interval between each trace sprite as desired
            const traceCount = 10; // Adjust the number of trace sprites as desired

            // Calculate the direction vector towards the player
            const direction = new Phaser.Math.Vector2(endX - startX, endY - startY).normalize().scale(dashSpeed);

            const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
            const duration = distance / dashSpeed * 1000; // Calculate the duration based on the distance and speed

            const originalTint = this.tint; // Store the original tint color

            const traceSprites = []; // Array to hold the trace sprites

            this.scene.tweens.add({
                targets: this,
                x: endX,
                y: endY,
                duration: duration,
                ease: 'Power1',
                onUpdate: (tween, target) => {
                    const bottomY = target.y + this.height / 2; // Calculate the y-coordinate of the bottom of the boss's sprite

                    if (bottomY >= startY) {
                        // Create a trace sprite at the current position
                        const traceSprite = this.scene.add.sprite(target.x, target.y, 'gary', 0); // Use the first frame of the spritesheet
                        traceSprite.setTint(0xff0000); // Tint the trace sprite red
                        traceSprite.setDepth(11); // Tint the trace sprite red
                        traceSprite.alpha = 1; // Adjust the opacity of the trace sprite as desired
                        traceSprites.push(traceSprite);

                        // Remove extra trace sprites if necessary
                        if (traceSprites.length > traceCount) {
                            const removedSprite = traceSprites.shift();
                            removedSprite.destroy();
                        }
                    }

                    // Update the position of each trace sprite
                    traceSprites.forEach((sprite, index) => {
                        const offset = (index + 1) * traceInterval;
                        sprite.setPosition(target.x - direction.x * offset, target.y - direction.y * offset);
                    });

                    if (bottomY >= startY + traceCount * traceInterval) {
                        this.setTint(0xffff00, 0xffff00, 0xffff00, 0xffff00); // Tint the boss's sprite red
                    } else {
                        this.setTint(originalTint); // Restore the original tint color
                    }
                },
                onComplete: () => {
                    this.setTint(originalTint); // Restore the original tint color
                    traceSprites.forEach(sprite => sprite.destroy()); // Destroy all trace sprites
                    this.changeState("attack"); // Change state back to "attack" after dashing
                }
            });

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

            this.scene.powerUpsGroup.add(new PowerUp(this.scene, this.x, this.y, 'lightning', 'shock_icon'));

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
        IsOutOfAmmo: () => {
            return this.ammo <= 0;
        }
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const attackAnimations = this.animationSets.get('Attack');
        const chargeAnimations = this.animationSets.get('Charge');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (this.chargeLine) {
            // Update the position of the line if it exists
            Phaser.Geom.Line.SetTo(this.chargeLine, this.chargeStartPos.x, this.chargeStartPos.y, this.chargeEndPos.x, this.chargeEndPos.y);
        }

        if (chargeAnimations && this.state === "charge") {
            // Play charge animation if the boss is in "charge" state
            animsController.play(chargeAnimations[0]);
        } else if (attackAnimations && this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('SPACE'), 200)) {
            // Play attack animation if the SPACE key is pressed
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;
        } else if (animsController.isPlaying && this.state === "attack") {
            // Attack animation is playing
            if (!this.attackAnimationEnded && animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the attack animation
                this.attackAnimationEnded = true;
                animsController.stop(); // Stop the attack animation
                const idle = this.animationSets.get('Idle');
                animsController.play(idle[0]); // Play the idle animation
            }
        } else if (this.state === "fell" && this.isVulnerable) {
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                animsController.play(stanAnimations[0]);
            }
        } else if (this.state === "dead") {
            if (animsController.currentFrame.index === animsController.currentAnim.frames.length - 1) {
                // Reached the last frame of the death animation
                animsController.currentAnim.paused = true;
            }
        } else {
            // Play walk or idle animations if no attack, charge, or death animation is playing
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
