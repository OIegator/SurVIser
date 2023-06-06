import Character from "./character";
import { State, BehaviourTree } from "mistreevous";
import {Patrol} from "../ai/steerings/patrol";
import Vector2 from 'phaser/src/math/Vector2';
import {Wander} from "../ai/steerings/wander";
import {Pursuit} from "../ai/steerings/pursuit";
import {Evade} from "../ai/steerings/evade";

export default class Zeus extends Character {
    constructor(scene, x, y, name, frame, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.body.setSize(200, 270);
        this.body.setOffset(200, 130);
        this.isOffset(200, 130);
        this.state = "idle";
        this.attacksPerformed = 0;
    }

    update(collide) {
        if(this.state !== "pursuit" && this.attacksPerformed < 1) {
            this.IsPlayerSpotted();
        } else if (this.attacksPerformed < 1) {
            this.checkZone();
        }
        console.log(this.state)

        // Call the parent's update method
        super.update(collide);
        this.updateAnimation();
    }

    patrol() {
        if(this.state !== "patrol") {
            this.changeState("patrol");
            const patrolPoints = [
                new Vector2(880, 520),
                new Vector2(580, 520),
            ];
            this.setSteerings([
                new Patrol(this, patrolPoints, 1, this.maxSpeed)
            ]);
        }
    }

    pursuit(target) {
        this.setSteerings([
            new Pursuit(this, [target], 1, this.speed, target.speed)
        ]);
    }

    attack(lightningGroup) {
        if (this.state !== "attacking") {
            this.changeState("attacking");
            this.setSteerings([]);
            lightningGroup.fireLightning(this.x, this.y - 60);
            this.attacksPerformed++;
        }
    }

    IsPlayerSpotted() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        // Calculate the range zone based on screen size
        const rangeZone = {
            x: this.scene.player.x - screenWidth / 2,
            y: this.scene.player.y - screenHeight / 2,
            width: screenWidth,
            height: screenHeight
        };

        const inRangeZone = Phaser.Geom.Rectangle.ContainsPoint(rangeZone, this);

        if (inRangeZone) {
            this.changeState("pursuit");
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
