import Vector2 from 'phaser/src/math/Vector2'

const eps = 20;
export default class Lower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, centX, centY, camW, name, frame, velocity) {
        let ang = Math.random() * 2 * Math.PI,
            adj = Math.cos(ang) * camW/2,
            opp = Math.sin(ang) * camW/2
        
        super(scene, centX+adj, centY + opp, name, frame);
        this.setScale(0.5);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.velocity = velocity;
        this.steerings = [];
        this.gotDamage = false;
        this.isDying = false;
        this.hp = 3;
        this.isDead = false;
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
        }
        else
           return this.Die();
        if (this.gotDamage)
            this.getDamage();
        else  
         this.updateAnimation();
    }

    getDamage() {
        if (this.hp < 0)
            this.isDying = true;
            
        const animations = this.animationSets.get('Hit');
        
      //const numb = this.animations.currentAnim.frame;
      
        const animsController = this.anims;
        
        animsController.play(animations[0], true);
        
        const numb = animsController.currentFrame.frame.name;
        if (numb == 69) {
            this.hp--;
            this.gotDamage = false;
        }
      
    }

    Die() {
        
      const animations = this.animationSets.get('Death');
      const animsController = this.anims;
        animsController.play(animations[0], true);
        const numb = animsController.currentFrame.frame.name;
      if (numb == 54)
        this.isDead = true;
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;
        if (x < 0) {
            this.setScale(0.5, 0.5);
            animsController.play(animations[0], true);
        } else if (x > 0) {
            this.setScale(-0.5, 0.5);
            animsController.play(animations[1], true);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const idle = this.animationSets.get('Idle');
            // const currentAnimation = animsController.currentAnim;
            // if (currentAnimation) {
            //     const frame = currentAnimation.getLastFrame();
            //     this.setTexture(frame.textureKey, frame.textureFrame);
            // }
            animsController.play(idle[0], true);
        }

    }

    setSteerings(steerings) {
        this.steerings = steerings;
    }
}