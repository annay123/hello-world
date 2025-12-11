import { Sprite } from './Sprite.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 64;
        this.height = 64;
        this.x = 100;
        this.y = 100;

        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.5;
        this.speed = 5;
        this.jumpPower = -12;

        this.grounded = false;
        this.canDoubleJump = false;
        this.lastJumpKey = false;
        this.facingRight = true;

        // Combat
        this.health = 100;
        this.maxHealth = 100;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 300;
        this.lastAttackKey = false;
        this.invincible = false;
        this.invincibleTimer = 0;

        this.sprite = new Sprite({
            imageSrc: 'assets/player.png',
            frameWidth: 64,
            frameHeight: 64,
            animations: {
                idle: { row: 0, frames: 4 },
                run: { row: 1, frames: 6 },
                jump: { row: 2, frames: 2 },
                attack: { row: 3, frames: 3 }
            }
        });
    }

    update(deltaTime) {
        // Invincibility
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }

        // Attack Input
        if (this.game.input.keys.includes(' ')) {
            if (!this.isAttacking && !this.lastAttackKey) {
                this.attack();
            }
        }
        this.lastAttackKey = this.game.input.keys.includes(' ');

        if (this.isAttacking) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            } else {
                this.checkAttackCollision();
            }
        }

        // Movement
        if (this.game.input.keys.includes('ArrowRight')) {
            this.vx = this.speed;
            this.facingRight = true;
            if (this.grounded && !this.isAttacking) this.sprite.setAnimation('run');
        } else if (this.game.input.keys.includes('ArrowLeft')) {
            this.vx = -this.speed;
            this.facingRight = false;
            if (this.grounded && !this.isAttacking) this.sprite.setAnimation('run');
        } else {
            this.vx = 0;
            if (this.grounded && !this.isAttacking) this.sprite.setAnimation('idle');
        }

        // Jump
        if (this.game.input.keys.includes('ArrowUp')) {
            if (this.grounded) {
                this.vy = this.jumpPower;
                this.grounded = false;
                this.canDoubleJump = true;
                if (!this.isAttacking) this.sprite.setAnimation('jump');
            } else if (this.canDoubleJump && !this.lastJumpKey) {
                this.vy = this.jumpPower;
                this.canDoubleJump = false;
                if (!this.isAttacking) this.sprite.setAnimation('jump');
            }
        }
        this.lastJumpKey = this.game.input.keys.includes('ArrowUp');

        // Physics
        this.x += this.vx;
        this.handleHorizontalCollision();

        this.y += this.vy;
        if (!this.grounded) {
            this.vy += this.gravity;
            if (!this.isAttacking) this.sprite.setAnimation('jump');
        }
        this.handleVerticalCollision();

        // Collectibles
        if (this.game.level.checkCollectibles({ x: this.x, y: this.y, width: this.width, height: this.height })) {
            this.game.score += 50;
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > (this.game.level.cols * this.game.level.tileSize) - this.width) {
            this.x = (this.game.level.cols * this.game.level.tileSize) - this.width;
        }

        // Pit death
        if (this.y > this.game.height + 100) {
            this.takeDamage(100);
        }

        this.sprite.update(deltaTime);
    }

    attack() {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.sprite.setAnimation('attack');
    }

    checkAttackCollision() {
        const attackRange = 50;
        const hitBox = {
            x: this.facingRight ? this.x + this.width : this.x - attackRange,
            y: this.y,
            width: attackRange,
            height: this.height
        };

        this.game.enemies.forEach(enemy => {
            if (!enemy.markedForDeletion &&
                hitBox.x < enemy.x + enemy.width &&
                hitBox.x + hitBox.width > enemy.x &&
                hitBox.y < enemy.y + enemy.height &&
                hitBox.height + hitBox.y > enemy.y) {
                // Hit Enemy
                enemy.markedForDeletion = true;
                this.game.score += 100;
            }
        });
    }

    takeDamage(amount) {
        if (this.invincible) return;

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.game.isGameOver = true;
            document.getElementById('game-over-screen').classList.remove('hidden');
        } else {
            this.invincible = true;
            this.invincibleTimer = 1000;
        }

        const healthPct = (this.health / this.maxHealth) * 100;
        document.getElementById('health-bar').style.width = healthPct + '%';
    }

    handleHorizontalCollision() {
        const collision = this.game.level.checkCollision({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });

        if (collision.collision) {
            if (this.vx > 0) {
                this.x = collision.tileX - this.width;
            } else if (this.vx < 0) {
                this.x = collision.tileX + this.game.level.tileSize;
            }
        }
    }

    handleVerticalCollision() {
        const collision = this.game.level.checkCollision({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });

        if (collision.collision) {
            if (this.vy > 0) {
                this.y = collision.tileY - this.height;
                this.vy = 0;
                this.grounded = true;
                this.canDoubleJump = true;
            } else if (this.vy < 0) {
                this.y = collision.tileY + this.game.level.tileSize;
                this.vy = 0;
            }
        } else {
            this.grounded = false;
        }
    }

    draw(context, cameraX) {
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) return;
        this.sprite.draw(context, this.x - cameraX, this.y, !this.facingRight);
    }
}
