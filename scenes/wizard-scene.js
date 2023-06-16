import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/big_dungeon_room.json'

import viSpriteSheet from '../assets/sprites/characters/vi.png'
import golemSpriteSheet from '../assets/sprites/characters/rock.png'
import shockCircleSpriteSheet from '../assets/sprites/projectile/shock.png'
import wizardSpriteSheet from '../assets/sprites/characters/wizard.png'

//======================Projectiles===========================
import slash from '../assets/sprites/projectile/Splash.png'
import smash from '../assets/sprites/projectile/Sm05.png'
import fire from '../assets/sprites/projectile/2.png'
import heal from '../assets/sprites/projectile/projectile.png'
import dmg from '../assets/sprites/projectile/red_sphere.png'
import invc from '../assets/sprites/projectile/red_blue.png'
//=======================BossHealthBar========================
import barHorizontal_red_left from '../assets/sprites/ui/BarHorizontal_red_left.png'
import barHorizontal_red_mid from '../assets/sprites/ui/BarHorizontal_red_mid.png'
import barHorizontal_red_right from '../assets/sprites/ui/BarHorizontal_red_right.png'
import barHorizontal_red_left_shadow from '../assets/sprites/ui/BarHorizontal_red_left_shadow.png'
import barHorizontal_red_mid_shadow from '../assets/sprites/ui/BarHorizontal_red_mid_shadow.png'
import barHorizontal_red_right_shadow from '../assets/sprites/ui/BarHorizontal_red_right_shadow.png'
//============================================================
import { LightningGroup } from "../src/LightningGroup";
import CharacterFactory from "../src/characters/character_factory"
import AutoAttack from "../src/projectiles/AutoAttack"
import Projectile from "../src/projectiles/Projectile.js"
import PickUp from "../src/power-ups/pick-up"

let inZone = false;


let WizardScene = new Phaser.Class({

    Extends: Phaser.Scene, lightningGroup: undefined, zeus: undefined,


    initialize: function StartingScene() {
        Phaser.Scene.call(this, { key: 'StartingScene' });
    },

    characterFrameConfig: { frameWidth: 31, frameHeight: 31 },
    slimeFrameConfig: { frameWidth: 32, frameHeight: 32 },
    viFrameConfig: { frameWidth: 305, frameHeight: 305 },
    bersFrameConfig: { frameWidth: 500, frameHeight: 500 },
    golemFrameConfig: { frameWidth: 996, frameHeight: 709 },
    wizardFrameConfig: { frameWidth: 500, frameHeight: 500 },


    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

        //loading spritesheets
        this.load.spritesheet('vi', viSpriteSheet, this.viFrameConfig);
        this.load.spritesheet('golem', golemSpriteSheet, this.golemFrameConfig);
        this.load.spritesheet('wizard', wizardSpriteSheet, this.wizardFrameConfig);
        this.load.spritesheet('shock_circle', shockCircleSpriteSheet, { frameWidth: 240, frameHeight: 240 });

        //loading health bar
        this.load.image('left-cap', barHorizontal_red_left)
        this.load.image('middle', barHorizontal_red_mid)
        this.load.image('right-cap', barHorizontal_red_right)
        this.load.image('left-cap-shadow', barHorizontal_red_left_shadow)
        this.load.image('middle-shadow', barHorizontal_red_mid_shadow)
        this.load.image('right-cap-shadow', barHorizontal_red_right_shadow)

        //loading projectiles
        //this.load.image('lightning', lightning);
        this.load.image('attack', slash);
        this.load.image('smash', smash);
        this.load.image('fire', fire);

        this.load.image('heal', heal);
        this.load.image('invc', invc);
        this.load.image('dmg', dmg);

    },

    lowerColl(player, lower) {
        lower.gotDamage = true;
    },

    create: function () {

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.gameObjects = [];

        this.powerUpsGroup = this.physics.add.group();
        this.lightningGroup = new LightningGroup(this);

        const map = this.make.tilemap({ key: "map" });

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
        this.player = this.characterFactory.buildCharacter('vi', 140, 1100, { player: true });
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.cameras.main.startFollow(this.player);

        

        this.wizard = this.characterFactory.buildWizard("wizard", 650, 190, 100);
        this.gameObjects.push(this.wizard);
        this.physics.add.collider(this.wizard, worldLayer);

        
        this.attacks = [];
        this.enAttacks = [];
        this.enemies = [];
        this.pickUps = [];

        this.enemies.length

        this.enemies.push(this.wizard);

        //this.attacks.push(this.player.fire);

        this.timer = this.time.addEvent({
            delay: 2000,
            callback: function (args) {
                if (args.player.isAlive && (args.player.IsTossed == false)) {
                    args.player.isAttacking = true;
                    args.time.delayedCall(255, () => {

                        let add;
                        if (args.player.sprite.scaleX < 0)
                            add = 100;
                        else
                            add = -100;
                        let attack = new AutoAttack(args, args.player.x + add, args.player.y + 30, 'attack');
                        args.attacks.push(attack);
                        args.physics.add.collider(attack, args.worldLayer);
                        attack.flipX = args.player.sprite.scaleX < 0;
                        attack.scaleX = 0.8;
                        attack.scaleY = 0.5;
                        if (args.player.doubleAtt) {
                            attack = new AutoAttack(args, args.player.x - (add*1.4), args.player.y + 30, 'attack');
                            args.attacks.push(attack);
                            args.physics.add.collider(attack, args.worldLayer);
                            attack.flipX = args.player.sprite.scaleX > 0;
                            attack.scaleX = 0.8;
                            attack.scaleY = 0.5;
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

    ProjectAttack(x, y, attacker, delay, cond) {
        this.time.delayedCall(delay, () => {
            const difx = this.player.x - x;
            const dify = this.player.y - y;
            var c = Math.sqrt(difx * difx + dify * dify);
            const angle = Math.atan2(dify, difx) * 180 / Math.PI;
            let path = 0;
            if (cond)
                path = 190;
            else
                path = 170;
            const curve = new Phaser.Curves.Ellipse(x + difx / 2, y + dify / 2, -c / 2, 80, 0, path, cond, angle);
            var tempVec = new Phaser.Math.Vector2();
            var start = curve.getStartPoint();
            var distance = curve.getLength();
            var duration = 1500;
            var speed = distance / duration;
            var speedSec = 1000 * speed;
            var tSpeed = 1 / duration;
            
            var fire = new Projectile(this, start.x, start.y, 'fire');
            this.enAttacks.push(fire);
            fire.scale = 0.5;
            //fire.setRotation(angle);

            if (Math.abs(angle) < 90)
                fire.flipX = true;
            
           var resetFire = function (counter) {
                var start = curve.getStartPoint();
               fire.body.reset(start.x, start.y);
               updateFire(counter);
            };

            var destroyFire = function (counter) {
                fire.destroy();
            }

            var updateFire = function (counter) {
                var t = counter.getValue();
                if (fire != null) {
                    curve.getTangent(t, tempVec);
                    fire.body.velocity.copy(tempVec.scale(speedSec));
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

    EnemyAttack(x, y, attacker, size, offset, delay) {
        let add;
        this.time.delayedCall(delay, () => {
            let add;
            if (attacker.scaleX < 0)
                add = offset;
            else
                add = -offset;
            const attack = new AutoAttack(this, x + add, y, 'smash');
            attack.body.setSize(size, size);
            if (attacker.constructor.name == "Golem")
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
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 15 && rnd <= 50:
                pickUp = new PickUp(this, x, y, 'heal', 'heal');
                this.pickUps.push(pickUp);
                pickUp.scale = 0.7;
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 50 && rnd <= 75:
                pickUp = new PickUp(this, x, y, 'dmg', 'damage');
                this.pickUps.push(pickUp);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
            case rnd > 75 && rnd <= 100:
                pickUp = new PickUp(this, x, y, 'invc', 'invincible');
                this.pickUps.push(pickUp);
                this.physics.add.collider(pickUp, this.worldLayer);
                break;
        }

    },

    tacticalNuke() {
        //Add all enemies lists here
        this.enemies.forEach((element) => {
            if (this.cameras.main.worldView.contains(element.x, element.y))
                element.behaviour.GetHit(50);
        });
    },

    update(time) {

        if (this.attacks) {
            this.physics.overlap(this.attacks, this.lowers, (attack, mob) => {
                this.lowerColl(attack, mob);
            });
            this.attacks.forEach(function (element) {
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

            this.physics.overlap(this.attacks, this.wizard, (attack, mob) => {
                if (this.canDamage) {
                    this.wizard.behaviour.GetHit(25);
                    //this.spawnPickUp(this.wizard.x, this.wizard.y);
                    
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
        const self = this;
        if (this.gameObjects) {
            this.gameObjects.forEach(function (element, index, object) {
                if (element.isDead) {
                    const rand = Math.floor(Math.random() * 3);
                    if (rand == 1)
                        self.spawnPickUp(element.x, element.y);
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

export default WizardScene