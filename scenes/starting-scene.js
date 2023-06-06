import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/big_dungeon_room.json'

import viSpriteSheet from '../assets/sprites/characters/vi.png'
import zeusSpriteSheet from '../assets/sprites/characters/zeus.png'
import shockCircleSpriteSheet from '../assets/sprites/projectile/shock.png'
import Vector2 from 'phaser/src/math/Vector2';

//======================Projectiles===========================
import lightning from '../assets/sprites/projectile/Weapon.png'

//============================================================

import {LightningGroup} from "../src/LightningGroup";
import CharacterFactory from "../src/characters/character_factory"
import {Patrol} from "../src/ai/steerings/patrol";
import {Wander} from "../src/ai/steerings/wander";
import {Pursuit} from "../src/ai/steerings/pursuit";
import {Evade} from "../src/ai/steerings/evade";
import {BehaviourTree, State} from "mistreevous";


let inZone = false;


let StartingScene = new Phaser.Class({

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

        this.load.image('lightning', lightning);
    },

    lowerColl(player, lower) {
        lower.gotDamage = true;
    },

    create: function () {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.gameObjects = [];
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

        this.zeus = this.characterFactory.buildZeus("zeus", 850, 580);
        this.gameObjects.push(this.zeus);
        this.physics.add.collider(this.zeus, worldLayer);
        this.zeus.patrol();
        this.physics.add.overlap(this.player, this.zeus, function (){
            inZone = true;
        })


        const treeDefinition = `root {
            selector {
                sequence {
                    condition [EnemyFar]
                    action [Patrol]
                }
                sequence {
                    condition [EnemyClose]
                    action [Pursuit]
                }
                sequence {
                    condition [CanAttack]
                    action [Attack]
                }
            }
        }`;

        const zeusActions = {
            Patrol: () => {
                //console.log("Zeus is patrol!");
                this.zeus.patrol();
                return State.SUCCEEDED;
            },
            Pursuit: () => {
                //console.log("Zeus is falling!");
                this.zeus.pursuit(this.player);
                return State.SUCCEEDED;
            },
            Attack: () => {
                //console.log("Zeus is laughing!");
                this.zeus.attack(this.lightningGroup);
                this.zeus.changeState("patrol")
                return State.SUCCEEDED;
            },
            EnemyFar: () => {
                return this.zeus.state === "patrol";
            },
            EnemyClose: () => {
                return this.zeus.state === "pursuit";
            },
            CanAttack: () => {
                return this.zeus.state === "attack";
            }
        };

        this.zeus.behaviourTree = new BehaviourTree(treeDefinition, zeusActions);


    },
    update(time) {

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //this.zeus.pursuit(this.player);
            this.zeus.attack(this.lightningGroup);
        }
        //console.log(this.player.x + " " + this.player.y);
        if (this.lightningGroup) {
            this.lightningGroup.update(time); // Call the update method of the lightning group
        }

        this.zeus.behaviourTree.step();
        if (this.gameObjects) {
            this.gameObjects.forEach((element) => {
                element.update(inZone);
            });
        }
    },



    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default StartingScene