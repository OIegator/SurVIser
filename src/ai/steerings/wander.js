import Steering from './steering.js';
import Vector2 from 'phaser/src/math/Vector2';

class Wander extends Steering {
    constructor(owner, objects, force = 1, wanderDistance = 100, wanderAngle = 1, circleRadius = 25, angleChange = 0.2) {
        super(owner, objects, force);
        this.wanderDistance = wanderDistance;
        this.circleRadius = circleRadius;
        this.angleChange = angleChange;
        this.wanderAngle = wanderAngle;
        this.targetPosition = new Vector2();
        this.wanderTarget = new Vector2();
    }

    calculateImpulse() {
        // Calculate the circle center
        const circleCenter = this.owner.body.velocity.clone().normalize().scale(this.wanderDistance);

        const y = Math.round(Math.random()) === 0 ? -1 : 1;
        const displacement = new Vector2(0, -1).scale(this.circleRadius);

        displacement.setAngle(this.wanderAngle);
        this.wanderAngle += Phaser.Math.RND.normal() * this.angleChange;

        return new Vector2(circleCenter.add(displacement).normalize());
    }
}

export { Wander };
