import {LightningGroup} from "../src/LightningGroup";
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

    Extends: Phaser.Scene, lightningGroup: undefined, zeus: undefined,


    initialize: function ZeusScene() {
        Phaser.Scene.call(this, {key: 'zeus'});
    },


    lowerColl(player, lower) {
        lower.gotDamage = true;
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

    onResume() {
        this.resumeTimer();
        this.cameras.main.resetPostPipeline();
        console.log(this.registry.get('player_config'));
    },

    create: function () {
        this.attacks = [];
        this.enemies = [];
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.gameObjects = [];
        this.powerUpsGroup = this.physics.add.group();
        this.lightningGroup = new LightningGroup(this);

        this.map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = this.map.addTilesetImage("Dungeon_Tileset", "tiles");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        this.map.createLayer("Floor", tileset, 0, 0);
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
        this.player = this.characterFactory.buildCharacter('vi', 140, 1100, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);
        this.registry.set('player_config', this.player.isConfig);

        this.zeus = this.characterFactory.buildZeus("zeus", 850, 580, 100);
        this.gameObjects.push(this.zeus);
        this.physics.add.collider(this.zeus, worldLayer);

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
            this.enemies.push(pinky);
        });


        this.centX = this.cameras.main.centerX;
        this.centY = this.cameras.main.centerY;
        this.camW = this.cameras.main.width;

        this.timer = this.time.addEvent({
            delay: 2000,
            callback: function (args) {
                args.player.isAttacking = true;
                if (args.player.isAlive) {
                    args.time.delayedCall(255, () => {

                        let add;
                        if (args.player.sprite.scaleX < 0)
                            add = 100;
                        else
                            add = -100;
                        const attack = new AutoAttack(args, args.player.x + add, args.player.y + 30, 'attack');
                        args.attacks.push(attack);
                        args.physics.add.collider(attack, args.worldLayer);
                        attack.flipX = args.player.sprite.scaleX < 0;
                        attack.scaleX = 0.8;
                        attack.scaleY = 0.5;
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

        this.timerText = this.add.text(800, 20, '0:00', {font: '32pt Squada One', fill: '#ffffff'});
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(11);

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

        this.powerUpsGroup.add(new PowerUp(this, 300, 1000, 'lightning'));
    },

    health() {
        this.expBar.resiveHealing(2);
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

    update(time) {

        if (!this.player.isAlive) {
            this.gameover();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log("pew");
            //this.player.GetHit(100);
            this.lvlUP();
        }

        if (this.lightningGroup) {
            this.lightningGroup.update(time); // Call the update method of the lightning group
        }

        if (this.attacks) {
            this.physics.overlap(this.attacks, this.enemies, (attack, mob) => {
                //this.lowerColl(attack, mob);
                mob.gotDamage = true;
            });
            this.attacks.forEach(function (element) {
                element.update(time);
            });
        }

        if (this.attacks && this.zeus.isVulnerable) {

            this.physics.overlap(this.attacks, this.zeus, (attack, mob) => {
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
                        self.health();
                        element.destroy();
                        object.splice(index, 1);
                        currLower--;
                    }
                } else if (element.constructor.name === "Ordinary") {
                    if (element.isDead) {
                        self.health();
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

            // let i = currLower;
            // while (i < maxLower) {
            //     const inky = this.characterFactory.buildLowerCharacter(this,"inky", this.centX, this.centY, this.camW)
            //     inky.setCircle(40);
            //     inky.setOffset(200, 210);
            //     this.gameObjects.push(inky);
            //     inky.setSteerings([
            //         new Seek(inky, [this.player], 1, this.player.maxSpeed, this.player.maxSpeed)
            //     ]);
            //     this.physics.add.collider(
            //         inky,
            //         this.player,
            //         () => {
            //             // Delay the attack function by 1 second
            //             this.time.delayedCall(100, inky.Attack, [], inky);
            //         },
            //         null,
            //         this
            //     );
            //     this.physics.add.collider(inky, this.worldLayer);
            //     this.enemies.push(inky);
            //     i++
            // }
            // currLower = maxLower;
        }
    },

    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default ZeusScene