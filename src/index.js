import Phaser from 'phaser'

import ZeusScene from '../scenes/zeus-scene';
import LvlUpScene from '../scenes/lvl-up-scene';
import Boot from "../scenes/boot-scene";
import MenuScene from "../scenes/menu-scene";
import GameOverScene from "../scenes/gameover-scene";
import BlurFX from '../assets/pipelines/BlurPostFX.js';
import PauseScene from "../scenes/pause-scene";
import Handler from "../scenes/handler-scene";
import CreditsScene from "../scenes/credits-scene";

const MAX_SIZE_WIDTH_SCREEN = 1920
const MAX_SIZE_HEIGHT_SCREEN = 1080
const MIN_SIZE_WIDTH_SCREEN = 270
const MIN_SIZE_HEIGHT_SCREEN = 480
const SIZE_WIDTH_SCREEN = 540
const SIZE_HEIGHT_SCREEN = 960

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        }
    },
    dom: {
        createContainer: true
    },
    pixelArt: false,
    scene: [Handler, Boot, MenuScene, ZeusScene, LvlUpScene, PauseScene, GameOverScene, CreditsScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0 // set to true to view zones
            },
            debug: false
        }
    },
    pipeline: { BlurFX }
};

const game = new Phaser.Game(config);

game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,
    minWidth: MIN_SIZE_WIDTH_SCREEN,
    minHeight: MIN_SIZE_HEIGHT_SCREEN,
    width: SIZE_WIDTH_SCREEN,
    height: SIZE_HEIGHT_SCREEN
}