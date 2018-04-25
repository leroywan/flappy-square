const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const canvas = document.createElement('canvas');
document.getElementById("game-root").appendChild(canvas);
canvas.setAttribute("id", "square-game");
canvas.setAttribute("height", CANVAS_HEIGHT.toString());
canvas.setAttribute("width", CANVAS_WIDTH.toString());
const keyState = {
    left: false,
    up: false,
    right: false,
    down: false,
};
window.addEventListener('keyup', (e) => {
    let keyPressed = e.which;
    switch (keyPressed) {
        case 37 /* LEFT */:
            if (!keyState.left)
                break;
            keyState.left = false;
            break;
        case 38 /* UP */:
            if (!keyState.up)
                break;
            keyState.up = false;
            break;
        case 39 /* RIGHT */:
            if (!keyState.right)
                break;
            keyState.right = false;
            break;
        case 40 /* DOWN */:
            if (!keyState.down)
                break;
            keyState.down = false;
            break;
    }
});
window.addEventListener('keydown', (e) => {
    let keyPressed = e.which;
    switch (keyPressed) {
        case 37 /* LEFT */:
            if (keyState.left)
                break;
            keyState.left = true;
            break;
        case 38 /* UP */:
            if (keyState.up)
                break;
            keyState.up = true;
            break;
        case 39 /* RIGHT */:
            if (keyState.right)
                break;
            keyState.right = true;
            break;
        case 40 /* DOWN */:
            if (keyState.down)
                break;
            keyState.down = true;
            break;
    }
});
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
const BOUNDRY = {
    LEFT: 0,
    TOP: 0,
    RIGHT: CANVAS_WIDTH,
    BOTTOM: CANVAS_HEIGHT,
};
class Game {
    constructor() {
        this.canvas = document.getElementById('square-game');
        this.ctx = this.canvas.getContext('2d');
    }
    clearFrame() {
        this.ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
    }
    isOutOfBounds(itemPosX, itemPosY, itemWidth = 0, itemHeight = 0) {
        if (itemPosX < BOUNDRY.LEFT)
            return true;
        if (itemPosY < BOUNDRY.TOP)
            return true;
        if (itemPosX > BOUNDRY.RIGHT - itemWidth)
            return true;
        if (itemPosY > BOUNDRY.BOTTOM - itemHeight)
            return true;
        return false;
    }
}
class GameItem extends Game {
    constructor(width = 10, height = 10, x = 450, y = 450, color = 'black', boundry) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.boundry = {
            left: 0,
            top: 0,
            right: CANVAS_WIDTH - width,
            bottom: CANVAS_HEIGHT - height,
        };
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    paint() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
class Obstacle extends GameItem {
    constructor(obstacleOffset) {
        super(getRandomInt(30, 80), 10);
        this.x = getRandomInt(0, this.boundry.right);
        this.y = 0 - this.height - obstacleOffset;
        this.fallSpeed = 3;
    }
    _moveDown() {
        this.setPos(this.x, this.y + this.fallSpeed);
    }
    _resetObstacle() {
        this.y = 0 - this.height;
        this.x = getRandomInt(0, this.boundry.right);
    }
    moveObstacle() {
        this._moveDown();
        if (this.y > CANVAS_HEIGHT) {
            this._resetObstacle();
        }
    }
}
class Player extends GameItem {
    constructor() {
        super();
        this.life = 10;
        this.active = true;
        this.score = 0;
    }
}
class PlayerControls extends Game {
    constructor(player, keyState) {
        super();
        this.player = player;
        this.keyState = keyState;
        this.speedX = 0.2 * this.player.width;
        this.speedY = 0.15 * this.player.height;
    }
    _moveLeft() {
        this.player.x = this.player.x - this.speedX;
    }
    _moveUp() {
        this.player.y = this.player.y - this.speedY;
    }
    _moveRight() {
        this.player.x = this.player.x + this.speedX;
    }
    _moveDown() {
        this.player.y = this.player.y + this.speedY;
    }
    _resetToClosestBoundry() {
        let posX = this.player.x;
        let posY = this.player.y;
        if (this.player.x < BOUNDRY.LEFT) {
            posX = BOUNDRY.LEFT;
        }
        else if (this.player.y < BOUNDRY.TOP) {
            posY = BOUNDRY.TOP;
        }
        else if (this.player.x > BOUNDRY.RIGHT - this.player.width) {
            posX = BOUNDRY.RIGHT - this.player.width;
        }
        else if (this.player.y > BOUNDRY.BOTTOM - this.player.height) {
            posY = BOUNDRY.BOTTOM - this.player.height;
        }
        this.player.setPos(posX, posY);
    }
    movePlayer() {
        this._resetToClosestBoundry();
        if (keyState.left) {
            this._moveLeft();
        }
        ;
        if (keyState.up) {
            this._moveUp();
        }
        ;
        if (keyState.right) {
            this._moveRight();
        }
        ;
        if (keyState.down) {
            this._moveDown();
        }
        ;
    }
}
function handleCollision(player, obstacle) {
    if (player.y < obstacle.y + 10 &&
        player.y > obstacle.y - 10 &&
        player.x > obstacle.x &&
        player.x < (obstacle.x + obstacle.width)) {
        if (player.active) {
            player.life--;
            player.color = 'red';
            player.active = false;
            setTimeout(() => {
                player.active = true;
                player.color = 'black';
            }, 500);
        }
    }
}
const game = new Game();
const player = new Player();
const playerControls = new PlayerControls(player, keyState);
const obstacles = [];
let obstacleOffset = 0;
for (let i = 0; i < 30; i++) {
    obstacles.push(new Obstacle(obstacleOffset));
    if (i % 2) {
        obstacleOffset += 50;
    }
}
let animationId;
function draw() {
    game.clearFrame();
    game.ctx.font = "20px Verdana";
    game.ctx.fillText(`Lives: ${player.life}`, 10, 30);
    game.ctx.fillText(`Score: ${player.score}`, 10, CANVAS_HEIGHT - 10);
    playerControls.movePlayer();
    player.paint();
    obstacles.forEach((obstacle) => {
        obstacle.moveObstacle();
        obstacle.paint();
        handleCollision(player, obstacle);
    });
    animationId = window.requestAnimationFrame(draw);
    player.score++;
    if (player.life == 0) {
        game.clearFrame();
        window.cancelAnimationFrame(animationId);
        game.ctx.font = "60px Verdana";
        game.ctx.textAlign = "center";
        game.ctx.fillText("You ded X_X", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        game.ctx.font = "26px Verdana";
        game.ctx.fillText(`Your Score: ${player.score} `, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
}
draw();
