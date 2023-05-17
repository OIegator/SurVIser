import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/big_dungeon_room.json'

import viSpriteSheet from '../assets/sprites/characters/vi.png'
import zeusSpriteSheet from '../assets/sprites/characters/zeus.png'
import inkySpriteSheet from '../assets/sprites/characters/inky.png'
import pinkySpriteSheet from '../assets/sprites/characters/pinky.png'
import clydeSpriteSheet from '../assets/sprites/characters/clyde.png'
import blinkySpriteSheet from '../assets/sprites/characters/blinky.png'
import berserkSpriteSheet from '../assets/sprites/characters/berserk.png'
import garySpriteSheet from '../assets/sprites/characters/gary.png'
import rockSpriteSheet from '../assets/sprites/characters/rock.png'
import sansSpriteSheet from '../assets/sprites/characters/sans.png'
import wizardSpriteSheet from '../assets/sprites/characters/wizard.png'

import CharacterFactory from "../src/characters/character_factory"
import {Wander} from "../src/ai/steerings/wander";

var inZone = false;

let StartingScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'StartingScene'});
    },

    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    viFrameConfig: {frameWidth: 305, frameHeight: 305},
    zeusFrameConfig: {frameWidth: 683, frameHeight: 500},
    inkyFrameConfig: {frameWidth: 476, frameHeight: 476},
    pinkyFrameConfig: {frameWidth: 403, frameHeight: 403},
    clydeFrameConfig: {frameWidth: 341, frameHeight: 341},
    blinkyFrameConfig: {frameWidth: 357, frameHeight: 357},
    berserkFrameConfig: {frameWidth: 500, frameHeight: 500},
    garyFrameConfig: {frameWidth: 500, frameHeight: 500},
    rockFrameConfig: {frameWidth: 996, frameHeight: 709},
    sansFrameConfig: {frameWidth: 324, frameHeight: 324},
    wizardFrameConfig: {frameWidth: 500, frameHeight: 500},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

        //loading spritesheets
        this.load.spritesheet('vi', viSpriteSheet, this.viFrameConfig);
        this.load.spritesheet('zeus', zeusSpriteSheet, this.zeusFrameConfig);
        this.load.spritesheet('inky', inkySpriteSheet, this.inkyFrameConfig);
        this.load.spritesheet('pinky', pinkySpriteSheet, this.pinkyFrameConfig);
        this.load.spritesheet('clyde', clydeSpriteSheet, this.clydeFrameConfig);
        this.load.spritesheet('blinky', blinkySpriteSheet, this.blinkyFrameConfig);
        this.load.spritesheet('berserk', berserkSpriteSheet, this.berserkFrameConfig);
        this.load.spritesheet('gary', garySpriteSheet, this.garyFrameConfig);
        this.load.spritesheet('rock', rockSpriteSheet, this.rockFrameConfig);
        this.load.spritesheet('sans', sansSpriteSheet, this.sansFrameConfig);
        this.load.spritesheet('wizard', wizardSpriteSheet, this.wizardFrameConfig);
    },

    create: function () {
        this.gameObjects = [];
        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        map.createLayer("Floor", tileset, 0, 0);
        const worldLayer = map.createLayer("Walls", tileset, 0, 0);
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
        this.player = this.characterFactory.buildCharacter('vi', 100, 100, {player: true});
        this.player.body.setSize(120, 150);
        this.player.body.setOffset(100, 130);
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);
        this.player.setCollideWorldBounds();

        const zeus = this.characterFactory.buildNonPlayerCharacter("zeus", 1150, 180);
        this.gameObjects.push(zeus);
        zeus.setSteerings([
         //   new Wander(zeus, [this.player], 1)
        ]);
        this.physics.add.collider(zeus, worldLayer);

        const inky = this.characterFactory.buildNonPlayerCharacter("inky", 500, 200);
        this.gameObjects.push(inky);
        inky.setSteerings([
          //  new Wander(inky, [this.player], 1)
        ]);
        this.physics.add.collider(inky, worldLayer);

        const pinky = this.characterFactory.buildNonPlayerCharacter("pinky", 200, 200);
        pinky.body.setSize(150, 150);
        pinky.body.setOffset(140, 200);
        this.physics.add.collider(this.player, pinky);
        this.gameObjects.push(pinky);
        pinky.setSteerings([
          //  new Wander(pinky, [this.player], 1)
        ]);
        this.physics.add.collider(pinky, worldLayer);

        const clyde = this.characterFactory.buildNonPlayerCharacter("clyde", 300, 200);
        this.gameObjects.push(clyde);
        clyde.setSteerings([
          //  new Wander(clyde, [this.player], 1)
        ]);
        this.physics.add.collider(clyde, worldLayer);

        const blinky = this.characterFactory.buildNonPlayerCharacter("blinky", 400, 200);
        this.gameObjects.push(blinky);
        blinky.setSteerings([
          //  new Wander(blinky, [this.player], 1)
        ]);
        this.physics.add.collider(blinky, worldLayer);

        const berserk = this.characterFactory.buildNonPlayerCharacter("berserk", 650, 190);
        this.gameObjects.push(berserk);
        berserk.setSteerings([
           // new Wander(berserk, [this.player], 1)
        ]);
        this.physics.add.collider(berserk, worldLayer);

        const gary = this.characterFactory.buildNonPlayerCharacter("gary", 1300, 180);
        this.gameObjects.push(gary);
        gary.setSteerings([
            //new Wander(gary, [this.player], 1)
        ]);
        this.physics.add.collider(gary, worldLayer)

        const rock = this.characterFactory.buildNonPlayerCharacter("rock", 850, 140);
        this.gameObjects.push(rock);
        rock.setSteerings([
            new Wander(rock, [this.player], 1)
        ]);
        this.physics.add.collider(rock, worldLayer);

        const sans = this.characterFactory.buildNonPlayerCharacter("sans", 1430, 220);
        this.gameObjects.push(sans);
        sans.setSteerings([
            //new Wander(sans, [this.player], 1)
        ]);
        this.physics.add.collider(sans, worldLayer);

        const wizard = this.characterFactory.buildNonPlayerCharacter("wizard", 1030, 180);
        this.gameObjects.push(wizard);
        wizard.setSteerings([
            //new Wander(wizard, [this.player], 1)
        ]);
        this.physics.add.collider(wizard, worldLayer);

        this.input.keyboard.on("keydown_D", () => {
            // Turn on physics debugging to show player's hit-box
            this.physics.world.createDebugGraphic();
        });

        this.physics.add.overlap(this.player, zeus, function (){
            inZone = true;
        })


    },
    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach(function (element) {
                element.update(inZone);
            });
        }
        inZone = false;
    },
    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default StartingScene