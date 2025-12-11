export class Sprite {
    constructor({ imageSrc, frameWidth, frameHeight, animations }) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = animations; // { idle: { row: 0, frames: 4 }, run: ... }

        this.currentAnimation = 'idle';
        this.currentFrame = 0;
        this.elapsedTime = 0;
        this.frameRate = 10; // fps
    }

    setAnimation(name) {
        if (this.currentAnimation !== name) {
            this.currentAnimation = name;
            this.currentFrame = 0;
            this.elapsedTime = 0;
        }
    }

    update(deltaTime) {
        this.elapsedTime += deltaTime;
        const interval = 1000 / this.frameRate;

        if (this.elapsedTime > interval) {
            this.currentFrame++;
            const maxFrames = this.animations[this.currentAnimation].frames;
            if (this.currentFrame >= maxFrames) {
                this.currentFrame = 0;
            }
            this.elapsedTime -= interval;
        }
    }

    draw(context, x, y, flipX = false) {
        if (!this.image.complete) return;

        const row = this.animations[this.currentAnimation].row;
        const col = this.currentFrame;

        context.save();
        if (flipX) {
            context.translate(x + this.frameWidth, y);
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                col * this.frameWidth,
                row * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                0, // Render at 0 relative to translated context
                0,
                this.frameWidth,
                this.frameHeight
            );
        } else {
            context.drawImage(
                this.image,
                col * this.frameWidth,
                row * this.frameHeight,
                this.frameWidth,
                this.frameHeight,
                x,
                y,
                this.frameWidth,
                this.frameHeight
            );
        }
        context.restore();
    }
}
