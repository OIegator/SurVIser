
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
        this.startTime = 0; // Store the start time of the attack
        this.duration = 100; // Duration of the attack in milliseconds
        this.startTime = this.scene.time.now;
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.Tossing = false;

    }

    update(time) {
       
    }

    hide() {
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
    }
}