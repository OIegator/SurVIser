

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('pause');
    }


    resume() {
        const zeus_scene = this.scene.get('zeus');
        zeus_scene.onResume();
        this.scene.resume('zeus');
        this.scene.stop('pause');
    }

    create() {
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const player_config = this.registry.get('player_config');

        this.add.text(680, 80, 'PAUSE', {color: 'white', fontSize: '48pt', fontFamily: 'grobold'});


        const stats_background = this.add.image(590, 141, 'stats_background').setOrigin(0);
        this.add.image(600, 150, 'lvl_up_icon_background').setOrigin(0);
        this.add.image(615, 165, 'vi_icon').setOrigin(0);
        this.add.text(730, 175, 'STATS', {
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
            {field: 'dodgeRate', name: 'Dodge Rate'}
        ];

        player_stats.forEach((stat, index) => {
            const x = 640;
            const y = 280 + index * 45;

            const container = this.add.container(x, y);

            const statLabel = this.add.text(0, 0, stat.name, {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });

            const value = player_config[stat.field];
            const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);

            const valueLabel = this.add.text(245, 0, formattedValue, {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });

            container.add([statLabel, valueLabel]);
        });

    }

    update(time, delta) {
        super.update(time, delta);

        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.resume();
        }
    }

}
