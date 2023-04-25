const defaultFrameRate = 5;
const defaultRepeat = -1;
export default class AnimationLoader {
    // params: Phaser scene,
    // loaded phaser spritesheet,
    // config - json with animation names and frames
    // config format as in /assets/animations/cyberpunk.json
    // prefix - optional animation name prefix

    constructor(scene, spritesheet, config, prefix = "", frameRate = defaultFrameRate, repeate = defaultRepeat)
    {
        this.scene = scene;
        this.spritesheet = spritesheet;
        this.config = config;
        this.prefix = prefix;
        this.frameRate = frameRate;
        this.repeat = repeate;
    }
    createAnimations() {
        let animationGroups = new Map();
        for (const key of Object.keys(this.config)) {
          animationGroups.set(key, this.parseAnimationsGroup(this.prefix, key, this.config[key]));
        }
        return animationGroups;
    }

    parseAnimationsGroup(prefix, groupName, animations) {
        let animationsNames = [];
        for (const key of Object.keys(animations)) {
            const name = prefix + groupName + key;
            animationsNames.push(name);
            const frames = animations[key];
            this.createAnimation(name, frames, this.frameRate, this.repeat);
        }
        return animationsNames;
    }
    // Can be used to create single animation with modified properties
    createAnimation(name, frames, frameRate, repeat)
    {
        this.scene.anims.create({
            key: name,
            frames: this.scene.anims.generateFrameNumbers(this.spritesheet, { frames: frames }),
            frameRate: frameRate,
            repeat: repeat
        });
    }
}
