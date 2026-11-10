import { saveGame } from './game-database.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.runId = crypto.randomUUID();
        this.completed = false;
        document.getElementById('retrySave').addEventListener('click', () => this.saveScore());

        // Define the shapes (example rectangles here)
        this.shapes = [
            { x: 50, y: 50, width: 50, height: 50, name: 'Main' },
            { x: 150, y: 150, width: 50, height: 50, name: 'collectable' },
            { x: 250, y: 250, width: 50, height: 50, name: 'collectable' },
            { x: 400, y: 100, width: 50, height: 50, name: 'collectable' },
            { x: 100, y: 400, width: 50, height: 50, name: 'collectable' },
            { x: 350, y: 500, width: 50, height: 50, name: 'collectable' },
            { x: 500, y: 700, width: 50, height: 50, name: 'collectable' }
        ];

        // Start game loop
        this.update();

        // Handle keyboard input
        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    redraw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw each shape
        for (const shape of this.shapes) {
            this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
    }

    handleInput(e) {
        const directions = {
            ArrowRight: [10, 0],
            ArrowLeft: [-10, 0],
            ArrowDown: [0, 10],
            ArrowUp: [0, -10]
        };
        const direction = directions[e.key];
        if (!direction) return;
        e.preventDefault();
        const player = this.shapes[0];
        player.x = Math.max(0, Math.min(this.canvas.width - player.width, player.x + direction[0]));
        player.y = Math.max(0, Math.min(this.canvas.height - player.height, player.y + direction[1]));
    }

    async saveScore() {
        const status = document.getElementById('saveStatus');
        const retry = document.getElementById('retrySave');
        retry.hidden = true;
        status.textContent = 'Game complete! Saving score…';
        try {
            await saveGame(this.runId, this.score);
            status.textContent = 'Game complete! Score saved.';
        } catch (error) {
            console.error('Could not save score:', error);
            status.textContent = `Could not save your score: ${error.code || error.message}. Please try again.`;
            retry.hidden = false;
        }
    }

    checkCollision(obj1, obj2) {
        // Check if the two objects are colliding
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    update() {
        this.redraw();

        // Check every remaining block, including when several overlap the player.
        for (let i = this.shapes.length - 1; i > 0; i--) {
            if (this.checkCollision(this.shapes[0], this.shapes[i])) {
                this.score++;
                this.shapes.splice(i, 1);
            }
        }

        document.getElementById('gameScore').textContent = this.score;
        if (this.shapes.length === 1 && !this.completed) {
            this.completed = true;
            this.saveScore();
        }

        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => this.update());
    }
}

// Initialize the game
document.myGame = new Game();



// log the score once every second
setInterval(() => console.log(document.myGame.score), 1000);