import viConfigJson from "../../assets/animations/vi.json";
import zeusConfigJson from "../../assets/animations/zeus.json";
import inkyConfigJson from "../../assets/animations/inky.json";
import pinkyConfigJson from "../../assets/animations/pinky.json";
import clydeConfigJson from "../../assets/animations/clyde.json";
import blinkyConfigJson from "../../assets/animations/blinky.json";
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
import PlayerContainer from "./player_container";
import Ordinary from "./ordinary_mob";


export default class CharacterFactory {

    constructor(scene) {
        this.scene = scene;

        this.viSpriteSheet = 'vi';
        this.zeusSpriteSheet = 'zeus';
        this.inkySpriteSheet = 'inky';
        this.pinkySpriteSheet = 'pinky';
        this.clydeSpriteSheet = 'clyde';
        this.blinkySpriteSheet = 'blinky';
        this.berserkSpriteSheet = 'berserk';
        this.garySpriteSheet = 'gary';
        this.rockSpriteSheet = 'rock';
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
        animationLibrary.set(this.blinkySpriteSheet,
            new AnimationLoader(scene, this.blinkySpriteSheet, blinkyConfigJson, this.blinkySpriteSheet, 28).createAnimations());
        animationLibrary.set(this.berserkSpriteSheet,
            new AnimationLoader(scene, this.berserkSpriteSheet, berserkConfigJson, this.berserkSpriteSheet, 28).createAnimations());
        animationLibrary.set(this.garySpriteSheet,
            new AnimationLoader(scene, this.garySpriteSheet, garyConfigJson, this.garySpriteSheet, 40).createAnimations());
        animationLibrary.set(this.rockSpriteSheet,
            new AnimationLoader(scene, this.rockSpriteSheet, rockConfigJson, this.rockSpriteSheet, 24).createAnimations());
        animationLibrary.set(this.sansSpriteSheet,
            new AnimationLoader(scene, this.sansSpriteSheet, sansConfigJson, this.sansSpriteSheet, 40).createAnimations());
        animationLibrary.set(this.wizardSpriteSheet,
            new AnimationLoader(scene, this.wizardSpriteSheet, wizardConfigJson, this.wizardSpriteSheet, 10).createAnimations());

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
       // let character = new Player(this.scene, x, y, spriteSheetName, 2);
        let character = new PlayerContainer(this.scene, x, y, spriteSheetName, 2);
        character.maxSpeed = 150;
        character.body.setCollideWorldBounds(true);
        character.body.setImmovable();
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

    buildLowerCharacter(scene, spriteSheetName, centX, centY, camW, velocity = null){
        let lower = new Lower(scene, centX, centY, camW, spriteSheetName, 2, velocity);
        lower.maxSpeed = 100;
        lower.setCollideWorldBounds(true);
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

    buildOrdinaries(spriteSheetName) {
        let characters = this.scene.map.createFromObjects('Pinkys', {
            name: 'pinky',
            classType: Ordinary
        });

        characters.forEach((character) => {
            character.patrolPoints = [
                new Vector2(character.x - 300, character.y),
                new Vector2(character.x + 300, character.y),
            ];
            character.hp = character.data.list.hp;
            character.setCollideWorldBounds(true);
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
        console.log(spriteSheetName);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.speed = new Vector2(0.5, 0.5);
        return character;
    }
}