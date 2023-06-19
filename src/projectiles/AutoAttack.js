import slash from '../../assets/sprites/projectile/Splash.png'

export default class AutoAttack extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name)  {
        super(scene, x, y, name);
        this.startTime = 0; // Store the start time of the attack
        this.duration = 100; // Duration of the attack in milliseconds
        this.startTime = this.scene.time.now;
        this.affectedEnemies = [];
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    update(time) {
        if (this.active && time > this.startTime + this.duration) {
            this.hide();
        }
    }

    hide() {
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
    }
}