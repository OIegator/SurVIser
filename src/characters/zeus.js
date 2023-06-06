import Vector2 from 'phaser/src/math/Vector2';
import Character from "./character";

export default class Zeus extends Character {
    constructor(scene, x, y, name, frame, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.state = 'idle';
    }

    update(collide) {
        // Call the parent's update method
        super.update(collide);

        // Implement Zeus specific behavior based on the state
        if (this.state === 'idle') {
            // Perform idle behavior
            // ...
        } else if (this.state === 'attacking') {
            // Perform attacking behavior
            // ...
        } else if (this.state === 'fleeing') {
            // Perform fleeing behavior
            // ...
        } else if (this.state === 'patrolling') {
            // Perform patrolling behavior
            // ...
        }

        // Update animation based on the state
        this.updateAnimation();
    }

    // Add a method to change the state of Zeus
    changeState(newState) {
        this.state = newState;
    }
}
