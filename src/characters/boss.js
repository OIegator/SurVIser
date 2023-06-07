import Phaser from 'phaser';
import Character from './Character';

export default class Boss extends Character {
    constructor(scene, x, y, name, frame, maxHP, velocity = null) {
        super(scene, x, y, name, frame, velocity);
        this.maxHp = maxHP;
        this.hp = this.maxHp;
        this.fullWidth = 500;
    }

    initHealthBar(x, y) {

        // background shadow
        const leftShadowCap = this.scene.add
            .image(x, y, 'left-cap-shadow')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        const middleShadowCap = this.scene.add
            .image(leftShadowCap.x + leftShadowCap.width, y, 'middle-shadow')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        middleShadowCap.displayWidth = this.fullWidth;

        this.scene.add
            .image(middleShadowCap.x + middleShadowCap.displayWidth, y, 'right-cap-shadow')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        this.leftCap = this.scene.add
            .image(x, y, 'left-cap')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        this.middle = this.scene.add
            .image(this.leftCap.x + this.leftCap.width, y, 'middle')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        this.rightCap = this.scene.add
            .image(this.middle.x + this.middle.displayWidth, y, 'right-cap')
            .setScale(0.5)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        this.setMeterPercentage(0);
        this.setMeterPercentageAnimated(1);
    }

    setMeterPercentage(percent = 1) {
        this.middle.displayWidth = this.fullWidth * percent;
        this.rightCap.x = this.middle.x + this.middle.displayWidth;
    }

    setMeterPercentageAnimated(percent = 1, duration = 1000) {
        const width = this.fullWidth * percent;

        this.scene.tweens.add({
            targets: this.middle,
            displayWidth: width,
            duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.rightCap.x = this.middle.x + this.middle.displayWidth;

                this.leftCap.visible = this.middle.displayWidth > 0;
                this.middle.visible = this.middle.displayWidth > 0;
                this.rightCap.visible = this.middle.displayWidth > 0;
            },
        });
    }

    update(time) {
        super.update();
    }
}
