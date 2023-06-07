export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        this.setScale(0.4);
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}
