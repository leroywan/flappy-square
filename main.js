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
class Player extends Game {
    constructor(width = 10, height = 10, color = 'black', x = 450, y = 450) {
        super();
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    paint() {
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
class PlayerControls extends Game {
    constructor(player, keyState) {
        super();
        this.player = player;
        this.keyState = keyState;
    }
    _moveLeft() {
        if (!keyState.left)
            return;
        this.player.x--;
    }
    _moveUp() {
        if (!keyState.up)
            return;
        this.player.y--;
    }
    _moveRight() {
        if (!keyState.right)
            return;
        this.player.x++;
    }
    _moveDown() {
        if (!keyState.down)
            return;
        this.player.y++;
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
        return;
    }
    movePlayer() {
        this._resetToClosestBoundry();
        this._moveLeft();
        this._moveUp();
        this._moveRight();
        this._moveDown();
    }
}
const game = new Game();
const player = new Player();
const playerControls = new PlayerControls(player, keyState);
function draw() {
    game.clearFrame();
    playerControls.movePlayer();
    player.paint();
    window.requestAnimationFrame(draw);
}
draw();
