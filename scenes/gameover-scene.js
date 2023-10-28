export default class GameOverScene extends Phaser.Scene {

    handlerScene = null
    sceneStopped = false
    constructor() {
        super('gameover');
    }

    preload() {
        this.width = this.game.screenBaseSize.width;
        this.height = this.game.screenBaseSize.height;

        this.handlerScene = this.scene.get('handler');
        this.handlerScene.sceneRunning = 'gameover';
        this.sceneStopped = false;
    }

    create() {
        const  width = this.handlerScene.scale.width;
        const  height = this.handlerScene.scale.height;
        // CONFIG SCENE
        this.handlerScene.updateResize(this)
        // CONFIG SCENE

        const player_config = this.registry.get('player_config');

        const bg = this.add.image(0, 0, 'gameover_background').setOrigin(0);
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        bg.setScale(scaleX, scaleY );
        this.add.text(445 * scaleX, 710 * scaleY, 'Game Over', {
            color: 'red',
            fontSize: '96pt',
            fontFamily: 'grobold'
        });

        // Restart Button
        const restartButton = this.add.image(1385 * scaleX, 780 * scaleY, 'red_btn');
        this.add.text(1420 * scaleY, 740 * scaleY, 'RESTART', {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'grobold'
        });
        restartButton.setInteractive();

        restartButton.on('pointerup', () => {
            this.scene.stop('gameover');
            this.scene.stop('zeus');
            this.scene.start('zeus');
        });
        restartButton.on('pointerover', () => {
            restartButton.setTint(0x7DCEA0); // Apply darker tint
        })
            .on('pointerout', () => {
                restartButton.clearTint(); // Remove tint
            })

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.stop('gameover');
            this.scene.stop('zeus');
            this.scene.start('zeus');
        });

        const stats_background = this.add.image(50, 81, 'stats_background').setOrigin(0);
        this.add.image(60, 90, 'lvl_up_icon_background').setOrigin(0);
        this.add.image(75, 105, 'vi_icon').setOrigin(0);
        this.add.text(190, 115, 'STATS', {
            color: 'white',
            fontSize: '48pt',
            fontFamily: 'grobold'
        });
        stats_background.setAlpha(0.5);

        const player_stats = [
            {field: 'maxHP', name: 'Max HP'},
            {field: 'strength', name: 'Strength'},
            {field: 'moveSpeed', name: 'Move Speed'},
            {field: 'attackSpeed', name: 'Attack Speed'},
            {field: 'attackRange', name: 'Attack Range'},
            {field: 'critical', name: 'Critical'},
            {field: 'criticalRate', name: 'Critical Rate'},
            {field: 'dodgeRate', name: 'Dodge Rate'},
            {field: 'time', name: 'Total time'}
        ];

        player_stats.forEach((stat, index) => {
            const x = 90;
            const y = 220 + index * 45;

            const container = this.add.container(x, y);

            const statLabel = this.add.text(0, 0, stat.name, {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });

            const value = player_config[stat.field];
            let formattedValue;

            if (typeof value === "string") {
                formattedValue = value;
            } else if (typeof value === "number") {
                if (Number.isInteger(value)) {
                    formattedValue = value.toString();
                } else {
                    formattedValue = value.toFixed(1);
                }
            } else {
                // Handle other types if necessary
                formattedValue = value.toString();
            }


            const valueLabel = this.add.text(245, 0, formattedValue, {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });

            container.add([statLabel, valueLabel]);
        });


    }
}
