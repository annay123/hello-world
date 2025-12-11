import { Sprite } from './Sprite.js';

export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.width = 64;
        this.height = 64;
        this.x = x;
        this.y = y;

        this.vx = 2; // Patrol speed
        this.vy = 0;
        this.gravity = 0.5;

        this.facingRight = true;
        this.markedForDeletion = false;

        this.sprite = new Sprite({
            imageSrc: 'assets/enemy.png',
            frameWidth: 64,
            frameHeight: 64,
            animations: {
                idle: { row: 0, frames: 4 },
                run: { row: 1, frames: 6 },
                attack: { row: 2, frames: 3 }
            }
        });

        this.sprite.setAnimation('run');
    }

    update(deltaTime) {
        // Simple Patrol Logic
        // Move forward until hitting a wall or edge
        this.x += this.vx;
        this.y += this.vy;

        this.vy += this.gravity;

        this.handleCollision();

        // Boundaries/Turn around
        // Check for wall or edge of platform in next step
        // For now, just turn around on wall collision

        if (this.vx > 0) this.facingRight = true;
        else this.facingRight = false;

        this.sprite.update(deltaTime);
    }

    handleCollision() {
        const collision = this.game.level.checkCollision({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });

        // Vertical
        if (collision.collision && collision.tileY >= this.y + this.height - 10) {
            // Floor
            this.y = collision.tileY - this.height;
            this.vy = 0;
        }

        // Horizontal (Turn around)
        const hCollision = this.game.level.checkCollision({
            x: this.x + (this.vx > 0 ? 5 : -5), // Predict ahead
            y: this.y,
            width: this.width,
            height: this.height - 10 // Ignore floor for wall check
        });

        if (hCollision.collision && hCollision.tileType === 1) { // 1 is wall/ground
            this.vx *= -1;
        }
    }

    draw(context, cameraX) {
        this.sprite.draw(context, this.x - cameraX, this.y, !this.facingRight);
    }
}
