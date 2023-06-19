import viConfigJson from "../../assets/animations/vi.json";
import zeusConfigJson from "../../assets/animations/zeus.json";
import inkyConfigJson from "../../assets/animations/inky.json";
import pinkyConfigJson from "../../assets/animations/pinky.json";
import clydeConfigJson from "../../assets/animations/clyde.json";
import berserkConfigJson from "../../assets/animations/berserk.json";
import garyConfigJson from "../../assets/animations/gary.json";
import rockConfigJson from "../../assets/animations/rock.json";
import sansConfigJson from "../../assets/animations/sans.json";
import wizardConfigJson from "../../assets/animations/wizard.json";

import AnimationLoader from "../utils/animation-loader";
import Character from "./character";
import Vector2 from 'phaser/src/math/Vector2'
import Lower from "./lower_mob";
import Zeus from "./zeus";
import Bers from "./berserk";
import Golem from "./golem.js"
import Wizard from "./wizard.js"
import PlayerContainer from "./player_container";
import Ordinary from "./ordinary_mob";
import Seek from "../ai/steerings/seek";
import Shooter from "./shooter-mob";
import Gary from "./gary";


export default class CharacterFactory {

    constructor(scene) {
        this.scene = scene;

        this.viSpriteSheet = 'vi';
        this.zeusSpriteSheet = 'zeus';
        this.inkySpriteSheet = 'inky';
        this.pinkySpriteSheet = 'pinky';
        this.clydeSpriteSheet = 'clyde';
        this.berserkSpriteSheet = 'berserk';
        this.garySpriteSheet = 'gary';
        this.rockSpriteSheet = 'golem';
        this.sansSpriteSheet = 'sans';
        this.wizardSpriteSheet = 'wizard';

        let animationLibrary =  new Map();

        animationLibrary.set(this.viSpriteSheet,
            new AnimationLoader(scene, this.viSpriteSheet, viConfigJson, this.viSpriteSheet, 28).createAnimations());
        animationLibrary.set(this.zeusSpriteSheet,
            new AnimationLoader(scene, this.zeusSpriteSheet, zeusConfigJson, this.zeusSpriteSheet, 30).createAnimations());
        animationLibrary.set(this.inkySpriteSheet,
            new AnimationLoader(scene, this.inkySpriteSheet, inkyConfigJson, this.inkySpriteSheet, 28).createAnimations());
        animationLibrary.set(this.pinkySpriteSheet,
            new AnimationLoader(scene, this.pinkySpriteSheet, pinkyConfigJson, this.pinkySpriteSheet, 28).createAnimations());
        animationLibrary.set(this.clydeSpriteSheet,
            new AnimationLoader(scene, this.clydeSpriteSheet, clydeConfigJson, this.clydeSpriteSheet, 28).createAnimations());
        animationLibrary.set(this.berserkSpriteSheet,
            new AnimationLoader(scene, this.berserkSpriteSheet, berserkConfigJson, this.berserkSpriteSheet, 28).createAnimations());
        animationLibrary.set(this.garySpriteSheet,
            new AnimationLoader(scene, this.garySpriteSheet, garyConfigJson, this.garySpriteSheet, 28).createAnimations());
        animationLibrary.set(this.rockSpriteSheet,
            new AnimationLoader(scene, this.rockSpriteSheet, rockConfigJson, this.rockSpriteSheet, 24).createAnimations());
        animationLibrary.set(this.sansSpriteSheet,
            new AnimationLoader(scene, this.sansSpriteSheet, sansConfigJson, this.sansSpriteSheet, 28).createAnimations());
        animationLibrary.set(this.wizardSpriteSheet,
            new AnimationLoader(scene, this.wizardSpriteSheet, wizardConfigJson, this.wizardSpriteSheet, 28).createAnimations());

        this.animationLibrary = animationLibrary;
    }

    buildCharacter(spriteSheetName, x, y, params = {}) {
        switch (spriteSheetName) {
            case 'vi':
                if (params.player)
                    return this.buildPlayerCharacter(spriteSheetName, x, y);
                else{
                    return this.buildNonPlayerCharacter(spriteSheetName, x, y);
                }
        }
    }

    buildPlayerCharacter(spriteSheetName, x, y) {
        let character = new PlayerContainer(this.scene, x, y, spriteSheetName, 2);
        character.body.pushable = false;
        character.body.setImmovable(true);
        character.body.setCollideWorldBounds(true);
        this.scene.input.keyboard.createCursorKeys();

        character.cursors = this.scene.input.keyboard.createCursorKeys();
        character.wasd = this.scene.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });
        character.sprite.animationSets = this.animationLibrary.get(spriteSheetName);
        return character;

    }

    buildLowerCharacter(scene, spriteSheetName, centX, centY, camW, rand = 1, velocity = null){
        let lower = new Lower(scene, centX, centY, camW, spriteSheetName, 2, rand, velocity);
        lower.maxSpeed = 100;
        lower.setDepth(2);
        lower.setCircle(40);
        lower.setOffset(200, 210);
        lower.setCollideWorldBounds(true);
        lower.setSteerings([
            new Seek(lower, [scene.player], 1, scene.player.maxSpeed, scene.player.maxSpeed)
        ]);
        lower.animationSets = this.animationLibrary.get(spriteSheetName);
        lower.speed = new Vector2(0.5, 0.5);
        return lower;
    }

    buildNonPlayerCharacter(spriteSheetName, x, y, velocity = null) {
        let character = new Character(this.scene, x, y, spriteSheetName, 2, velocity);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }

    buildOrdinaries(spriteSheetName, biome = 'Enemies') {
        let characters = this.scene.map.createFromObjects(biome, {
            name: 'pinky',
            classType: Ordinary
        });

        characters.forEach((character) => {
            character.patrolPoints = [
                new Vector2(character.x - 300, character.y),
                new Vector2(character.x + 300, character.y),
            ];
            character.setDepth(2);
            character.hp = character.data.list.hp;
            character.setCollideWorldBounds(true);
            character.body.pushable = false;
            character.animationSets = this.animationLibrary.get(spriteSheetName);
            character.speed = new Vector2(0.5, 0.5);
        });

        return characters;
    }

    buildShooters(spriteSheetName, biome = 'Enemies') {
        let characters = this.scene.map.createFromObjects(biome, {
            name: 'clyde',
            classType: Shooter
        });

        characters.forEach((character) => {
            character.patrolPoints = [
                new Vector2(character.x - 300, character.y),
                new Vector2(character.x + 300, character.y),
            ];
            character.setDepth(2);
            character.hp = character.data.list.hp;
            character.setCollideWorldBounds(true);
            character.body.pushable = false;
            character.animationSets = this.animationLibrary.get(spriteSheetName);
            character.speed = new Vector2(0.5, 0.5);
        });

        return characters;
    }


    buildZeus(spriteSheetName, x, y, maxHP, velocity = null) {
        let character = new Zeus(this.scene, x, y, spriteSheetName, 2, maxHP, velocity);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }

    buildBers(spriteSheetName, x, y, maxHP, velocity = null) {
        let character = new Bers(this.scene, x, y, spriteSheetName, 2, maxHP, velocity);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }

    buildGolem(spriteSheetName, x, y, maxHP, velocity = null) {
        let character = new Golem(this.scene, x, y, spriteSheetName, 2, maxHP, velocity);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }

    buildWizard(spriteSheetName, x, y, maxHP, velocity = null) {
        let character = new Wizard(this.scene, x, y, spriteSheetName, 2, maxHP, velocity);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }

    buildGary(spriteSheetName, x, y, maxHP, velocity = null) {
        let character = new Gary(this.scene, x, y, spriteSheetName, 2, maxHP, velocity);
        character.maxSpeed = 30;
        character.setCollideWorldBounds(true);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }
}