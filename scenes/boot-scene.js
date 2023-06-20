import cursor from "../assets/sprites/ui/cursor.png";
import lvl_up_background from "../assets/sprites/ui/background_powerup.png";
import lvl_up_item_background from "../assets/sprites/ui/item_background_powerup.png";
import sword_power_up from "../assets/sprites/ui/sword_powerup.png";
import speed_power_up from "../assets/sprites/ui/speed_powerup.png";
import armor_power_up from "../assets/sprites/ui/armor_powerup.png";
import critical_power_up from "../assets/sprites/ui/critical_powerup.png";
import critical_rate_power_up from "../assets/sprites/ui/criticalRate_powerup.png";
import dodge_rate_power_up from "../assets/sprites/ui/dodgeRate_powerup.png";
import attack_range_power_up from "../assets/sprites/ui/attackRange_powerup.png";
import attack_speed_power_up from "../assets/sprites/ui/attackSpeed_powerup.png";
import lvl_up_icon_background from "../assets/sprites/ui/icon_background_powerup.png";
import stats_background from "../assets/sprites/ui/stats_background.png";
import vi_icon from "../assets/sprites/ui/vi_icon.png";
import star from "../assets/sprites/ui/star3.png";

import tilemapPng from "../assets/tileset/Tileset_Grass.png";
import tilemap2Png from "../assets/tileset/TX Tileset PrePreSnow.png";
import tilemap3Png from "../assets/tileset/TX Tileset Sand2.png";
import tilemap4Png from "../assets/tileset/TX Tileset Snow3.png";
import tilemap5Png from "../assets/tileset/Dungeon_Tileset.png";
import dungeonRoomJson from "../assets/transsilvania.json";

import viSpriteSheet from "../assets/sprites/characters/vi.png";
import viSkullSpriteSheet from "../assets/sprites/characters/vi_skull.png";
import zeusSpriteSheet from "../assets/sprites/characters/zeus.png";
import shockCircleSpriteSheet from "../assets/sprites/projectile/shock.png";
import barHorizontal_red_left from "../assets/sprites/ui/barHorizontal_red_left.png";
import barHorizontal_red_mid from "../assets/sprites/ui/barHorizontal_red_mid.png";
import barHorizontal_red_right from "../assets/sprites/ui/barHorizontal_red_right.png";
import barHorizontal_red_left_shadow from "../assets/sprites/ui/barHorizontal_red_left_shadow.png";
import barHorizontal_red_mid_shadow from "../assets/sprites/ui/barHorizontal_red_mid_shadow.png";
import barHorizontal_red_right_shadow from "../assets/sprites/ui/barHorizontal_red_right_shadow.png";
import lightning from "../assets/sprites/projectile/Weapon.png";
import bullet from "../assets/sprites/projectile/4.png";
import slash from "../assets/sprites/projectile/Splash.png";
import menu_background from "../assets/sprites/ui/menu_background.png";
import gameover_background from "../assets/sprites/ui/gameover_background.png";
import green_btn from "../assets/sprites/ui/green_btn.png";
import red_btn from "../assets/sprites/ui/red_btn.png";
import character_selection_background from "../assets/sprites/ui/character_selection_background.png";
import tutorial_background from "../assets/sprites/ui/tutorial_background.png";
import character_background from "../assets/sprites/ui/character_background.png";
import character_selected_background from "../assets/sprites/ui/character_selected_background.png";
import todo_character from "../assets/sprites/ui/todo_character.png";
import shock_icon from "../assets/sprites/ui/shock_icon.png";
import armor from "../assets/sprites/ui/armor.png";
import magic from "../assets/sprites/ui/magic.png";
import shield from "../assets/sprites/ui/shiled.png";
import dd from "../assets/sprites/ui/dd.png";
import dd_icon from "../assets/sprites/ui/dd_icon.png";
import magic_icon from "../assets/sprites/ui/magic_icon.png";
import armor_icon from "../assets/sprites/ui/armor_icon.png";
import barsjs from '../assets/bars/barhorizontalparts_atlas.json'
import barsSh from '../assets/bars/barHorizontal_shadow.png'
import barPix from '../assets/bars/pixel_barHorizontalShadow.png'
import barParts from '../assets/bars/barhorizontalparts.png'

import zeus_stone from "../assets/sprites/ui/zeus_stone.png";
import bers_stone from "../assets/sprites/ui/bers_stone.png";
import golem_stone from "../assets/sprites/ui/golem_stone.png";
import wizard_stone from "../assets/sprites/ui/wizard_stone.png";

import inkySpriteSheet from "../assets/sprites/characters/inky.png";
import pinkySpriteSheet from "../assets/sprites/characters/pinky.png";
import clydeSpriteSheet from "../assets/sprites/characters/clyde.png";

import main_theme from "../assets/audio/main_theme.mp3";
import attack_sound from "../assets/audio/attack_sound.mp3";
import hit_sound from "../assets/audio/hit_sound.mp3";
import fire_sound from "../assets/audio/fire_sound.mp3";
import explosion_sound from "../assets/audio/explosion_sound.mp3";
import heal_sound from "../assets/audio/heal_sound.mp3";
import heal_sound2 from "../assets/audio/heal_sound2.mp3";
import inv_sound from "../assets/audio/inv_sound.mp3";
import btn_sound from "../assets/audio/btn_sound.mp3";
import btn2_sound from "../assets/audio/btn2_sound.mp3";
import gameover_sound from "../assets/audio/gameover_sound.mp3";
import lvlup_sound from "../assets/audio/lvlup_sound.mp3";
import player_hit_sound from "../assets/audio/player_hit.mp3";
import unvulnerable_sound from "../assets/audio/unvulnerable_sound.mp3";
import shoot_sound from "../assets/audio/shoot_sound.mp3";
import lightning_sound from "../assets/audio/lightning_sound.mp3";
import golem_attack_sound from "../assets/audio/golem_attack.mp3";

import smash from "../assets/sprites/projectile/Sm05.png";
import poke from "../assets/sprites/projectile/Sm10.png";
import golemSpriteSheet from "../assets/sprites/characters/rock.png";
import bersSpriteSheet from "../assets/sprites/characters/berserk.png";
import wizardSpriteSheet from "../assets/sprites/characters/wizard.png";
import garySpriteSheet from "../assets/sprites/characters/gary.png";
import fire from "../assets/sprites/projectile/2.png";
import eye from "../assets/sprites/projectile/eye.png";
import heal from "../assets/sprites/projectile/Projectile.png";
import invc from "../assets/sprites/projectile/red_blue.png";
import dmg from "../assets/sprites/projectile/red_sphere.png";


export default class Boot extends Phaser.Scene {

    constructor() {
        super('boot');
    }

    preload() {
        this.viFrameConfig = {frameWidth: 305, frameHeight: 305};
        this.zeusFrameConfig = {frameWidth: 683, frameHeight: 500};
        this.inkyFrameConfig = {frameWidth: 476, frameHeight: 476};
        this.pinkyFrameConfig = {frameWidth: 403, frameHeight: 403};
        this.clydeFrameConfig = {frameWidth: 341, frameHeight: 341};
        this.bersFrameConfig = { frameWidth: 500, frameHeight: 500 };
        this.golemFrameConfig = {frameWidth: 996, frameHeight: 709};
        this.wizardFrameConfig = { frameWidth: 500, frameHeight: 500 };
        this.garyFrameConfig = {frameWidth: 500, frameHeight: 500},

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.image("tiles2", tilemap2Png);
        this.load.image("tiles3", tilemap3Png);
        this.load.image("tiles4", tilemap4Png);
        this.load.image("tiles5", tilemap5Png);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

        //loading spritesheets
        this.load.spritesheet('vi', viSpriteSheet, this.viFrameConfig);
        this.load.spritesheet('vi_skull', viSkullSpriteSheet, this.viFrameConfig);
        this.load.spritesheet('zeus', zeusSpriteSheet, this.zeusFrameConfig);
        this.load.spritesheet('inky', inkySpriteSheet, this.inkyFrameConfig);
        this.load.spritesheet('pinky', pinkySpriteSheet, this.pinkyFrameConfig);
        this.load.spritesheet('clyde', clydeSpriteSheet, this.clydeFrameConfig);
        this.load.spritesheet('berserk', bersSpriteSheet, this.bersFrameConfig);
        this.load.spritesheet('golem', golemSpriteSheet, this.golemFrameConfig);
        this.load.spritesheet('wizard', wizardSpriteSheet, this.wizardFrameConfig);
        this.load.spritesheet('gary', garySpriteSheet, this.garyFrameConfig);
        this.load.spritesheet('shock_circle', shockCircleSpriteSheet, {frameWidth: 240, frameHeight: 240});

        //loading health bar
        this.load.image('left-cap', barHorizontal_red_left)
        this.load.image('middle', barHorizontal_red_mid)
        this.load.image('right-cap', barHorizontal_red_right)
        this.load.image('left-cap-shadow', barHorizontal_red_left_shadow)
        this.load.image('middle-shadow', barHorizontal_red_mid_shadow)
        this.load.image('right-cap-shadow', barHorizontal_red_right_shadow)

        //loading projectiles
        this.load.image('lightning', lightning);
        this.load.image('bullet', bullet);
        this.load.image('attack', slash);
        this.load.image('smash', smash);
        this.load.image('poke', poke);
        this.load.image('fire', fire);

        this.load.image('eye', eye);
        this.load.image('shield', shield);

        this.load.image('heal', heal);
        this.load.image('invc', invc);
        this.load.image('dmg', dmg);

        this.load.image('zeus_stone', zeus_stone);
        this.load.image('bers_stone', bers_stone);
        this.load.image('golem_stone', golem_stone);
        this.load.image('wizard_stone', wizard_stone);

        this.load.image('cursor', cursor);
        this.load.image('lvl_up_background', lvl_up_background);
        this.load.image('lvl_up_item_background', lvl_up_item_background);
        this.load.image('sword_power_up', sword_power_up);
        this.load.image('speed_power_up', speed_power_up);
        this.load.image('armor_power_up', armor_power_up);
        this.load.image('critical_power_up', critical_power_up);
        this.load.image('critical_rate_power_up', critical_rate_power_up);
        this.load.image('dodge_rate_power_up', dodge_rate_power_up);
        this.load.image('attack_range_power_up', attack_range_power_up);
        this.load.image('attack_speed_power_up', attack_speed_power_up);
        this.load.image('lvl_up_icon_background', lvl_up_icon_background);
        this.load.image('shock_icon', shock_icon);
        this.load.image('armor_icon', armor_icon);
        this.load.image('magic_icon', magic_icon);
        this.load.image('magic', magic);
        this.load.image('dd_icon', dd_icon);
        this.load.image('dd', dd);
        this.load.image('armor', armor);
        this.load.image('stats_background', stats_background);
        this.load.image('vi_icon', vi_icon);
        this.load.image('star', star);



        //loading menu
        this.load.image('menu_background', menu_background);
        this.load.image('gameover_background', gameover_background);
        this.load.image('green_btn', green_btn);
        this.load.image('red_btn', red_btn);
        this.load.image('character_selection_background', character_selection_background);
        this.load.image('character_background', character_background);
        this.load.image('tutorial_background', tutorial_background);
        this.load.image('character_selected_background', character_selected_background);
        this.load.image('todo_character', todo_character);

        this.load.audio('main_theme', main_theme);
        this.load.audio('hit_sound', hit_sound);
        this.load.audio('attack_sound', attack_sound);
        this.load.audio('fire_sound', fire_sound);
        this.load.audio('explosion_sound', explosion_sound);
        this.load.audio('heal_sound', heal_sound);
        this.load.audio('heal_sound2', heal_sound2);
        this.load.audio('inv_sound', inv_sound);
        this.load.audio('btn_sound', btn_sound);
        this.load.audio('btn2_sound', btn2_sound);
        this.load.audio('gameover_sound', gameover_sound);
        this.load.audio('lvlup_sound', lvlup_sound);
        this.load.audio('player_hit_sound', player_hit_sound);
        this.load.audio('unvulnerable_sound', unvulnerable_sound);
        this.load.audio('shoot_sound', shoot_sound);
        this.load.audio('lightning_sound', lightning_sound);
        this.load.audio('golem_attack_sound', golem_attack_sound);


        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        })
        this.add.text(700, 500,  "LOADING", {
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'grobold'
        });

        this.load.on("progress", (percent) => {

            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        })

        this.load.spritesheet('cap-shadow', barsSh, {
            frameWidth: 6,
            frameHeight: 26
        });

        this.load.spritesheet(
            'pixel-cap-shadow',
            barPix,
            {
                frameWidth: 3,
                frameHeight: 12
            }
        );

        this.load.atlas(
            'caps',
            barParts,
            barsjs
        );

    }

    create() {
        this.add.text(800, 500,  "LOADING", {
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'grobold'
        });
        this.add.text(800, 500,  "LOADING", {
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'Passion One'
        });
        this.add.text(800, 500,  "LOADING", {
            color: 'white',
            fontSize: '32pt',
            fontFamily: 'Squada One'
        });
        this.input.setDefaultCursor('url(' + cursor + '), pointer');
        this.scene.start('menu');
    }

}