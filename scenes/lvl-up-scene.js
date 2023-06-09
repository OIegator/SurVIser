import cursor from "../assets/sprites/ui/cursor.png";
import lvl_up_background from "../assets/sprites/ui/background_powerup.png";
import lvl_up_item_background from "../assets/sprites/ui/item_background_powerup.png";
import sword_power_up from "../assets/sprites/ui/sword_powerup.png";
import map_power_up from "../assets/sprites/ui/map_powerup.png";
import lvl_up_icon_background from "../assets/sprites/ui/icon_background_powerup.png";
import armor_power_up from "../assets/sprites/ui/armor_powerup.png";
import critical_power_up from "../assets/sprites/ui/critical_powerup.png";
import attack_speed_power_up from "../assets/sprites/ui/attackSpeed_powerup.png";
import critical_rate_power_up from "../assets/sprites/ui/criticalRate_powerup.png";
import dodge_rate_power_up from "../assets/sprites/ui/dodgeRate_powerup.png";
import attack_range_power_up from "../assets/sprites/ui/attackRange_powerup.png";
import stats_background from "../assets/sprites/ui/stats_background.png";
import vi_icon from "../assets/sprites/ui/vi_icon.png";
import star from "../assets/sprites/ui/star3.png";

export default class LvlUpScene extends Phaser.Scene {
    constructor() {
        super('lvl-up');
    }

    init() {
        let element = document.createElement('style');

        document.head.appendChild(element);

        element.sheet.insertRule('@font-face { font-family: "grobold"; src: url("assets/fonts/GROBOLD.ttf) format("truetype"); }', 0);
        element.sheet.insertRule('@font-face { font-family: "Passion One"; src: url("assets/fonts/PassionOne-Regular.ttf) format("truetype"); }', 0);
        element.sheet.insertRule('@font-face { font-family: "Squada One"; src: url("assets/fonts/SquadaOne-Regular.ttf) format("truetype"); }', 0);
    }


    preload() {
        this.load.image('cursor', cursor);
        this.load.image('lvl_up_background', lvl_up_background);
        this.load.image('lvl_up_item_background', lvl_up_item_background);
        this.load.image('sword_power_up', sword_power_up);
        this.load.image('map_power_up', map_power_up);
        this.load.image('armor_power_up', armor_power_up);
        this.load.image('critical_power_up', critical_power_up);
        this.load.image('critical_rate_power_up', critical_rate_power_up);
        this.load.image('dodge_rate_power_up', dodge_rate_power_up);
        this.load.image('attack_range_power_up', attack_range_power_up);
        this.load.image('attack_speed_power_up', attack_speed_power_up);
        this.load.image('lvl_up_icon_background', lvl_up_icon_background);
        this.load.image('stats_background', stats_background);
        this.load.image('vi_icon', vi_icon);
        this.load.image('star', star);
    }

    resume() {
        const zeus_scene = this.scene.get('zeus');
        zeus_scene.onResume();
        this.scene.resume('zeus');
        this.scene.stop('lvl-up');
    }

    create() {
        const player_config = this.registry.get('player_config');
        const powerUpsPool = [
            {
                name: 'Sharp blade',
                desc: 'Increases the character\'s\nstrength.',
                texture: {key: 'sword_power_up'},
                effect: {stat: 'strength', action: 3}
            },
            {
                name: 'Ancient armor',
                desc: 'Increases the character\'s\nmax HP.',
                texture: {key: 'armor_power_up'},
                effect: {stat: 'maxHP', action: 10}
            },
            {
                name: 'Accursed Blade',
                desc: 'Increases the character\'s\nattack speed.',
                texture: {key: 'attack_speed_power_up'},
                effect: {stat: 'attackSpeed', action: -0.5}
            },
            {
                name: 'Wizard\'s map',
                desc: 'Increases the character\'s\nspeed.',
                texture: {key: 'map_power_up'},
                effect: {stat: 'speed', action: 3}
            },
            {
                name: 'Critsight',
                desc: 'Increases the character\'s\ncritical damage.',
                texture: {key: 'critical_power_up'},
                effect: {stat: 'critical', action: 0.3}
            },
            {
                name: 'Red Cloverleaf',
                desc: 'Increases the character\'s\ncritical rate.',
                texture: {key: 'critical_rate_power_up'},
                effect: {stat: 'criticalRate', action: 0.1}
            },
            {
                name: 'Cloverleaf',
                desc: 'Increases the character\'s\ndodge rate.',
                texture: {key: 'dodge_rate_power_up'},
                effect: {stat: 'dodgeRate', action: 0.1}
            },
            {
                name: 'Mighty Blade',
                desc: 'Increases the character\'s\nattack range.',
                texture: {key: 'attack_range_power_up'},
                effect: {stat: 'attackRange', action: 2}
            },
        ];

        const emitter = this.add.particles(800, 100, 'star', {
            angle: {min: 240, max: 300},
            speed: {min: 200, max: 300},
            lifespan: 5000,
            gravityY: 180,
            quantity: 2,
            bounce: 0.4,
            bounds: new Phaser.Geom.Rectangle(-100, -200, 1590, 1060)
        });

        this.add.image(518, 81, 'lvl_up_background').setOrigin(0);
        this.add.text(640, 90, 'Level UP!', {color: 'white', fontSize: '48pt', fontFamily: 'grobold'});

        emitter.postFX.addBokeh(0.5, 10, 0.2);

        emitter.particleBringToTop = false;

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
            {field: 'dodgeRate', name: 'Dodge Rate'}
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

            const valueLabel = this.add.text(245, 0, player_config[stat.field].toString(), {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });

            container.add([statLabel, valueLabel]);
        });

        const powerUpsChoice = Phaser.Utils.Array.Shuffle(powerUpsPool).slice(0, 3); // Randomly select 3 power-ups from the dummy array

        const buttonContainer = [];

        powerUpsChoice.forEach((item, index) => {
            const x = 800;
            const y = 270 + index * 200;

            const container = this.add.container(x, y);

            const background = this.add.image(0, 0, 'lvl_up_item_background');
            const icon_bg = this.add.image(-146, -5, 'lvl_up_icon_background')
            const icon = this.add.image(-146, -5, item.texture.key);
            const nameLabel = this.add.text(-50, -80, item.name, {
                color: 'white',
                fontSize: '48px',
                fontFamily: 'Passion One'
            });
            const descLabel = this.add.text(-40, -25, item.desc, {
                color: 'white',
                fontSize: '24px',
                fontFamily: 'Squada One'
            });
            const cursorImage = this.add.image(200, 50, 'cursor').setVisible(false); // Create the cursor image and set it invisible

            container.add([background, icon_bg, icon, nameLabel, descLabel, cursorImage]);

            container.setSize(background.width, background.height);

            container.powerUp = item

            container.setInteractive()
                .on('pointerover', () => {
                    background.setTint(0x808080); // Устанавливаем темный оттенок при наведении курсора
                    cursorImage.setVisible(true);
                })
                .on('pointerout', () => {
                    background.clearTint(); // Очищаем оттенок при отведении курсора
                    cursorImage.setVisible(false);
                })
                .on('pointerdown', () => {
                    player_config[container.powerUp.effect.stat] = player_config[container.powerUp.effect.stat] + container.powerUp.effect.action;
                    player_config.powerUps.push(container.powerUp);
                    this.registry.set('player_config', player_config);
                    console.log(container.powerUp.name);
                    this.resume();
                });


            buttonContainer.push(container);
        });

        console.log(buttonContainer); // Displays all button containers in the console
    }
}
