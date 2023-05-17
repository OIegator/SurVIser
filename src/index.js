import Phaser from 'phaser'

import StartingScene from '../scenes/starting-scene';

const config = {
  type: Phaser.AUTO,
  width: 1590,
  height: 880,
  pixelArt: false,
  zoom: 1.0,
  scene: StartingScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0// set to true to view zones
        },
      debug: true
    }
  },
};

const game = new Phaser.Game(config);
