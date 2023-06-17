import Boss from "./boss";
import {State, BehaviourTree} from "mistreevous";
import Vector2 from 'phaser/src/math/Vector2';
import {Patrol} from "../ai/steerings/patrol";
import {Pursuit} from "../ai/steerings/pursuit";
import {Evade} from "../ai/steerings/evade";

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
                                repeat until(IsGotHit) {   
                                    sequence { 
                                        action [Charge]
                                        wait [3500]
                                        action [Dash]
                                        wait [1000]
                                        flip {
                                            repeat until(FoundPlayer) {   
                                                action [SearchPlayer]
                                            }
                                        }
                                        action [PlayerLost]
                                        selector {
                                            sequence {
                                                action [Attack]
                                                wait [1000]
                                                action [DashAway]
                                            }
                                            sequence {
                                                action [Dash]
                                                wait [1000]
                                                action [DashAway]
                                            }
                                            action [DashAway]
                                        }
                                    }
                                }
                                action [DashAway]
                                wait [500]
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
        this.setCircle(130);
        this.setOffset(140, 210);
        this.isOffset(140, 210);
        this.state = "idle";

        this.eyeSpotted = false;
        this.isVulnerable = true;
        this.dashTarget = {x: 0, y: 0};

        this.chargeLine = null; // Store the line object
        this.chargeStartPos = new Vector2(); // Store the start position of the line
        this.chargeEndPos = new Vector2();
        this.gotHit = false;
        this.line = null;
        this.sprite = null;
        this.canAttack = false;
        this.attackDirection = "left";

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
            if (!this.canAttack) return State.FAILED;
            this.changeState("attack");
            this.setSteerings([]);
            if (this.attackDirection === "left") {
                this.setScale(0.5, 0.5)
                this.body.setOffset(this.offset.x, this.offset.y);
            } else {
                this.setScale(-0.5, 0.5);
                this.body.setOffset(this.offset.x + 280, this.offset.y);
            }

            // Play attack animation
            const attackAnimations = this.animationSets.get('Attack');
            const animsController = this.anims;
            animsController.play(attackAnimations[0]);
            this.attackAnimationEnded = false;
            this.scene.EnemyAttack(this.x, this.y + 30, this, 180, 80, 255, 'poke');
            this.canAttack = false;

            return State.SUCCEEDED;
        },
        GetHit: (damage) => {
            this.gotHit = true;
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
            this.setSteerings([
                new Pursuit(this, [this.scene.player], 1, this.speed, this.scene.player.speed)
            ]);
            // Create a graphics object to draw the line
            const graphics = this.scene.add.graphics();
            let startTime; // Declare the startTime variable here

            // Function to update the charge line
            const updateChargeLine = () => {
                graphics.clear();
                graphics.lineStyle(15, getChargeLineColor(), 0.3);
                graphics.strokeLineShape(new Phaser.Geom.Line(this.x, this.y + 90, this.scene.player.sprite.scaleX > 0 ? this.scene.player.x + 10 : this.scene.player.x - 10, this.scene.player.y + 58));
            };

            // Function to get the charge line color based on the elapsed time
            const getChargeLineColor = () => {
                const elapsedSeconds = Math.floor(this.scene.time.now / 1000) - startTime;
                if (elapsedSeconds >= 2) {
                    return 0xff0000; // Red color after 2 seconds
                } else if (elapsedSeconds >= 1) {
                    return 0xffff00; // Yellow color after 1 second
                } else {
                    return 0x00ff00; // Green color initially
                }
            };

            // Update the charge line initially
            updateChargeLine();

            const updateChargeLinePosition = () => {
                // Update the charge line to follow both player and boss positions
                updateChargeLine();
            };

            // Register the update function to follow player and boss positions
            this.scene.events.on("update", updateChargeLinePosition);

            // Set the startTime variable before the delayed call
            startTime = Math.floor(this.scene.time.now / 1000);

            // Remove the charge line after 3 seconds
            this.scene.time.delayedCall(3000, () => {
                // Unregister the update function after 3 seconds
                this.canDash = true;
                this.dashTarget = {x: this.scene.player.x, y: this.scene.player.y};
                this.scene.events.off("update", updateChargeLinePosition);
            }, [], this);

            // Destroy the charge line after an additional 0.5 seconds
            this.scene.time.delayedCall(3500, () => {
                graphics.destroy(); // Remove the graphics object from the scene
            }, [], this);

            return State.SUCCEEDED;
        },

        Dash: (endX = this.dashTarget.x, endY = this.dashTarget.y) => {
            if (!this.canDash) return State.FAILED;
            this.scene.player.body.setImmovable(false);
            this.isVulnerable = false;
            this.changeState("dash");
            this.setSteerings([]);
            const startX = this.x;
            const startY = this.y;

            const dashSpeed = 1000; // Adjust the speed as desired
            const tintedAreaHeight = 50;

            // Calculate the direction vector towards the specified coordinates
            const direction = new Phaser.Math.Vector2(endX - startX, endY - startY).normalize().scale(dashSpeed);

            const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
            const duration = (distance / dashSpeed) * 1000; // Calculate the duration based on the distance and speed

            const originalTint = this.tint; // Store the original tint color

            const dashTween = this.scene.tweens.add({
                targets: this,
                x: endX,
                y: endY,
                duration: duration,
                ease: "Power1",
                onUpdate: (tween, target) => {
                    const bottomY = target.y + this.height / 2; // Calculate the y-coordinate of the bottom of the boss's sprite

                    if (bottomY >= startY + tintedAreaHeight) {
                        this.setTint(0xFAD7A0); // Tint the boss's sprite bottom red
                    } else {
                        this.setTint(originalTint); // Restore the original tint color
                    }
                },
                onComplete: () => {
                    this.isVulnerable = true;
                    this.setTint(originalTint); // Restore the original tint color
                    this.changeState("attack"); // Change state back to "attack" after dashing
                },
            });

            this.scene.physics.add.collider(
                this,
                this.scene.player,
                () => {
                    this.scene.player.GetTossed(2, this.x, this.y, 6);
                    dashTween.stop();
                },
                null,
                this
            );
            this.canDash = false;
            return State.SUCCEEDED;
        },


        DashAway: () => {
            this.isVulnerable = false;
            // Check if line and sprite exist and destroy them if they do
            if (this.line) {
                this.line.destroy();
                this.line = null;
            }
            if (this.sprite) {
                this.sprite.destroy();
                this.sprite = null;
            }

            this.changeState("dash");
            this.setSteerings([]);
            const startX = this.x;
            const startY = this.y;

            const dashSpeed = 1000; // Adjust the speed as desired
            const tintedAreaHeight = 50; // Adjust the height of the tinted area as desired
            const minDistance = 440; // Minimum distance from the starting point
            const maxDistance = 800; // Maximum distance from the starting point

            // Calculate a random angle in radians
            const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const randomDistance = Phaser.Math.FloatBetween(minDistance, maxDistance);

            // Calculate the end coordinates based on the random angle and distance
            const endX = startX + Math.cos(randomAngle) * randomDistance;
            const endY = startY + Math.sin(randomAngle) * randomDistance;

            // Calculate the direction vector towards the random coordinates
            const direction = new Phaser.Math.Vector2(endX - startX, endY - startY).normalize().scale(dashSpeed);

            const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
            const duration = distance / dashSpeed * 1000; // Calculate the duration based on the distance and speed

            const originalTint = this.tint; // Store the original tint color

            this.scene.tweens.add({
                targets: this,
                x: endX,
                y: endY,
                duration: duration,
                ease: 'Power1',
                onUpdate: (tween, target) => {
                    const bottomY = target.y + this.height / 2; // Calculate the y-coordinate of the bottom of the boss's sprite

                    if (bottomY >= startY + tintedAreaHeight) {
                        this.setTint(0xFAD7A0); // Tint the boss's sprite bottom red
                    } else {
                        this.setTint(originalTint); // Restore the original tint color
                    }
                },
                onComplete: () => {
                    this.isVulnerable = true
                    this.setTint(originalTint); // Restore the original tint color
                    this.changeState("attack"); // Change state back to "attack" after dashing
                }
            });
            this.gotHit = false;
            return State.SUCCEEDED;
        },

        SearchPlayer: () => {
            if (this.state !== "search") {
                this.changeState("search");
                let startX = this.x - 10; // Boss's x coordinate
                let startY = this.y + 50; // Boss's y coordinate
                let lineLength = 100; // Initial line length
                if (this.scaleX > 0) {
                    startX = this.x + 10;
                    startY = this.y + 50;
                    lineLength = -100;
                }
                let lineAngle = 0; // Initial line angle
                const rotationSpeed = Phaser.Math.DegToRad(0.5); // Line rotation speed in radians
                const angleThreshold = Phaser.Math.DegToRad(15); // Angle threshold for considering it as zero

                // Create a graphics object to draw the line
                const graphics = this.scene.add.graphics();
                const lineStyle = {lineWidth: 8, color: 0xdea900}; // Store the line style properties

                // Create the initial line
                const line = new Phaser.Geom.Line(startX, startY, startX + lineLength, startY);

                // Create the sprite at the end of the line
                const sprite = this.scene.add.sprite(line.x2, line.y2, 'eye');

                const updateLine = () => {
                    lineAngle += rotationSpeed; // Increase the line angle by the rotation speed

                    line.x2 = startX + lineLength * Math.cos(lineAngle); // Update the x coordinate of the line's end
                    line.y2 = startY + lineLength * Math.sin(lineAngle); // Update the y coordinate of the line's end

                    graphics.clear();
                    graphics.lineStyle(lineStyle.lineWidth, lineStyle.color); // Reapply the line style properties
                    graphics.strokeLineShape(line); // Draw the line

                    // Update sprite position
                    sprite.x = line.x2;
                    sprite.y = line.y2;
                };

                const updateLinePosition = () => {
                    // Check if the angle between the two lines is within the threshold
                    const lineVector = new Phaser.Math.Vector2(line.x2 - startX, line.y2 - startY);
                    const playerVector = new Phaser.Math.Vector2(this.scene.player.x - startX, this.scene.player.y - startY);
                    const angleDiff = Math.abs(lineVector.angle() - playerVector.angle());

                    // Check if the player is within the attack range
                    const playerDistance = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
                    const attackRange = 250; // Adjust the attack range

                    if (angleDiff <= angleThreshold && playerDistance <= attackRange) {
                        // Angle between the lines is considered zero and player is within attack range
                        if (graphics) graphics.destroy();
                        if (sprite) sprite.destroy();

                        this.eyeSpotted = true;

                        // Determine the player's position relative to the boss
                        const playerX = this.scene.player.x;
                        const playerY = this.scene.player.y;

                        if (playerX < this.x) {
                            this.canAttack = true;
                            this.attackDirection = "left";
                        } else if (playerX > this.x) {
                            this.canAttack = true;
                            this.attackDirection = "right";
                        }

                        if (playerY < this.y) {
                            this.canDash = true;
                            // Set player position as dash target if they are above the boss
                            this.dashTarget.x = playerX;
                            this.dashTarget.y = playerY;
                        } else if (playerY > this.y) {
                            this.canDash = true;
                            // Set player position as dash target if they are below the boss
                            this.dashTarget.x = playerX;
                            this.dashTarget.y = playerY;
                        }
                    }

                    updateLine();
                };


                // Register the update function
                this.scene.events.on("update", updateLinePosition);

                // Stop updating the line position after 2 seconds
                this.scene.time.delayedCall(3000, () => {
                    this.scene.events.off("update", updateLinePosition); // Unregister the update function
                    this.eyeSpotted = true;
                    if (graphics) graphics.destroy(); // Remove the graphics object from the scene if it exists
                    if (sprite) sprite.destroy(); // Remove the sprite object from the scene if it exists
                }, [], this);

                // Initial update of the line
                updateLine();

                // Store the line and sprite as local fields
                this.line = graphics;
                this.sprite = sprite;
            }
            return State.SUCCEEDED;
        },

        Die: () => {
            this.changeState("dead");
            this.setSteerings([]);
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

            return State.SUCCEEDED;
        },
        InitHealthBar: () => {
            this.initHealthBar(550, 850);

            return State.SUCCEEDED;
        },
        PlayerLost: () => {
            this.eyeSpotted = false;

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
        FoundPlayer: () => {
            return this.eyeSpotted;
        },
        IsGotHit: () => {
            return this.gotHit;
        },
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
                this.body.setOffset(this.offset.x + 280, this.offset.y);
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
