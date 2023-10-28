import Vector2 from 'phaser/src/math/Vector2'

export default class Lower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, centX, centY, camW, name, frame, rand, velocity) {
        let ang, adj, opp;
        let spawnX = centX;
        let spawnY = centY;
        if (rand) {
            ang = Math.random() * 2 * Math.PI;
            adj = Math.cos(ang) * camW / 1.5;
            opp = Math.sin(ang) * camW / 1.5;

            spawnX = centX + adj;
            spawnY = centY + opp;
        }

        // Define the padding for the scene bounds
        let padding = 100;

        // Get the scene bounds with padding
        let minX = scene.physics.world.bounds.x + padding;
        let maxX = scene.physics.world.bounds.right - padding;
        let minY = scene.physics.world.bounds.y + padding;
        let maxY = scene.physics.world.bounds.bottom - padding;

        // Adjust the spawn position if it falls outside the area
        spawnX = Phaser.Math.Clamp(spawnX, minX, maxX);
        spawnY = Phaser.Math.Clamp(spawnY, minY, maxY);

        super(scene, spawnX, spawnY, name, frame);
        this.scene = scene;
        this.setScale(0.4);
        this.constName = "Lower";
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.velocity = velocity;
        this.steerings = [];
        this.gotDamage = false;
        this.isDying = false;
        this.hp = -1;
        this.isDead = false;
        this.lastAttackTime = 0;
        this.timer = null;
    }

    setOffset(x, y) {
        super.setOffset(x, y);
        this.offset = {x: x, y: y};
    }

    update(collide) {
        const body = this.body;
        this.body.setVelocity(0);
        let velocity = new Vector2();
        if (this.velocity) {
            velocity.add(this.velocity);
            let target = velocity.multiply(this.speed);
            this.body.velocity.add(target);
        }

        this.steerings.forEach(steering => velocity.add(steering.calculateImpulse()));
        let target = velocity.multiply(this.speed);


        const speed = this.maxSpeed;
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        if (!this.isDying) {
            body.velocity.normalize().scale(speed);
            this.body.velocity.add(target);
        } else
            return this.Die();
        if (this.gotDamage)
            this.GetHit();
        else
            this.updateAnimation();
    }


    // Update function that runs on each frame
    outsideCameraCheck(scene) {
        if (!scene.cameras.main.worldView.contains(this.x, this.y)) {
            if (!this.timer) {
                this.timer = scene.time.now + 8000; // Set the timer to the current time plus 3 seconds
            } else if (scene.time.now > this.timer) {
                this.repositionGameObject(scene);
                this.timer = scene.time.now + 8000; // Reset the timer to the current time plus 3 seconds
            }
        } else {
            this.timer = null; // Reset the timer if the game object is back within the camera bounds
        }
    }

    repositionGameObject(scene) {
        let newX, newY;

        if (this.x < scene.cameras.main.worldView.left) {
            newX = scene.cameras.main.worldView.right + (this.width / 2);
            newY = Phaser.Math.Between(scene.cameras.main.worldView.top, scene.cameras.main.worldView.bottom);
        } else if (this.y < scene.cameras.main.worldView.top) {
            newX = Phaser.Math.Between(scene.cameras.main.worldView.left, scene.cameras.main.worldView.right);
            newY = scene.cameras.main.worldView.bottom + (this.height / 2);
        } else if (this.x > scene.cameras.main.worldView.right) {
            newX = scene.cameras.main.worldView.left - (this.width / 2);
            newY = Phaser.Math.Between(scene.cameras.main.worldView.top, scene.cameras.main.worldView.bottom);
        } else if (this.y > scene.cameras.main.worldView.bottom) {
            newX = Phaser.Math.Between(scene.cameras.main.worldView.left, scene.cameras.main.worldView.right);
            newY = scene.cameras.main.worldView.top - (this.height / 2);
        }

        this.x = newX;
        this.y = newY;
    }



    GetHit(damage = null) {
        if (!this.isDying && !this.isDead) {
            if (this.hp <= 0) {
                this.isDying = true;
            }
            let dmg = 0;
            const strength = this.scene.player.isConfig.strength;
            const criticalRate = this.scene.player.isConfig.criticalRate;
            const criticalMultiplier = this.scene.player.isConfig.critical;

            if (!this.hitSoundCooldown) {
                const delay = Phaser.Math.RND.realInRange(0.05, 0.09) // Random delay between 100ms and 300ms
                const detune = Phaser.Math.RND.integerInRange(-100, 100); // Random detune in cents

                this.scene.sound.play("hit_sound", {
                    delay: delay,
                    detune: detune
                });

                this.scene.time.addEvent({
                    delay: 1000, // 1 second delay
                    callback: () => {
                        this.hitSoundCooldown = false;
                    }
                });
            }

            if (Math.random() < criticalRate) {
                // Critical hit
                this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength) * criticalMultiplier, '#ff0000', 32);
                dmg = (damage ? damage : strength) * criticalMultiplier;
            } else {
                // Regular hit
                this.scene.showDamageNumber(this.x, this.y, (damage ? damage : strength), '#000000');
                dmg = damage ? damage : strength;
            }


            const animations = this.animationSets.get('Hit');
            const animsController = this.anims;
            animsController.play(animations[0], true);

            const numb = animsController.currentFrame.frame.name;
            if (numb == 69) {
                this.hp -= dmg;
                this.gotDamage = false;
            }
        }
    }

    Attack() {
        if (!this.isDying) {
            const currentTime = this.scene.time.now;

            // Calculate the elapsed time since the last attack
            const elapsedTime = currentTime - this.lastAttackTime;

            // Check if the elapsed time is greater than or equal to 1 second (1000 milliseconds)
            if (elapsedTime >= 1000 && this.scene.player.isAlive) {
                this.scene.player.GetHit(5);
                this.lastAttackTime = currentTime; // Update the last attack time
            }
        }
    }

    Die() {
        this.setSteerings([]);
        const animations = this.animationSets.get('Death');
        const animsController = this.anims;
        animsController.play(animations[0], true);
        const numb = animsController.currentFrame.frame.name;
        if (numb == 54) {
            this.isDead = true;
        }
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;
        if (x < 0) {
            this.setScale(0.5, 0.5);
            animsController.play(animations[0], true);
            this.body.setOffset(this.offset.x, this.offset.y);
        } else if (x > 0) {
            this.setScale(-0.5, 0.5);
            animsController.play(animations[1], true);
            this.body.setOffset(this.offset.x + 90, this.offset.y);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const idle = this.animationSets.get('Idle');
            animsController.play(idle[0], true);
        }
    }

    setSteerings(steerings) {
        this.steerings = steerings;
    }
}