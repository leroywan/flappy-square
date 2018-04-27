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
function handleKeyEvents(event) {
    let keyDownPressed = (event.type === 'keydown');
    let keyPressed = event.which;
    switch (keyPressed) {
        case KEYS.LEFT:
            keyState.left = keyDownPressed;
            break;
        case KEYS.UP:
            keyState.up = keyDownPressed;
            break;
        case KEYS.RIGHT:
            keyState.right = keyDownPressed;
            break;
        case KEYS.DOWN:
            keyState.down = keyDownPressed;
            break;
    }
}
window.addEventListener('keyup', handleKeyEvents);
window.addEventListener('keydown', handleKeyEvents);
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
var KEYS;
(function (KEYS) {
    KEYS[KEYS["LEFT"] = 37] = "LEFT";
    KEYS[KEYS["UP"] = 38] = "UP";
    KEYS[KEYS["RIGHT"] = 39] = "RIGHT";
    KEYS[KEYS["DOWN"] = 40] = "DOWN";
})(KEYS || (KEYS = {}));
class Game {
    constructor() {
        this.canvas = document.getElementById('square-game');
        this.ctx = this.canvas.getContext('2d');
    }
    clearFrame() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
class GameItem extends Game {
    constructor(width = 10, height = 10, x = 450, y = 450, color = 'black', speed = 2, boundary) {
        super();
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.boundary = boundary;
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
    }
    paint() {
        super.paint();
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    _moveDown() {
        this.setPos(this.x, this.y + this.speed);
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
        this.life = 5;
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
    setSize(width, height) {
        this.width = width;
        this.height = height;
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
class PlayerControls {
    constructor(player, keyState) {
        this.player = player;
        this.keyState = keyState;
        this.speedX = 2;
        this.speedY = 1.5;
    }
    moveLeft() {
        this.player.x = this.player.x - this.speedX;
    }
    moveUp() {
        this.player.y = this.player.y - this.speedY;
    }
    moveRight() {
        this.player.x = this.player.x + this.speedX;
    }
    moveDown() {
        this.player.y = this.player.y + this.speedY;
    }
    resetToClosestBoundary() {
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
        this.resetToClosestBoundary();
        if (keyState.left) {
            this.moveLeft();
        }
        ;
        if (keyState.up) {
            this.moveUp();
        }
        ;
        if (keyState.right) {
            this.moveRight();
        }
        ;
        if (keyState.down) {
            this.moveDown();
        }
        ;
    }
}
class Trap extends GameItem {
    constructor() {
        super();
        this.color = 'red';
        this.width = 60;
        this.height = 30;
        this.y = 0 - this.height;
    }
    move() {
        this.setPos(this.x, this.y + this.speed);
    }
    resetToTop() {
        this.x = getRandomInt(0, CANVAS_WIDTH - this.width);
        this.y = -1000;
    }
}
class PowerUp extends GameItem {
    constructor() {
        super();
        this.moveSpeed = 1;
        this.width = 25;
        this.height = 25;
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
        if (gameObject instanceof Trap) {
            player.setPos(player.x - player.width / 2, player.y - player.height / 2);
            player.setSize(player.width * 2, player.width * 2);
            gameObject.resetToTop();
        }
    }
}
function handleGamePlay(player, playerControls, obstacles, powerUp, trap) {
    playerControls.movePlayer();
    player.paint();
    trap.move();
    trap.paint();
    obstacles.forEach((obstacle) => {
        obstacle.moveObstacle();
        obstacle.paint();
        handleCollision(player, obstacle);
    });
    powerUp.move();
    powerUp.paint();
    handleCollision(player, powerUp);
    handleCollision(player, trap);
    player.incrementScore();
    player.printPlayerStatus();
}
function printGameOver(game, animationId) {
    game.clearFrame();
    window.cancelAnimationFrame(animationId);
    game.ctx.fillStyle = "black";
    game.ctx.font = "60px Verdana";
    game.ctx.textAlign = "center";
    game.ctx.fillText("You ded X_X", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    game.ctx.font = "26px Verdana";
    game.ctx.fillText(`Your Score: ${player.score} `, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
}
// Instantiate objects
const game = new Game();
const player = new Player();
const playerControls = new PlayerControls(player, keyState);
const obstacles = [];
const powerUp = new PowerUp();
const trap = new Trap();
let obstacleOffset = 0;
for (let i = 0; i < 30; i++) {
    obstacles.push(new Obstacle(obstacleOffset));
    // create 2 obstacles at once
    if (i % 2) {
        obstacleOffset += 100;
    }
}
// Run the animation
let animationId;
function draw() {
    game.clearFrame();
    handleGamePlay(player, playerControls, obstacles, powerUp, trap);
    animationId = window.requestAnimationFrame(draw);
    if (player.life == 0) {
        printGameOver(game, animationId);
    }
}
draw();
