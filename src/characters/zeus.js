import Character from "./character";
import { State, BehaviourTree } from "mistreevous";
import {Patrol} from "../ai/steerings/patrol";
import Vector2 from 'phaser/src/math/Vector2';
import {Wander} from "../ai/steerings/wander";
import {Pursuit} from "../ai/steerings/pursuit";
import {Evade} from "../ai/steerings/evade";

const treeDefinition = `root {
            selector {
                repeat until(IsPlayerSpotted) {
                    action [Patrol]
                }
                repeat until(CanAttack) {   
                    action [Pursuit]
                }
                repeat until(IsOutOfAmmo) {   
                    sequence { 
                        action [Attack]
                        wait [2000]
                    }
                }
            }
        }`;

export default class Zeus extends Character {
    constructor(scene, x, y, name, frame, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.body.setSize(200, 270);
        this.body.setOffset(200, 130);
        this.isOffset(200, 130);
        this.state = "idle";
        this.ammo = 3;
        this.behaviourTree = new BehaviourTree(treeDefinition, this.behaviour);
    }

    update(collide) {
        this.behaviourTree.step();
        console.log(this.state)
        // Call the parent's update method
        super.update(collide);
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
        Attack: () => {
            this.changeState("attack");
            this.setSteerings([]);
            this.scene.lightningGroup.fireLightning(this.x, this.y - 60);
            this.ammo--;
            return State.SUCCEEDED;
        },
        EnemyFar: () => {
            return this.state === "patrol";
        },
        EnemyClose: () => {
            return this.state === "pursuit";
        },
        CanAttack: () => {
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
        IsPlayerDead: () => {
            return false;
        },
        IsOutOfAmmo: () => {
            return this.ammo == 0;
        }
    }

    checkZone() {
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

        const inAttackZone = Phaser.Geom.Rectangle.ContainsPoint(attackZone, this);

        if (inAttackZone) {
            this.changeState("attack");
        }
    }

    // Add a method to change the state of Zeus
    changeState(newState) {
        this.state = newState;
    }
}
