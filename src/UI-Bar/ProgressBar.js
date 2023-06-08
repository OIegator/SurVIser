import Phaser from "phaser";

export default class ProgressBar {
  constructor({ scene, fullWidth, x, y, color, isPixel, percent }) {
    this.scene = scene;

    this.fullWidth = fullWidth;
    this.x = x;
    this.y = y;
    this.color = color;
    this.isPixel = isPixel;

    this._makeShadow();
    this._makeCap();
    this.setPosition();

    this.setMeterPercentage(percent || 1);
  }

  _makeShadow() {
    var { fullWidth } = this;
    var shadowTexture = `${this.isPixel ? "pixel-" : ""}cap-shadow`;

    this.leftShadowCap = this._createImage(shadowTexture, 0);
    this.middleShadowCap = this._createImage(shadowTexture, 1);
    this.rightShadowCap = this._createImage(shadowTexture, 2);

    this._midFullWidth =
      fullWidth -
      (this.leftShadowCap.displayWidth + this.rightShadowCap.displayWidth);
    this.middleShadowCap.displayWidth = this._midFullWidth;
  }

  _makeCap() {
    var { color } = this;
    var capTexture = "caps";
    var frame = `${this.isPixel ? "pixel_" : ""}barhorizontal_${color}`;

    this.leftCap = this._createImage(capTexture, `${frame}_left`);
    this.middleCap = this._createImage(capTexture, `${frame}_mid`);
    this.rightCap = this._createImage(capTexture, `${frame}_right`);
    
  }

  _createImage(name, frame) {
      var { scene } = this;
      var img = scene.add.image(0, 0, name, frame).setOrigin(0, 0.5);
      img.setScrollFactor(0, 0);
    return img;
  }

  updatePostion() {
    this.setPosition();
  }

  setPosition(x = this.x, y = this.y) {
    this.leftShadowCap.setPosition(x, y);
    var mX = this.leftShadowCap.x + this.leftShadowCap.width;
    this.middleShadowCap.setPosition(mX, y);
    var rX = this.middleShadowCap.x + this.middleShadowCap.displayWidth;
    this.rightShadowCap.setPosition(rX, y);

    this.leftCap.setPosition(x, y);
    mX = this.leftCap.x + this.leftCap.width;
    this.middleCap.setPosition(mX, y);
    rX = this.middleCap.x + this.middleCap.displayWidth;
    this.rightCap.setPosition(rX, y);

    this.x = x;
    this.y = y;
  }

  setTint(topLeft, topRight, bottomLeft, bottomRight) {
    this.leftCap.setTint(topLeft, topRight, bottomLeft, bottomRight);
    this.middleCap.setTint(topLeft, topRight, bottomLeft, bottomRight);
    this.rightCap.setTint(topLeft, topRight, bottomLeft, bottomRight);
  }

  setMeterPercentage(percent = 1) {
    const width = this._midFullWidth * percent;

    this.middleCap.displayWidth = width;
    this.rightCap.x = this.middleCap.x + this.middleCap.displayWidth;
  }

  setMeterPercentageAnimated(percent = 1, duration = 1000) {
    const width = this._midFullWidth * percent;

    this.scene.tweens.add({
      targets: this.middleCap,
      displayWidth: width,
      duration,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        this.rightCap.x = this.middleCap.x + this.middleCap.displayWidth;

        this.leftCap.visible = this.middleCap.displayWidth > 0;
        this.middleCap.visible = this.middleCap.displayWidth > 0;
        this.rightCap.visible = this.middleCap.displayWidth > 0;
      }
    });
  }

  setDamageColorChange(percent = 1, duration = 1000) {
    var currentPercent = this.middleCap.displayWidth / this._midFullWidth;

    this.scene.tweens.addCounter({
      from: 255 * currentPercent,
      to: 255 * percent,
      duration: duration,
      onUpdate: tween => {
        var value = Math.floor(tween.getValue());
        this.setTint(Phaser.Display.Color.GetColor(255, value, value));
      }
    });
  }

  show() {
    this.leftShadowCap.setVisible(true);
    this.middleShadowCap.setVisible(true);
    this.rightShadowCap.setVisible(true);

    

    this.leftCap.setVisible(true);
    this.middleCap.setVisible(true);
    this.rightCap.setVisible(true);


    this.leftCap.scrollFactor(0, 0);
    this.middleCap.scrollFactor(0, 0);
    this.rightCap.scrollFactor(0, 0);
  }

  hide() {
    this.leftShadowCap.setVisible(false);
    this.middleShadowCap.setVisible(false);
    this.rightShadowCap.setVisible(false);

    this.leftCap.setVisible(false);
    this.middleCap.setVisible(false);
    this.rightCap.setVisible(false);
  }

  destroy() {
    this.leftShadowCap.destroy();
    this.middleShadowCap.destroy();
    this.rightShadowCap.destroy();

    this.leftCap.destroy();
    this.middleCap.destroy();
    this.rightCap.destroy();

    this.scene = undefined;
  }
}
