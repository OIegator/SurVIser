export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super('credits');
    }

    create() {
        const player_config = this.registry.get('player_config');

        this.add.image(0, 0, 'menu_background').setOrigin(0);
        this.add.text(445, 710, 'Game Over', {
            color: 'red',
            fontSize: '96pt',
            fontFamily: 'grobold'
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
