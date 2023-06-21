

export default class LvlUpScene extends Phaser.Scene {
    constructor() {
        super('lvl-up');
    }

    resume() {
        const zeus_scene = this.scene.get('zeus');
        zeus_scene.expBar._reset();
        zeus_scene.onResume();
        this.scene.resume('zeus');
        this.scene.stop('lvl-up');
    }

    create() {
        this.sound.play('lvlup_sound');
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
                effect: {stat: 'attackSpeed', action: 1}
            },
            {
                name: 'Hermes boot',
                desc: 'Increases the character\'s\nspeed.',
                texture: {key: 'speed_power_up'},
                effect: {stat: 'moveSpeed', action: 1}
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
                effect: {stat: 'attackRange', action: 1}
            },
        ];

        const emitter = this.add.particles(800, 100, 'star', {
            angle: {min: 240, max: 300},
            speed: {min: 250, max: 300},
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

            const value = player_config[stat.field];
            const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);

            const valueLabel = this.add.text(245, 0, formattedValue, {
                color: 'white',
                fontSize: '32px',
                fontFamily: 'Squada One'
            });


            container.add([statLabel, valueLabel]);
        });

        const powerUpsChoice = Phaser.Utils.Array.Shuffle(powerUpsPool).slice(0, 3); // Randomly select 3 power-ups from the dummy array

        this.buttonContainer = [];

        powerUpsChoice.forEach((item, index) => {
            const x = 800;
            const y = 270 + index * 200;

            const container = this.add.container(x, y);

            item.key = item.texture.key;

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

            container.add([background, icon_bg, icon, nameLabel, descLabel]);

            container.setSize(background.width, background.height);

            container.powerUp = item;

            this.buttonContainer.push(container);
        });

        let selectedButtonIndex = 0;
        let selectedButton = this.buttonContainer[selectedButtonIndex];
        const backgroundImages = this.buttonContainer.map((container) => container.getAt(0));

        const updateButtonTint = () => {
            backgroundImages.forEach((image, index) => {
                image.clearTint();
                if (index === selectedButtonIndex) {
                    image.setTint(0xE59866);
                }
            });
        };

        updateButtonTint();

        // Handle keyboard input
        this.input.keyboard.on('keydown', (event) => {
            const { code } = event;
            const previousButton = selectedButton;

            // Remove tint from the previously selected button
            previousButton.list.forEach(() => {
                updateButtonTint();
            });

            // Change selection based on keyboard input
            if (code === 'ArrowUp' || code === 'KeyW') {
                selectedButtonIndex = (selectedButtonIndex - 1 + this.buttonContainer.length) % this.buttonContainer.length;
            } else if (code === 'ArrowDown' || code === 'KeyS') {
                selectedButtonIndex = (selectedButtonIndex + 1) % this.buttonContainer.length;
            }

            // Apply tint to the newly selected button
            selectedButton = this.buttonContainer[selectedButtonIndex];
            selectedButton.list.forEach(() => {
                updateButtonTint()
            });

            // Handle button selection
            if (code === 'Space' || code === 'Enter') {
                this.sound.play('btn2_sound');
                const container = this.buttonContainer[selectedButtonIndex];
                const button = container.powerUp;
                player_config[button.effect.stat] += button.effect.action;
                player_config.powerUps.push(button);
                this.registry.set('player_config', player_config);
                this.resume();
            }
            updateButtonTint();
        });

        this.buttonContainer.forEach((container, index) => {
            container.setInteractive()
                .on('pointerover', () => {
                    selectedButtonIndex = index;
                    updateButtonTint();
                })
                .on('pointerout', () => {
                    // If the pointer is not over any button, maintain the current selection
                    updateButtonTint();
                })
                .on('pointerup', () => { // Changed from 'pointerdown' to 'pointerup'
                    this.sound.play('btn2_sound');
                    player_config[container.powerUp.effect.stat] = player_config[container.powerUp.effect.stat] + container.powerUp.effect.action;
                    player_config.powerUps.push(container.powerUp);
                    this.registry.set('player_config', player_config);
                    this.resume();

                    updateButtonTint();
                });
        });
    }

}
