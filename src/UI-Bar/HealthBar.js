import ProgressBar from "./ProgressBar";

export default class HealthBar extends ProgressBar {
    constructor({ scene, max, current, animate, damageColor, displayData }) {
        super({
            scene,
            ...displayData,
            percent: current ? current / max : max / max
        });

        this.max = max;
        this.current = current ? current : max;
        this.animate = animate;
        this.damageColor = damageColor;

        if (this.damageColor) this.setDamageColorChange(this.current / this.max);
    }

    takeDamage(damage) {
        var { max, current } = this;
        if (max >= current && 0 < current) {
            var newCurrent = current - damage;

            if (0 > newCurrent) {
                this.current = 0;
            } else {
                this.current = newCurrent;
            }
            this._displayCurrent();
        }
    }

    resiveHealing(health) {
        var { max, current } = this;
        if (max > current && 0 < current) {
            var newCurrent = current + health;

            if (max >= newCurrent) {
                this.current = newCurrent;
            } else {
                this.current = max;
            }
            this._displayCurrent();
        }
    }

    _displayCurrent() {
        var percent = this.current / this.max;
        if (this.animate) this.setMeterPercentageAnimated(percent);
        else this.setMeterPercentage(percent);

        if (this.damageColor) this.setDamageColorChange(percent);
    }
}
