import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/big_dungeon_room.json'

import viSpriteSheet from '../assets/sprites/characters/vi.png'
import zeusSpriteSheet from '../assets/sprites/characters/zeus.png'
import shockCircleSpriteSheet from '../assets/sprites/projectile/shock.png'
import Vector2 from 'phaser/src/math/Vector2';

//======================Projectiles===========================
import lightning from '../assets/sprites/projectile/Weapon.png'
import slash from '../assets/sprites/projectile/Splash.png'
//=======================HealthBar============================
import barHorizontal_red_left from '../assets/sprites/ui/BarHorizontal_red_left.png'
import barHorizontal_red_mid from '../assets/sprites/ui/BarHorizontal_red_mid.png'
import barHorizontal_red_right from '../assets/sprites/ui/BarHorizontal_red_right.png'
import barHorizontal_red_left_shadow from '../assets/sprites/ui/BarHorizontal_red_left_shadow.png'
import barHorizontal_red_mid_shadow from '../assets/sprites/ui/BarHorizontal_red_mid_shadow.png'
import barHorizontal_red_right_shadow from '../assets/sprites/ui/BarHorizontal_red_right_shadow.png'
//============================================================
import {LightningGroup} from "../src/LightningGroup";
import CharacterFactory from "../src/characters/character_factory"
import AutoAttack from "../src/projectiles/AutoAttack.js"


let inZone = false;


let ZeusScene = new Phaser.Class({

    Extends: Phaser.Scene, lightningGroup: undefined, zeus: undefined,


    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'StartingScene'});
    },

    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    viFrameConfig: {frameWidth: 305, frameHeight: 305},
    zeusFrameConfig: {frameWidth: 683, frameHeight: 500},


    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

        //loading spritesheets
        this.load.spritesheet('vi', viSpriteSheet, this.viFrameConfig);
        this.load.spritesheet('zeus', zeusSpriteSheet, this.zeusFrameConfig);
        this.load.spritesheet('shock_circle', shockCircleSpriteSheet, {frameWidth: 240, frameHeight: 240});

        //loading health bar
        this.load.image('left-cap', barHorizontal_red_left)
        this.load.image('middle', barHorizontal_red_mid)
        this.load.image('right-cap', barHorizontal_red_right)

        this.load.image('left-cap-shadow', barHorizontal_red_left_shadow)
        this.load.image('middle-shadow', barHorizontal_red_mid_shadow)
        this.load.image('right-cap-shadow', barHorizontal_red_right_shadow)

        this.load.image('lightning', lightning);
        this.load.image('attack', slash);
    },

    lowerColl(player, lower) {
        lower.gotDamage = true;
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
        this.player.speed = new Vector2(1);
        this.player.body.setSize(120, 150);
        this.player.body.setOffset(100, 130);
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);
        this.player.setCollideWorldBounds();

        this.zeus = this.characterFactory.buildZeus("zeus", 850, 580, 100);
        this.gameObjects.push(this.zeus);
        this.physics.add.collider(this.zeus, worldLayer);

        this.attacks = [];
        this.enemies = [];

        this.timer = this.time.addEvent({
            delay: 2000,
            callback: function (args) {
                args.player.isAttacking = true;
                args.time.delayedCall(255, () => {

                    let add;
                    if (args.player.scaleX < 0)
                        add = 100;
                    else
                        add = -100;
                    const attack = new AutoAttack(args, args.player.x + add, args.player.y + 30, 'attack');
                    args.attacks.push(attack);
                    args.physics.add.collider(attack, args.worldLayer);
                    attack.flipX = args.player.scaleX < 0;
                    attack.scaleX = 0.8;
                    attack.scaleY = 0.5;
                    if (args.player.powerUps.some(powerUp => powerUp.texture.key === 'lightning')) {
                        const target = args.player.findNearestEnemy(args.enemies)
                        args.lightningGroup.fireLightning(args.player.x, args.player.y - 60, target);
                    }
                });

            },
            callbackContext: this,
            args: [this],
            loop: true
        });

        this.canDamage = true;
    },

    update(time) {

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log("pew");
            this.lightningGroup.fireLightning(this.player.x, this.player.y - 60, this.zeus);
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
                    console.log("hit");
                    this.zeus.behaviour.GetHit(25);

                    this.canDamage = false; // Set the flag to false to prevent further damage
                    setTimeout(() => {
                        this.canDamage = true; // Set the flag to true after the delay
                    }, 1500); // 1.5 seconds delay
                }
            });

            this.attacks.forEach(function (element) {
                element.update(time);
            });
        }

        this.player.checkPowerUpCollision(this.powerUpsGroup);

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