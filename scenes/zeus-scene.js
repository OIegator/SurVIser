import {LightningGroup} from "../src/LightningGroup";
import CharacterFactory from "../src/characters/character_factory"
import AutoAttack from "../src/projectiles/AutoAttack.js"
//======================FX===============
import PixelatedFX from '../assets/pipelines/PixelatedFX.js';
import BlurFX from '../assets/pipelines/BlurPostFX.js';

let inZone = false;

let ZeusScene = new Phaser.Class({

    Extends: Phaser.Scene, lightningGroup: undefined, zeus: undefined,


    initialize: function StartingScene() {
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


    lvlUP ()
    {
        this.cameras.main.setPostPipeline(BlurFX);
        this.input.keyboard.off('keydown_SPACE', this.lvlUP);
        this.scene.pause();
        this.scene.launch('lvl-up');
    },

    onResume() {
        this.cameras.main.resetPostPipeline();
        console.log(this.registry.get('player_config'));
    },

    create: function () {

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.gameObjects = [];
        this.powerUpsGroup = this.physics.add.group();
        this.lightningGroup = new LightningGroup(this);

        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        map.createLayer("Floor", tileset, 0, 0);
        const worldLayer = map.createLayer("Walls", tileset, 0, 0);
        this.worldLayer = worldLayer;
        const aboveLayer = map.createLayer("Upper", tileset, 0, 0);
        this.tileSize = 32;

        // Setup for collisions
        worldLayer.setCollisionBetween(1, 500);
        aboveLayer.setDepth(10);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
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

        this.attacks = [];
        this.enemies = [];

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
                            const target = args.player.findNearestEnemy(args.enemies)
                            args.lightningGroup.fireLightning(args.player.x, args.player.y, target);
                        }
                    });
                }
            },
            callbackContext: this,
            args: [this],
            loop: true
        });

        this.canDamage = true;
    },


    update(time) {

        if (!this.player.isAlive) {
            this.gameover();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log("pew");
            this.player.GetHit(100);
            //this.lvlUP();
        }

        if (this.lightningGroup) {
            this.lightningGroup.update(time); // Call the update method of the lightning group
        }

        if (this.attacks) {
            this.physics.overlap(this.attacks, this.lowers, (attack, mob) => {
                this.lowerColl(attack, mob);
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
            this.gameObjects.forEach(function (element, index, object) {
                if (element.isDead) {
                    element.destroy();
                    object.splice(index, 1);
                }
            });
            this.gameObjects.forEach((element) => {
                element.update(inZone);
            });
        }
    },

    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default ZeusScene