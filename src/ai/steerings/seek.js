import Steering from "./steering";
import Vector2 from "phaser/src/math/Vector2";

class Seek extends Steering {
    constructor(owner, objects, force = 1, ownerSpeed, targetSpeed) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
    }

    calculateImpulse() {
        const searcherDirection = this.owner.body.velocity;
        const target = this.objects[0];
        const desiredVelocity = new Vector2(target.x - this.owner.x, target.y - this.owner.y)
            .normalize()
            .multiply(new Vector2(this.ownerSpeed, this.ownerSpeed));

        let steering = new Vector2(
            (desiredVelocity.x - searcherDirection.x),
            (desiredVelocity.y - searcherDirection.y));

        if (steering.length() > this.ownerSpeed) {
            steering.normalize().multiply(new Vector2(this.ownerSpeed, this.ownerSpeed));
        }

        return steering;
    }

    setTarget(target) {
        this._target = target;
    }
}

export {Seek}