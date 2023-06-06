import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Patrol extends Steering {
    constructor(owner, patrolPoints, force = 1, ownerSpeed) {
        super(owner, [], force);
        this.patrolPoints = patrolPoints;
        this.ownerSpeed = ownerSpeed;
        this.currentPointIndex = 0;
    }

    calculateImpulse() {
        const target = this.patrolPoints[this.currentPointIndex];
        const toTarget = new Vector2(target.x - this.owner.x, target.y - this.owner.y);

        if (toTarget.length() <= 1) {
            // Reached the patrol point, move to the next one
            this.currentPointIndex = (this.currentPointIndex + 1) % this.patrolPoints.length;
        }

        toTarget.normalize();
        toTarget.scale(this.ownerSpeed);

        return toTarget;
    }
}

export { Patrol };
