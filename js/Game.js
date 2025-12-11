import { InputHandler } from './InputHandler.js';
import { Player } from './Player.js';
import { Level } from './Level.js';
import { Enemy } from './Enemy.js';

export class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.input = new InputHandler();
        this.level = new Level(this);
        this.player = new Player(this);
        this.enemies = [];

        this.camera = { x: 0, y: 0 };

        this.setupEnemies();

        // Game State
        this.isGameOver = false;
        this.score = 0;
    }

    setupEnemies() {
        this.enemies = [
            new Enemy(this, 1200, 100),
            new Enemy(this, 1600, 100),
            new Enemy(this, 2200, 100),
            new Enemy(this, 2800, 100)
        ];
    }

    update(deltaTime) {
        if (this.isGameOver) {
            if (this.input.keys.includes('r')) {
                this.restart();
            }
            return;
        }

        this.player.update(deltaTime);

        // Update Enemies
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            // Check collision with player (Contact Damage)
            if (this.checkCollision(this.player, enemy)) {
                this.player.takeDamage(20);
            }
        });

        // Camera logic: Follow player
        this.camera.x = this.player.x - this.width / 2 + this.player.width / 2;

        // Clamp camera
        if (this.camera.x < 0) this.camera.x = 0;
        const maxScroll = (this.level.cols * this.level.tileSize) - this.width;
        if (this.camera.x > maxScroll) this.camera.x = maxScroll;
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    draw(context) {
        context.fillStyle = 'black';
        // context.fillRect(0, 0, this.width, this.height);

        this.level.draw(context, this.camera.x);

        this.enemies.forEach(enemy => {
            enemy.draw(context, this.camera.x);
        });

        this.player.draw(context, this.camera.x);

        context.fillStyle = 'white';
        context.font = '20px "Press Start 2P"';
        context.fillText("Score: " + this.score, 600, 50);
    }

    restart() {
        this.isGameOver = false;
        this.score = 0;
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('health-bar').style.width = '100%';

        this.level = new Level(this);
        this.player = new Player(this);
        this.setupEnemies();
        this.camera.x = 0;
    }
}
