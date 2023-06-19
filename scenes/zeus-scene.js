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
import Projectile from "../src/projectiles/Projectile";
import PickUp from "../src/power-ups/pick-up";

let inZone = false;
const maxLower = 10;
let currLower = 0;

let ZeusScene = new Phaser.Class({

    Extends: Phaser.Scene, lightningGroup: undefined, bulletGroup: undefined, zeus: undefined, biomes: undefined,


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
        if (this.player.isAlive) {
            this.cameras.main.setPostPipeline(BlurFX);
            this.input.keyboard.off('keydown_SPACE', this.lvlUP);
            this.pauseTimer();
            this.scene.pause();
            this.scene.launch('lvl-up');
        }
    },

    esc() {
        this.cameras.main.setPostPipeline(BlurFX);
        this.input.keyboard.off('keydown_ESC', this.esc);
        this.pauseTimer();
        this.scene.pause();
        this.scene.launch('pause');
    },

    showDamageNumber(x, y, damage, color, scale = '24') {
        let damageText = damage.toString();
        if (typeof damage === 'number') {
            damageText = Math.floor(damage).toString();
        }
        const damageNumber = this.add.text(x, y, damageText, {font: scale + 'px Squada One', fill: color});
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

    ProjectAttack(x, y, attacker, delay, cond) {
        this.time.delayedCall(delay, () => {
            const difx = this.player.x - x;
            const dify = this.player.y - y;
            const c = Math.sqrt(difx * difx + dify * dify);
            const angle = Math.atan2(dify, difx) * 180 / Math.PI;
            let path = 0;
            if (cond)
                path = 190;
            else
                path = 170;
            const curve = new Phaser.Curves.Ellipse(x + difx / 2, y + dify / 2, -c / 2, 80, 0, path, cond, angle);
            const tempVec = new Phaser.Math.Vector2();
            const start = curve.getStartPoint();
            const distance = curve.getLength();
            const duration = 1500;
            const speed = distance / duration;
            const speedSec = 1000 * speed;
            const tSpeed = 1 / duration;

            const fire = new Projectile(this, start.x, start.y, 'fire');
            this.enAttacks.push(fire);
            fire.scale = 0.5;
            fire.flipX = true;
            fire.setCircle(50);
            fire.postFX.addGlow(0xffea00);
            fire.setOffset(80, 30);
            //fire.setRotation(angle);

            if (Math.abs(angle) < 90)
                fire.flipX = true;

            const resetFire = function (counter) {
                const start = curve.getStartPoint();
                fire.body.reset(start.x, start.y);
                updateFire(counter);
            };

            const destroyFire = function (counter) {
                fire.destroy();
            }

            const updateFire = function (counter) {
                const t = counter.getValue();
                if (fire != null) {
                    curve.getTangent(t, tempVec);
                    fire.body.velocity.copy(tempVec.scale(speedSec));
                    fire.setRotation(tempVec.angle());
                    //Rotate the fire. Пока отключил, потому что непонятно как сделать красиво
                    //ship.setRotation(tempVec.angle()/10.0);
                }
            };

            this.tweens.addCounter({
                duration: duration,
                loop: 0,
                onStart: resetFire,
                onComplete: destroyFire,
                onUpdate: updateFire,
            });
        });
    },

    EnemyAttack(x, y, attacker, size, offset, delay, key = 'smash') {
        this.time.delayedCall(delay, () => {
            let add;
            if (attacker.scaleX < 0)
                add = offset;
            else
                add = -offset;
            const attack = new AutoAttack(this, x + add, y, key);
            attack.body.setSize(size, size);
            if (attacker.constructor.name === "Golem")
                attack.isTossing = true;
            this.enAttacks.push(attack);
            this.physics.add.collider(attack, this.worldLayer);
        });

    },

    spawnPickUp(x, y) {
        const rnd = Math.floor(Math.random() * 100);
        let pickUp;
        switch (true) {
            case rnd <= 15:
                pickUp = new PickUp(this, x, y, 'heal', 'bigHeal');
                this.pickUps.push(pickUp);
                pickUp.scale = 0.8;
                pickUp.setDepth(1);
                pickUp.postFX.addGlow(0x00ff00);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 15 && rnd <= 50:
                pickUp = new PickUp(this, x, y, 'heal', 'heal');
                this.pickUps.push(pickUp);
                pickUp.scale = 0.6;
                pickUp.setDepth(1);
                pickUp.postFX.addGlow(0x00ff00);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 50 && rnd <= 75:
                pickUp = new PickUp(this, x, y, 'dmg', 'damage');
                this.pickUps.push(pickUp);
                pickUp.scale = 0.8;
                pickUp.setDepth(1);
                pickUp.postFX.addGlow(0xff0000);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 75 && rnd <= 100:
                pickUp = new PickUp(this, x, y, 'invc', 'invincible');
                this.pickUps.push(pickUp);
                pickUp.scale = 0.8;
                pickUp.setDepth(1);
                pickUp.postFX.addGlow(0x0000ff);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
        }

    },

    tacticalNuke() {
        //Add all enemies lists here
        this.enemies.forEach((element) => {
            if (this.cameras.main.worldView.contains(element.x, element.y)) {
                if (element.constructor.name === "Ordinary" ||
                    element.constructor.name === "Lower") {
                    element.GetHit(50);
                } else {
                    element.behaviour.GetHit(50);
                }

            }
        });
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

    createBiome(x, y, width, height, name) {
        const biome = this.add.rectangle(x, y, width, height, 0x000000);
        biome.setData('name', name);
        biome.setAlpha(0);
        return biome;
    },

    biomeCrossing(scene) {
        // Check for overlap between the player and biomes
        scene.biomes.getChildren().forEach(function (biome) {
            const biomeName = biome.getData('name');

            // Only process biomes that are different from the current biome
            if (biomeName !== scene.player.biome) {
                if (Phaser.Geom.Rectangle.Contains(biome.getBounds(), scene.player.x, scene.player.y)) {

                    scene.player.biome = biomeName;

                    if (!scene.biomeCrossed[biomeName]) {
                        console.log("Player crossed " + biomeName);

                        const pinkies = scene.characterFactory.buildOrdinaries('pinky', biomeName);
                        pinkies.forEach((pinky) => {
                            scene.gameObjects.push(pinky);

                            scene.physics.add.collider(
                                pinky,
                                scene.player,
                                () => {
                                    // Delay the attack function by 1 second
                                    scene.time.delayedCall(1000, pinky.Attack, [], pinky);
                                },
                                null,
                                scene
                            );

                            scene.physics.add.collider(pinky, scene.worldLayer);

                            // Add collision between each enemy
                            scene.enemies.forEach((enemy) => {
                                scene.physics.add.collider(pinky, enemy);
                            });

                            scene.enemies.push(pinky);
                        });

                        const clydes = scene.characterFactory.buildShooters('clyde', biomeName);
                        clydes.forEach((clyde) => {
                            scene.gameObjects.push(clyde);
                            scene.physics.add.collider(clyde, scene.worldLayer);

                            // Add collision between each enemy
                            scene.enemies.forEach((enemy) => {
                                scene.physics.add.collider(clyde, enemy);
                            });

                            scene.enemies.push(clyde);
                        });

                        scene.enemies.forEach(function (enemy) {
                            const enemyBiome = enemy.data.list.biome;
                            if (enemyBiome !== 'border' && (enemyBiome !== undefined || true)) {
                                if (enemyBiome !== biomeName) {
                                    enemy.setActive(false);
                                    enemy.setVisible(false);
                                }
                            }
                        });

                        scene.biomeCrossed[biomeName] = true;
                    } else {
                        console.log("You have already been in " + biomeName);

                        scene.enemies.forEach(function (enemy) {
                            const enemyBiome = enemy.data.list.biome;
                            if (enemyBiome !== 'border' && (enemyBiome !== undefined || true)) {
                                if (enemyBiome === biomeName) {
                                    enemy.setActive(true);
                                    enemy.setVisible(true);
                                }
                            }
                        });
                    }
                }
            }
        });
    },

    create: function () {
        this.attacks = [];
        this.enemies = [];
        this.enAttacks = [];
        this.pickUps = [];
        this.iconDictionary = {};
        this.biomes;
        this.biomeCrossed = {};
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
        this.player = this.characterFactory.buildCharacter('vi', this.physics.world.bounds.width / 2 + 30,  this.physics.world.bounds.height / 2 - 50, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);
        this.registry.set('player_config', this.player.isConfig);

        this.zeus = this.characterFactory.buildZeus("zeus",  1100, 1100, 100);
        this.gameObjects.push(this.zeus);
        this.physics.add.collider(this.zeus, worldLayer);

        this.bers = this.characterFactory.buildBers("berserk", this.physics.world.bounds.width - 1200, this.physics.world.bounds.height - 1200, 100);
        this.gameObjects.push(this.bers);
        this.physics.add.collider(this.bers, worldLayer);

        this.golem = this.characterFactory.buildGolem("golem", this.physics.world.bounds.width - 1100 , 1100, 100);
        this.gameObjects.push(this.golem);
        this.physics.add.collider(this.golem, worldLayer);

        this.wizard = this.characterFactory.buildWizard("wizard", 1200, this.physics.world.bounds.height - 1200, 100);
        this.gameObjects.push(this.wizard);
        this.physics.add.collider(this.wizard, worldLayer);

        // this.gary = this.characterFactory.buildGary("gary", this.physics.world.bounds.width / 2 + 500, this.physics.world.bounds.height / 2 - 500, 100);
        // this.gameObjects.push(this.gary);
        // this.physics.add.collider(this.gary, worldLayer);

        let pinkies = this.characterFactory.buildOrdinaries('pinky');
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

        let clydes = this.characterFactory.buildShooters('clyde');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });

        // !!!Danger!!!
        // Next code will spawn all biomes at once
        pinkies = this.characterFactory.buildOrdinaries('pinky', 'tundra');
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

        clydes = this.characterFactory.buildShooters('clyde', 'tundra');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });
        pinkies = this.characterFactory.buildOrdinaries('pinky', 'meadow');
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

        clydes = this.characterFactory.buildShooters('clyde', 'meadow');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });
        pinkies = this.characterFactory.buildOrdinaries('pinky', 'desert');
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

        clydes = this.characterFactory.buildShooters('clyde', 'desert');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });
        pinkies = this.characterFactory.buildOrdinaries('pinky', 'castle');
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

        clydes = this.characterFactory.buildShooters('clyde', 'castle');
        clydes.forEach((clyde) => {
            this.gameObjects.push(clyde);
            this.physics.add.collider(clyde, worldLayer);

            // Add collision between each enemy
            this.enemies.forEach((enemy) => {
                this.physics.add.collider(clyde, enemy);
            });

            this.enemies.push(clyde);
        });
        //////////////////
        /////////////////


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
                        let attack = new AutoAttack(args, args.player.x + add, args.player.y + 30, 'attack');
                        args.attacks.push(attack);
                        args.physics.add.collider(attack, args.worldLayer);
                        attack.flipX = args.player.sprite.scaleX < 0;
                        attack.scaleX = 0.8 + 0.025 * args.player.isConfig.attackRange;
                        attack.scaleY = 0.5 + 0.025 * args.player.isConfig.attackRange;
                        if (args.player.powerUps.some(powerUp => powerUp.texture.key === 'lightning')) {
                            args.lightningGroup.fireLightning(args.player.x, args.player.y, args.enemies);
                        }
                        if (args.player.powerUps.some(powerUp => powerUp.texture.key === 'dd')) {
                            attack = new AutoAttack(args, args.player.x - (add * 1.4), args.player.y + 30, 'attack');
                            args.attacks.push(attack);
                            args.physics.add.collider(attack, args.worldLayer);
                            attack.flipX = args.player.sprite.scaleX > 0;
                            attack.scaleX = 0.8 + 0.025 * args.player.isConfig.attackRange;
                            attack.scaleY = 0.5 + 0.025 * args.player.isConfig.attackRange;
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

        // this.sound.play("main_theme", {
        //     loop: true
        // });

        // this.biomes = this.add.group();
        // this.biomes.add(this.createBiome(3450, 3400, 6900, 6800, 'desert'));
        // this.biomes.add(this.createBiome(12300, 12200, 7400, 7600, 'tundra'));
        // this.biomes.add(this.createBiome(3700, 12600, 7400, 8600, 'meadow'));
        // this.biomes.add(this.createBiome(12800, 3200, 6800, 6400, 'castle'));

        // this.biomes.add(this.createBiome(1600, 1300, 3200, 2900, 'desert'));
        // this.biomes.add(this.createBiome(6500, 5700, 3200, 2900, 'tundra'));
        // this.biomes.add(this.createBiome(1600, 5700, 3200, 2900, 'meadow'));
        // this.biomes.add(this.createBiome(6500, 1300, 3200, 2900, 'castle'));
        // const self = this;
        //
        // this.biomes.getChildren().forEach(function (biome) {
        //     const biomeName = biome.getData('name');
        //     self.biomeCrossed[biomeName] = false;
        // });
    },

    update(time) {
        //this.biomeCrossing(this);

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
            //this.lvlUP();
            //this.player.healthBar.highColor = 0x0000ff;
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
                if (mob.constructor.name === "Shooter" && this.canDamage) {
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
                if (element.constructor.name !== "ShockCircle")
                    element.update(time);
            });
        }

        if (this.enAttacks) {
            this.physics.overlap(this.enAttacks, this.player, (attack, mob) => {
                if (attack.isTossing)
                    this.player.GetTossed(2, attack.x, attack.y)
                else
                    this.player.GetHit(2);
            });
            this.enAttacks.forEach(function (element) {
                element.update(time);
            });
        }

        if (this.attacks) {

            this.physics.overlap(this.attacks, this.golem, () => {
                if (this.canDamage) {
                    this.golem.behaviour.GetHit(this.player.calculateDamage());

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            // this.physics.overlap(this.attacks, this.gary, () => {
            //     if (this.canDamage && this.gary.isVulnerable) {
            //         this.gary.behaviour.GetHit(25);
            //
            //         this.canDamage = false; // Set the flag false to prevent further damage
            //         setTimeout(() => {
            //             this.canDamage = true; // Set the flag to true after the delay
            //         }, 1500); // 1.5 seconds delay
            //     }
            // });

            this.physics.overlap(this.attacks, this.wizard, (attack, mob) => {
                if (this.canDamage) {
                    this.wizard.behaviour.GetHit(this.player.calculateDamage());
                    //this.player.addFireBonus();

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.physics.overlap(this.attacks, this.bers, () => {
                if (this.canDamage) {
                    this.bers.behaviour.GetHit();

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.attacks.forEach(function (element) {
                if (element.constructor.name !== "ShockCircle")
                    element.update(time);
            });
        }

        if (this.attacks) {

            this.physics.overlap(this.attacks, this.zeus, () => {
                if (!this.zeus.isVulnerable && this.zeus.isAlive)
                    this.showDamageNumber(this.zeus.x, this.zeus.y, 'UNVULNERABLE', '#2E86C1', 32);
                if (this.canDamage) {
                    this.zeus.behaviour.GetHit();

                    this.canDamage = false; // Set the flag false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.attacks.forEach(function (element) {
                if (element.constructor.name !== "ShockCircle")
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
                        const rand = Math.random() * 100;
                        if (rand <= 3)
                            self.spawnPickUp(element.x, element.y);
                        self.expUP(50);
                        element.destroy();
                        object.splice(index, 1);
                        currLower--;
                    }
                } else if (element.constructor.name === "Ordinary") {
                    if (element.isDead) {
                        const rand = Math.floor(Math.random() * 3);
                        if (rand === 1)
                            self.spawnPickUp(element.x, element.y);
                        self.expUP(210);
                        element.destroy();
                        object.splice(index, 1);
                    }
                } else if (element.constructor.name === "Shooter") {
                    if (element.isDead) {
                        const rand = Math.floor(Math.random() * 3);
                        if (rand === 1)
                            self.spawnPickUp(element.x, element.y);
                        self.expUP(80);
                        element.destroy();
                        object.splice(index, 1);
                    }
                } else {
                    if (element.isDead) {
                        const rand = Math.floor(Math.random() * 3);
                        if (rand === 1)
                            self.spawnPickUp(element.x, element.y);
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