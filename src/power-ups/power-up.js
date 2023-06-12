export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, key) {
        super(scene, x, y, name);
        this.setScale(0.4);
        this.key = key;
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}
