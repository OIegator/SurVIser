export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, key) {
        super(scene, x, y, name);
        const dictScale = {
            lightning: 0.4,
            armor: 0.6,
            dd: 1,
            magic: 0.3,
        };
        const dictColor = {
            lightning: 0xf0d700,
            armor: 0xb2bed3,
            dd: 0xffffff,
            magic: 0x00f6d0,
        };
        this.name = name;
        this.setScale(dictScale[name]);
        this.postFX.addGlow(dictColor[name]);
        this.key = key;
       // this.postFX.addBloom();
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
}