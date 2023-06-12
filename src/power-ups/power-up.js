export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame, key) {
        super(scene, x, y, name, frame);
        const dict = {
            lightning: 0.4,
            armor: 0.3,
            dd: 1,
            magic: 0.5,
        };
        this.name = name;
        this.setScale(dict[name]);
        this.key = key;
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}
