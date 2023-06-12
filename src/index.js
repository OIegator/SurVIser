import Phaser from 'phaser'

import StartingScene from '../scenes/starting-scene';
import ZeusScene from '../scenes/zeus-scene';
import LvlUpScene from '../scenes/lvl-up-scene';
import Boot from "../scenes/boot-scene";
import MenuScene from "../scenes/menu-scene";
import GameOverScene from "../scenes/gameover-scene";
import BerserkScene from '../scenes/berserk-scene';
import BlurFX from '../assets/pipelines/BlurPostFX.js';
import GolemScene from "../scenes/golem-scene";


const config = {
    type: Phaser.AUTO,
    width: 1590,
    height: 880,
    pixelArt: false,
    zoom: 1.0,
    scene: [Boot, ZeusScene, LvlUpScene, GameOverScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0// set to true to view zones
            },
            debug: true
        }
    },
    pipeline: { BlurFX }
};

new Phaser.Game(config);
