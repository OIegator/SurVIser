import Phaser from 'phaser'

import StartingScene from '../scenes/starting-scene';

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  pixelArt: true,
  zoom: 1.0,
  scene: StartingScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0,
        debug: true // set to true to view zones
        }
    }
  },
};

const game = new Phaser.Game(config);
