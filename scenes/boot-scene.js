import cursor from "../assets/sprites/ui/cursor.png";
import lvl_up_background from "../assets/sprites/ui/background_powerup.png";
import lvl_up_item_background from "../assets/sprites/ui/item_background_powerup.png";
import sword_power_up from "../assets/sprites/ui/sword_powerup.png";
import map_power_up from "../assets/sprites/ui/map_powerup.png";
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
import tilemapPng from "../assets/tileset/Dungeon_Tileset.png";
import dungeonRoomJson from "../assets/big_dungeon_room.json";
import viSpriteSheet from "../assets/sprites/characters/vi.png";
import zeusSpriteSheet from "../assets/sprites/characters/zeus.png";
import shockCircleSpriteSheet from "../assets/sprites/projectile/shock.png";
import barHorizontal_red_left from "../assets/sprites/ui/barHorizontal_red_left.png";
import barHorizontal_red_mid from "../assets/sprites/ui/barHorizontal_red_mid.png";
import barHorizontal_red_right from "../assets/sprites/ui/barHorizontal_red_right.png";
import barHorizontal_red_left_shadow from "../assets/sprites/ui/barHorizontal_red_left_shadow.png";
import barHorizontal_red_mid_shadow from "../assets/sprites/ui/barHorizontal_red_mid_shadow.png";
import barHorizontal_red_right_shadow from "../assets/sprites/ui/barHorizontal_red_right_shadow.png";
import lightning from "../assets/sprites/projectile/Weapon.png";
import slash from "../assets/sprites/projectile/Splash.png";
import menu_background from "../assets/sprites/ui/menu_background.png";
import green_btn from "../assets/sprites/ui/green_btn.png";
import red_btn from "../assets/sprites/ui/red_btn.png";
import character_selection_background from "../assets/sprites/ui/character_selection_background.png";
import character_background from "../assets/sprites/ui/character_background.png";
import character_selected_background from "../assets/sprites/ui/character_selected_background.png";
import todo_character from "../assets/sprites/ui/todo_character.png";
import grobold from  "url:../assets/fonts/GROBOLD.ttf";

export default class Boot extends Phaser.Scene {

    constructor ()
    {
        super('boot');
    }

    init ()
    {
        let element = document.createElement('style');

        document.head.appendChild(element);

        element.sheet.insertRule('@font-face { font-family: "grobold"; src:'+ grobold +' format("truetype"); }', 0);
        element.sheet.insertRule('@font-face { font-family: "Passion One"; src: url("../assets/fonts/PassionOne-Regular.ttf") format("truetype"); }', 0);
        element.sheet.insertRule('@font-face { font-family: "Squada One"; src: url("../assets/fonts/SquadaOne-Regular.ttf") format("truetype"); }', 0);
    }


    preload ()
    {

        this.viFrameConfig = {frameWidth: 305, frameHeight: 305};
        this.zeusFrameConfig = {frameWidth: 683, frameHeight: 500};
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

        //loading projectiles
        this.load.image('lightning', lightning);
        this.load.image('attack', slash);

        this.load.image('cursor', cursor);
        this.load.image('lvl_up_background', lvl_up_background);
        this.load.image('lvl_up_item_background', lvl_up_item_background);
        this.load.image('sword_power_up', sword_power_up);
        this.load.image('map_power_up', map_power_up);
        this.load.image('armor_power_up', armor_power_up);
        this.load.image('critical_power_up', critical_power_up);
        this.load.image('critical_rate_power_up', critical_rate_power_up);
        this.load.image('dodge_rate_power_up', dodge_rate_power_up);
        this.load.image('attack_range_power_up', attack_range_power_up);
        this.load.image('attack_speed_power_up', attack_speed_power_up);
        this.load.image('lvl_up_icon_background', lvl_up_icon_background);
        this.load.image('stats_background', stats_background);
        this.load.image('vi_icon', vi_icon);
        this.load.image('star', star);

        //loading menu
        this.load.image('menu_background', menu_background);
        this.load.image('green_btn', green_btn);
        this.load.image('red_btn', red_btn);
        this.load.image('character_selection_background', character_selection_background);
        this.load.image('character_background', character_background);
        this.load.image('character_selected_background', character_selected_background);
        this.load.image('todo_character', todo_character);

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        })

        this.load.on("progress", (percent) => {
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        })
    }

    create ()
    {
        this.input.setDefaultCursor('url(' + cursor + '), pointer');
        this.scene.start('menu');
    }

}