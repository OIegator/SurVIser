import {LightningGroup} from "../src/LightningGroup";
import {BulletGroup} from "../src/BulletGroup";
import CharacterFactory from "../src/characters/character_factory"
import AutoAttack from "../src/projectiles/AutoAttack.js"
//======================FX===============
import PixelatedFX from '../assets/pipelines/PixelatedFX.js';
import BlurFX from '../assets/pipelines/BlurPostFX.js';
import Seek from "../src/ai/steerings/seek";
import HealthBar from "../src/UI-Bar/HealthBar";
import PowerUp from "../src/power-ups/power-up";
import Ordinary from "../src/characters/ordinary_mob";

let inZone = false;
const maxLower = 15;
let currLower = 0;

let ZeusScene = new Phaser.Class({

    Extends: Phaser.Scene, lightningGroup: undefined, bulletGroup: undefined, zeus: undefined,


    initialize: function ZeusScene() {
        Phaser.Scene.call(this, {key: 'zeus'});
    },

    gameover() {
        setTimeout(() => {
            this.scene.start('gameover');
        }, 2000);
    },

    pauseTimer() {
        this.isTimerPaused = true;
    },

    resumeTimer() {
        this.isTimerPaused = false;
    },

    lvlUP() {
        this.cameras.main.setPostPipeline(BlurFX);
        this.input.keyboard.off('keydown_SPACE', this.lvlUP);
        this.pauseTimer();
        this.scene.pause();
        this.scene.launch('lvl-up');
    },

    esc() {
        this.cameras.main.setPostPipeline(BlurFX);
        this.input.keyboard.off('keydown_ESC', this.esc);
        this.pauseTimer();
        this.scene.pause();
        this.scene.launch('pause');
    },

    showDamageNumber(x, y, damage, color, scale = '24') {
        const damageNumber = this.add.text(x, y, damage.toString(), {font: scale + 'px Squada One', fill: color});
        damageNumber.setStroke('#ffffff', 2);
        this.damageNumbers.add(damageNumber);

        this.tweens.add({
            targets: damageNumber,
            alpha: {start: 1, to: 0},
            ease: 'sine.in',
            duration: 1000
        });
        this.tweens.add({
            targets: damageNumber,
            y: {start: y, to: y + 50},
            ease: 'sine.out',
            duration: 1000
        });
        this.tweens.add({
            targets: damageNumber,
            scale: {start: 1, to: 1.5},
            ease: 'sine.out',
            yoyo: true,
            duration: 500
        });

        this.time.addEvent({
            delay: 1000,
            callback: function () {
                damageNumber.destroy();
            },
            callbackContext: this,
        });
    },

    onResume() {
        this.displayPowerUps();
        this.resumeTimer();
        this.cameras.main.resetPostPipeline();
    },

    EnemyAttack(x, y, attacker, size, offset, delay) {
        this.time.delayedCall(delay, () => {
            let add;
            if (attacker.scaleX < 0)
                add = offset;
            else
                add = -offset;
            const attack = new AutoAttack(this, x + add, y, 'smash');
            attack.body.setSize(size, size);
            this.enAttacks.push(attack);
            this.physics.add.collider(attack, this.worldLayer);
        });

    },

    create: function () {
        this.attacks = [];
        this.enemies = [];
        this.enAttacks = [];
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.gameObjects = [];
        this.damageNumbers = this.add.group();
        this.powerUpsGroup = this.physics.add.group();
        this.lightningGroup = new LightningGroup(this);
        this.bulletGroup = new BulletGroup(this);

        this.map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = this.map.addTilesetImage("Tileset_Grass", "tiles");
        const tileset2 = this.map.addTilesetImage("TX Tileset PrePreSnow", "tiles2");
        const tileset3 = this.map.addTilesetImage("TX Tileset Sand2", "tiles3");
        const tileset4 = this.map.addTilesetImage("TX Tileset Snow3", "tiles4");
        const tileset5 = this.map.addTilesetImage("Dungeon_Tileset", "tiles5");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        this.map.createLayer("Floor", [tileset, tileset2, tileset3, tileset4, tileset5], 0, 0);
        const worldLayer = this.map.createLayer("Walls", tileset, 0, 0);
        this.worldLayer = worldLayer;
        const aboveLayer = this.map.createLayer("Upper", tileset, 0, 0);
        this.tileSize = 32;

        // Setup for collisions
        worldLayer.setCollisionBetween(1, 500);
        aboveLayer.setDepth(10);

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.characterFactory = new CharacterFactory(this);

        // Creating characters
        this.player = this.characterFactory.buildCharacter('vi', 8014, 8014, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);
        this.registry.set('player_config', this.player.isConfig);

        this.zeus = this.characterFactory.buildZeus("zeus", 850, 580, 100);
        this.gameObjects.push(this.zeus);
        this.physics.add.collider(this.zeus, worldLayer);

        this.bers = this.characterFactory.buildBers("berserk", 15080, 15080, 100);
        this.gameObjects.push(this.bers);
        this.physics.add.collider(this.bers, worldLayer);

        this.golem = this.characterFactory.buildGolem("golem", 15080, 764, 100);
        this.gameObjects.push(this.golem);
        this.physics.add.collider(this.golem, worldLayer);

        const pinkies = this.characterFactory.buildOrdinaries('pinky');
        pinkies.forEach((pinky) => {
            this.gameObjects.push(pinky);

            this.physics.add.collider(
                pinky,
                this.player,
                () => {
                    // Delay the attack function by 1 second
                    this.time.delayedCall(1000, pinky.Attack, [], pinky);
                },
                null,
                this
            );

            this.physics.add.collider(pinky, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(pinky, enemy);
            });

            this.enemies.push(pinky);
        });

        const clydes = this.characterFactory.buildShooters('clyde');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });

        this.attack_timer = this.time.addEvent({
            delay: 2000,
            callback: function (args) {
                args.player.isAttacking = true;
                if (args.player.isAlive && (args.player.IsTossed === false)) {
                    args.time.delayedCall(260, () => {

                        let add;
                        if (args.player.sprite.scaleX < 0)
                            add = 100;
                        else
                            add = -100;
                        const attack = new AutoAttack(args, args.player.x + add, args.player.y + 30, 'attack');
                        args.attacks.push(attack);
                        args.physics.add.collider(attack, args.worldLayer);
                        attack.flipX = args.player.sprite.scaleX < 0;
                        attack.scaleX = 0.8 + 0.025 * args.player.isConfig.attackRange;
                        attack.scaleY = 0.5 + 0.025 * args.player.isConfig.attackRange;
                        if (args.player.powerUps.some(powerUp => powerUp.texture.key === 'lightning')) {
                            args.lightningGroup.fireLightning(args.player.x, args.player.y, args.enemies);
                        }
                    });
                }
            },
            callbackContext: this,
            args: [this],
            loop: true
        });

        const fullWidth = 1540;
        this.expBar = new HealthBar({
            scene: this,
            max: 500,
            current: 100,
            animate: true,
            damageColor: false,
            displayData: {
                fullWidth: fullWidth,
                x: 25,
                y: 15,
                color: "blue",
                isPixel: true
            }
        });

        this.canDamage = true;

        this.elapsedTime = 0;
        this.isTimerPaused = false;

        this.timerText = this.add.text(760, 30, '0:00', {
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'Squada One'
        });
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(11);
        this.lvlText = this.add.text(1500, 5, this.player.isConfig.lvl + " LVL", {
            color: 'white',
            fontSize: '16pt',
            fontFamily: 'Squada One'
        });
        this.lvlText.setScrollFactor(0);
        this.lvlText.setDepth(11);

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Pause the timer when the scene is paused
        this.events.on('pause', this.pauseTimer, this);

        // Resume the timer when the scene is resumed
        this.events.on('resume', this.resumeTimer, this);

        // this.powerUpsGroup.add(new PowerUp(this, 8114, 8000, 'lightning', 'shock_icon'));
        // this.powerUpsGroup.add(new PowerUp(this, 8214, 8000, 'armor', 'armor_icon'));
        // this.powerUpsGroup.add(new PowerUp(this, 8314, 8000, 'dd', 'dd_icon'));
        // this.powerUpsGroup.add(new PowerUp(this, 8414, 8000, 'magic', 'magic_icon'));

        this.iconDictionary = {};

        // this.sound.play("main_theme", {
        //     loop: true
        // });
    },

    expUP(xp) {
        this.expBar.resiveHealing(xp);
    },

    updateTimer() {
        if (!this.isTimerPaused) {
            this.elapsedTime += 1;

            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;

            let formattedTime = '';

            if (minutes > 9) {
                formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            this.timerText.setText('' + formattedTime);
            this.player.isConfig.time = formattedTime;
        }
    },

    displayPowerUps() {
        // Reset the count for each element in the dictionary
        for (const name in this.iconDictionary) {
            this.iconDictionary[name].count = 0;
        }

        this.player.isConfig.powerUps.forEach(function (powerUp) {
            const name = powerUp.name;

            // Increment the count if the icon already exists
            if (this.iconDictionary.hasOwnProperty(name)) {
                this.iconDictionary[name].count++;

                // Update the countText if count is greater than 1
                const count = this.iconDictionary[name].count;
                if (count > 1) {
                    this.iconDictionary[name].countText.setText(count.toString());
                } else {
                    this.iconDictionary[name].countText.setText('');
                }
            } else {
                // Create a new icon if it doesn't exist
                const key = powerUp.key;
                const x = 50 + Object.keys(this.iconDictionary).length * 50; // Calculate x position
                const y = 50;
                const icon = this.add.image(x, y, key).setScale(0.6).setScrollFactor(0).setDepth(11); // Set depth to 11

                // Create a text object to display the count
                const countText = this.add.text(x + 10, y + 10, '', {
                    font: '12px Squada One',
                    fill: '#000000'
                }).setStroke('#ffffff', 2).setScrollFactor(0).setDepth(11); // Set depth to 11

                // Add the icon and countText to a group or container for easy management
                const group = this.add.group();
                group.add(icon);
                group.add(countText);

                // Store the icon and count in the dictionary
                this.iconDictionary[name] = {
                    key: key,
                    icon: group,
                    count: 1,
                    countText: countText
                };
            }
        }, this);
    },


    update(time) {
        this.lvlText.setText(this.player.isConfig.lvl + ' LVL')
        this.lvlText.setStyle({
            color: 'white',
            fontSize: '16pt',
            fontFamily: 'Squada One'
        });
        this.timerText.setStyle({
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'Squada One'
        });

        if (!this.player.isAlive) {
            this.gameover();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.lvlUP();
        }

        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.esc();
        }

        if (this.lightningGroup) {
            this.lightningGroup.update(time); // Call the update method of the lightning group
        }

        if (this.bulletGroup) {
            this.bulletGroup.update(time); // Call the update method of the bullet group
        }

        if (this.attacks) {
            this.physics.overlap(this.attacks, this.enemies, (attack, mob) => {
                if (mob.constructor.name === "Shooter" && this.canDamage ){
                    mob.behaviour.GetHit();
                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                } else {
                    mob.gotDamage = true;
                }
            });
            this.attacks.forEach(function (element) {
                element.update(time);
            });
        }

        if (this.enAttacks) {
            this.physics.overlap(this.enAttacks, this.player, (attack) => {
                this.player.GetTossed(2, attack.x, attack.y)
            });
            this.enAttacks.forEach(function (element) {
                element.update(time);
            });
        }

        if (this.attacks) {

            this.physics.overlap(this.attacks, this.golem, ( ) => {
                if (this.canDamage) {
                    this.golem.behaviour.GetHit(25);

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.physics.overlap(this.attacks, this.bers, () => {
                if (this.canDamage) {
                    this.bers.behaviour.GetHit(25);

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.attacks.forEach(function (element) {
                element.update(time);
            });
        }

        if (this.attacks && this.zeus.isVulnerable) {

            this.physics.overlap(this.attacks, this.zeus, ( ) => {
                if (this.canDamage) {
                    this.zeus.behaviour.GetHit(25);

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.attacks.forEach(function (element) {
                element.update(time);
            });
        }


        if (this.gameObjects) {
            this.gameObjects.forEach((element) => {
                element.update(inZone);
            });
            const self = this;
            this.gameObjects.forEach(function (element, index, object) {
                if (element.constructor.name === "Lower") {
                    if (element.isDead) {
                        self.expUP(50);
                        element.destroy();
                        object.splice(index, 1);
                        currLower--;
                    }
                } else if (element.constructor.name === "Ordinary") {
                    if (element.isDead) {
                        self.expUP(210);
                        element.destroy();
                        object.splice(index, 1);
                    }
                } else if (element.constructor.name === "Shooter") {
                    if (element.isDead) {
                        self.expUP(80);
                        element.destroy();
                        object.splice(index, 1);
                    }
                } else {
                    if (element.isDead) {
                        element.destroy();
                        object.splice(index, 1);
                    }
                }
            });

            let i = currLower;
            while (i < maxLower) {
                const inky = this.characterFactory.buildLowerCharacter(this, "inky", this.player.x, this.player.y, this.cameras.main.width);
                this.gameObjects.push(inky);

                this.physics.add.collider(
                    inky.body,
                    this.player.body,
                    () => {
                        inky.Attack();
                    },
                    null,
                    this
                );

                this.physics.add.collider(inky, this.worldLayer);

                // Add collision between each enemy
                this.enemies.forEach((enemy) => {
                    this.physics.add.collider(inky, enemy);
                });

                this.enemies.push(inky);
                i++;
            }

            currLower = maxLower;

            this.gameObjects.forEach(function (element) {
                if (element.constructor.name === "Lower") {
                    element.outsideCameraCheck(self);
                }
            });
        }
    },

    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default ZeusScene