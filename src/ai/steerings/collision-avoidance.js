import Steering from "./steering";
import Vector2 from "phaser/src/math/Vector2";

class CollisionAvoidance extends Steering {
    constructor(owner, objects, force = 1, maxSeeAhead = 100, maxAvoidForce = 50) {
        super(owner, objects, force);
        this.maxSeeAhead = maxSeeAhead;
        this.maxAvoidForce = maxAvoidForce;
        this.avoid = 0;
    }


    calculateImpulse() {
        const ownerPosition = new Vector2(this.owner.x, this.owner.y);
        const ownerVelocity = new Vector2(this.owner.body.velocity.x, this.owner.body.velocity.y);
        const ahead = ownerPosition.add(ownerVelocity.normalize().scale(this.maxSeeAhead));
        const ahead2 = ahead.clone().scale(0.5);

        const mostThreatening = this.findMostThreatening(ahead, ahead2, ownerPosition);
        const avoidance = new Vector2();

        if (mostThreatening) {
            avoidance.x = ahead.x - mostThreatening.x;
            avoidance.y = ahead.y - mostThreatening.y;
            avoidance.normalize().scale(this.maxAvoidForce);
        }

        return avoidance;
    }

    distance(a, b) {
        const temp = new Vector2(a.x - b.x, a.y - b.y);
        return temp.length();
    }

    lineIntersectsCircle(ahead, ahead2, obstacle, radius) {
        const center = new Vector2(obstacle.body.x, obstacle.body.y);
        return this.distance(center, ahead) <= radius ||
            this.distance(center, ahead2) <= radius;
    }

    findMostThreatening(ahead, ahead2, ownerPosition) {
        let mostThreatening = null;

        for (const obstacle of this.objects) {
            const collision = this.lineIntersectsCircle(ahead, ahead2, obstacle, 20);

            if (collision && (mostThreatening == null || this.distance(ownerPosition, obstacle) < this.distance(ownerPosition, mostThreatening))) {
                mostThreatening = obstacle;
            }
            // const obstacleDirection = obstacle.body.velocity.clone().normalize();
            // const toObstacle = new Vector2(obstacle.x - this.owner.x, obstacle.y - this.owner.y);
            // const distance = toObstacle.length();
            //
            // if (distance > this.maxSeeAhead || distance < 0.01) {
            //     continue;
            // }
            //
            // let pointOnObstacle;
            // if (obstacleDirection.lengthSq() === 0) {
            //     pointOnObstacle = new Vector2(obstacle.x, obstacle.y);
            // } else {
            //     const dot = ahead.dot(obstacleDirection);
            //     const dot2 = ahead2.dot(obstacleDirection);
            //     if (dot > 0 && dot2 > 0) {
            //         const projection = obstacleDirection.clone().scale(dot * distance);
            //         const pointOnAhead = ahead.clone().add(projection);
            //         pointOnObstacle = toObstacle.clone().normalize().scale(dot * distance).add(this.owner);
            //     } else {
            //         continue;
            //     }
            //}
            //
            // const dist = ahead.clone().subtract(pointOnObstacle).length();
            // if (dist < minDistance) {
            //     minDistance = dist;
            //     mostThreatening = pointOnObstacle;
            // }
        }

        return mostThreatening;
    }
}

export {CollisionAvoidance};
