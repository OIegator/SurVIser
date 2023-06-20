export default class HealthBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, h, w, owner) {
        super(scene, x, y);
        this.defaultX = x;
        this.width = w;
        this.height = h;
        this.currentSize = owner.hp / owner.maxHp * w;
        this.owner = owner;
        this.lowColor = 0xfa5b57; // Red color
        this.mediumColor = 0xfab957; // Orange color
        this.highColor = 0x9cfa57; // Green color
        this.invincibilityWidth = 0;

        // Create the black background rectangle
        const bgRect = new Phaser.GameObjects.Graphics(scene);
        bgRect.setDepth(12);
        bgRect.fillStyle(0x000000); // Black color
        bgRect.fillRect(0, 0, w, h); // Adjust the size as needed
        this.add(bgRect);

        // Create the health bar rectangle
        this.healthBar = new Phaser.GameObjects.Graphics(scene);
        this.healthBar.fillStyle(0x9cfa57); // Green color
        this.healthBar.fillRect(0, 0, w, h);
        this.add(this.healthBar);

        this.invincibilityRect = new Phaser.GameObjects.Graphics(scene);
        this.invincibilityRect.fillStyle(0x0000ff); // Green color
        this.invincibilityRect.fillRect(0, 0, this.invincibilityWidth, h);
        this.add(this.invincibilityRect);
    }

    updateBar() {
        if (this.owner.sprite.scaleX < 0) {
            this.x = this.defaultX - 25;
            if (this.owner.shieldIcon) this.owner.shieldIcon.x = -45;
        } else {
            this.x = this.defaultX;
            if (this.owner.shieldIcon) this.owner.shieldIcon.x = -20;
        }
        this.currentSize = this.owner.hp / this.owner.maxHp * this.width;
        if (this.currentSize < 0) {
            this.currentSize = 0;
        }
        this.healthBar.clear();
        const percent = this.currentSize / this.width;
        if (percent < 0.3) {
            this.healthBar.fillStyle(this.lowColor);
        } else if (percent < 0.5) {
            this.healthBar.fillStyle(this.mediumColor);
        } else {
            this.healthBar.fillStyle(this.highColor);
        }
        this.healthBar.fillRect(0, 0, this.currentSize, this.height);

        if (this.invincibilityWidth) {
            this.invincibilityRect.clear();
            this.invincibilityRect.fillStyle(0x0000ff);
            this.invincibilityRect.fillRect(0, 0, this.invincibilityWidth, this.height);
        }
    }


}
