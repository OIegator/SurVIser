import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Pursuit extends Steering {

    constructor (owner, objects, force = 1, ownerSpeed, targetSpeed) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
    }

    calculateImpulse () {
        const searcherDirection = this.owner.body.velocity;
        const target = this.objects[0];
        const targetDirection = target.body.velocity;
        const toTarget = new Vector2(this.owner.x - target.x, this.owner.y - target.y);
        const relativeHeading = searcherDirection.dot(targetDirection);

        if (toTarget.dot(targetDirection) < 0 || relativeHeading > -0.95)
        {
            const predictTime = toTarget.length() / this.targetSpeed.add(this.ownerSpeed).length();
            toTarget.x += predictTime*targetDirection.x;
            toTarget.y += predictTime*targetDirection.y;
        }

        if (isNaN(toTarget.x))
            return [0, 0];

        const x = (Math.abs(toTarget.x) < 1) ? 0 : -Math.sign(toTarget.x)*this.ownerSpeed.x;
        const y = (Math.abs(toTarget.y) < 1) ? 0 : -Math.sign(toTarget.y)*this.ownerSpeed.y;

        return new Vector2(x, y);

    }

    setTarget(target) {
        this._target = target;
    }

}

export {Pursuit};