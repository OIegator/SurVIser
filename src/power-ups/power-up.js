export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, key) {
        super(scene, x, y, name);
        const dict = {
            lightning: 0.4,
            armor: 0.25,
            dd: 1,
            magic: 0.3,
        };
        this.name = name;
        this.setScale(dict[name]);
        this.key = key;
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}
