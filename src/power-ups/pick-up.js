export default class PickUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, key) {
        super(scene, x, y, name);
        this.name = key;
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}
