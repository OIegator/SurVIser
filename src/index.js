import Phaser from 'phaser'

import ZeusScene from '../scenes/zeus-scene';
import LvlUpScene from '../scenes/lvl-up-scene';
import Boot from "../scenes/boot-scene";
import MenuScene from "../scenes/menu-scene";
import GameOverScene from "../scenes/gameover-scene";
import BlurFX from '../assets/pipelines/BlurPostFX.js';
import PauseScene from "../scenes/pause-scene";
import CreditsScene from "../scenes/credits-scene";


const config = {
    type: Phaser.AUTO,
    width: 1590,
    height: 880,
    pixelArt: false,
    zoom: 1.0,
    scene: [Boot, MenuScene, ZeusScene, LvlUpScene, PauseScene, GameOverScene, CreditsScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0// set to true to view zones
            },
            debug: false
        }
    },
    pipeline: { BlurFX }
};

new Phaser.Game(config);
