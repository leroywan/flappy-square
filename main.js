const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 600;
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
const BOUNDARY = {
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
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    printGameOver(player, animationId) {
        this.clearFrame();
        window.cancelAnimationFrame(animationId);
        this.ctx.fillStyle = "black";
        this.ctx.font = "60px Verdana";
        this.ctx.textAlign = "center";
        this.ctx.fillText("You ded X_X", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.ctx.font = "26px Verdana";
        this.ctx.fillText(`Your Score: ${player.score} `, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
    drawNewFrame(player, obstacle, powerUp) {
        playerControls.movePlayer();
        player.paint();
        obstacles.forEach((obstacle) => {
            obstacle.moveObstacle();
            obstacle.paint();
            handleCollision(player, obstacle);
        });
        powerUp.move();
        powerUp.paint();
        handleCollision(player, powerUp);
        player.printPlayerStatus();
    }
}
class GameItem extends Game {
    constructor(width = 10, height = 10, x = 450, y = 450, color = 'black', boundary) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.boundary = {
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
        this.x = getRandomInt(0, this.boundary.right);
        this.y = 0 - this.height - obstacleOffset;
        this.fallSpeed = 3;
    }
    _moveDown() {
        this.setPos(this.x, this.y + this.fallSpeed);
    }
    resetObstacle(offset) {
        this.y = 0 - this.height;
        this.x = getRandomInt(0, this.boundary.right);
    }
    moveObstacle() {
        this._moveDown();
        if (this.y > CANVAS_HEIGHT) {
            this.resetObstacle();
        }
    }
}
class Player extends GameItem {
    constructor() {
        super();
        this.life = 10;
        this.collisionDetected = true;
        this.score = 0;
    }
    _printScore() {
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Verdana";
        this.ctx.fillText(`Lives: ${this.life}`, 10, 30);
    }
    _printLives() {
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Verdana";
        this.ctx.fillText(`Score: ${this.score}`, 10, CANVAS_HEIGHT - 10);
    }
    gainLife() {
        this.life++;
        this.color = 'lightgreen';
    }
    loseLife() {
        this.color = 'red';
        this.life--;
    }
    setCollisionState() {
        this.collisionDetected = false;
        setTimeout(() => {
            this.collisionDetected = true;
            this.color = 'black';
        }, 500);
    }
    printPlayerStatus() {
        this._printScore();
        this._printLives();
    }
    incrementScore() {
        this.score++;
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
    _resetToClosestBOUNDARY() {
        let posX = this.player.x;
        let posY = this.player.y;
        if (this.player.x < BOUNDARY.LEFT) {
            posX = BOUNDARY.LEFT;
        }
        else if (this.player.y < BOUNDARY.TOP) {
            posY = BOUNDARY.TOP;
        }
        else if (this.player.x > BOUNDARY.RIGHT - this.player.width) {
            posX = BOUNDARY.RIGHT - this.player.width;
        }
        else if (this.player.y > BOUNDARY.BOTTOM - this.player.height) {
            posY = BOUNDARY.BOTTOM - this.player.height;
        }
        this.player.setPos(posX, posY);
    }
    movePlayer() {
        this._resetToClosestBOUNDARY();
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
class PowerUp extends GameItem {
    constructor() {
        super();
        this.moveSpeed = 1;
        this.width = 30;
        this.height = 30;
        this.x = getRandomInt(0, CANVAS_WIDTH - this.width);
        this.y = -500;
        this.color = 'orange';
        this.movingRight = (Math.random() >= 0.5); // random boolean
    }
    _switchDirections() {
        this.movingRight = !this.movingRight;
    }
    _outOfBounds() {
        return this.x < 0 || this.x > CANVAS_WIDTH - this.width;
    }
    resetToTop() {
        this.x = getRandomInt(0, CANVAS_WIDTH - this.width);
        this.y = -500;
    }
    move() {
        if (this._outOfBounds()) {
            this._switchDirections();
        }
        if (this.y > CANVAS_HEIGHT) {
            this.resetToTop();
        }
        if (this.movingRight) {
            this.x++;
        }
        else {
            this.x--;
        }
        this.y++;
    }
}
function handleCollision(player, gameObject) {
    if (player.y + player.height > gameObject.y &&
        player.y < (gameObject.y + gameObject.height) &&
        player.x + player.width > gameObject.x &&
        player.x < (gameObject.x + gameObject.width) &&
        player.collisionDetected) {
        player.setCollisionState();
        if (gameObject instanceof Obstacle) {
            player.loseLife();
            gameObject.resetObstacle(CANVAS_HEIGHT - this.height);
        }
        if (gameObject instanceof PowerUp) {
            player.gainLife();
            gameObject.resetToTop();
        }
    }
}
const game = new Game();
const player = new Player();
const playerControls = new PlayerControls(player, keyState);
const obstacles = [];
const powerUp = new PowerUp();
let obstacleOffset = 0;
for (let i = 0; i < 5; i++) {
    obstacles.push(new Obstacle(obstacleOffset));
    if (i % 2) {
        obstacleOffset += 50;
    }
}
let animationId;
function draw() {
    game.clearFrame();
    game.drawNewFrame(player, obstacles, powerUp);
    player.incrementScore();
    animationId = window.requestAnimationFrame(draw);
    if (player.life == 0) {
        game.printGameOver(player, animationId);
    }
}
draw();
