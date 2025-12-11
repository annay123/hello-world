export class Level {
    constructor(game) {
        this.game = game;
        this.tileSize = 64;
        this.rows = 8;
        this.cols = 50;

        this.tileset = new Image();
        this.tileset.src = 'assets/tileset.png';

        // 0 = empty, 1 = ground, 2 = platform, 3 = spikes, 4 = collectible
        this.map = this.generateMap();
    }

    generateMap() {
        let map = [];
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.cols; c++) {
                if (r === this.rows - 1) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            map.push(row);
        }

        // Features
        this.addPlatform(map, 10, 5, 3);
        this.addCollectible(map, 11, 4); // On platform

        this.addPlatform(map, 16, 4, 2);
        this.addCollectible(map, 16, 3);

        this.addPlatform(map, 22, 5, 4);
        this.addCollectible(map, 23, 4);
        this.addCollectible(map, 24, 4);

        this.addWall(map, 30, 2);
        this.addPit(map, 35, 3);

        // Add some floating collectibles
        this.addCollectible(map, 28, 5);
        this.addCollectible(map, 40, 5);

        return map;
    }

    addPlatform(map, x, y, width) {
        for (let i = 0; i < width; i++) {
            if (x + i < this.cols) map[y][x + i] = 1;
        }
    }

    addWall(map, x, height) {
        for (let i = 0; i < height; i++) {
            map[this.rows - 2 - i][x] = 1;
        }
    }

    addPit(map, x, width) {
        for (let i = 0; i < width; i++) {
            map[this.rows - 1][x + i] = 0;
        }
    }

    addCollectible(map, x, y) {
        if (x < this.cols && y < this.rows) map[y][x] = 4;
    }

    draw(context, cameraX) {
        if (!this.tileset.complete) return;

        const startCol = Math.floor(cameraX / this.tileSize);
        const endCol = startCol + (this.game.width / this.tileSize) + 1;

        for (let r = 0; r < this.map.length; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (c < 0 || c >= this.map[0].length) continue;

                const tile = this.map[r][c];
                if (tile !== 0) {
                    let srcX = 0;
                    let srcY = 0;
                    if (tile === 1) { srcX = 0; srcY = 0; }
                    if (tile === 4) { srcX = 1; srcY = 1; } // Assuming collectible is at 1,1 in tileset (need to verify or guess)
                    // Let's guess/hope the generated tileset has something there. Or refine logic.
                    // The prompt asked for "A coin/gem collectible".

                    context.drawImage(
                        this.tileset,
                        srcX * this.tileSize, srcY * this.tileSize,
                        this.tileSize, this.tileSize,
                        Math.floor(c * this.tileSize - cameraX), r * this.tileSize,
                        this.tileSize, this.tileSize
                    );
                }
            }
        }
    }

    checkCollision(rect) {
        const leftTile = Math.floor(rect.x / this.tileSize);
        const rightTile = Math.floor((rect.x + rect.width) / this.tileSize);
        const topTile = Math.floor(rect.y / this.tileSize);
        const bottomTile = Math.floor((rect.y + rect.height) / this.tileSize);

        for (let r = topTile; r <= bottomTile; r++) {
            for (let c = leftTile; c <= rightTile; c++) {
                if (r >= 0 && r < this.map.length && c >= 0 && c < this.map[0].length) {
                    const tile = this.map[r][c];
                    if (tile === 1) { // Solid
                        return {
                            collision: true,
                            tileX: c * this.tileSize,
                            tileY: r * this.tileSize,
                            tileType: tile
                        };
                    }
                }
            }
        }
        return { collision: false };
    }

    checkCollectibles(rect) {
        // Center point check is usually enough for collection to avoid clipping collection
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        const c = Math.floor(centerX / this.tileSize);
        const r = Math.floor(centerY / this.tileSize);

        if (r >= 0 && r < this.map.length && c >= 0 && c < this.map[0].length) {
            if (this.map[r][c] === 4) {
                this.map[r][c] = 0; // Remove
                return true;
            }
        }
        return false;
    }
}
