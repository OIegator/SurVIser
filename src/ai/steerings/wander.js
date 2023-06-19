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
        const circleCenter = this.owner.body.velocity.clone().normalize().scale(this.wanderDistance);
        const y = Math.round(Math.random()) === 0 ? -1 : 1;
        const displacement = new Vector2(0, -1).scale(this.circleRadius);
        displacement.setAngle(this.wanderAngle);
        this.wanderAngle += Phaser.Math.RND.normal() * this.angleChange;

        const impulse = new Vector2(circleCenter.add(displacement).normalize());

        // Check if changing direction will immediately reverse x velocity
        if (Math.sign(this.owner.body.velocity.x) !== Math.sign(impulse.x)) {
            impulse.x *= -1; // Reverse the x component of the impulse
        }

        return impulse;
    }
}

export { Wander };
