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
}

window.addEventListener('keyup', (e)=>{
  let keyPressed = e.which;
  switch(keyPressed) {
    case KEYS.LEFT:
      if (!keyState.left) break;
      keyState.left = false;
      break;
    case KEYS.UP:
    if (!keyState.up) break;
      keyState.up = false;
      break;
    case KEYS.RIGHT:
    if (!keyState.right) break;
      keyState.right = false;
      break;
    case KEYS.DOWN:
    if (!keyState.down) break;
      keyState.down = false;
      break;
  }
});

window.addEventListener('keydown', (e)=>{
  let keyPressed = e.which;
  switch(keyPressed) {
    case KEYS.LEFT:
      if (keyState.left) break;
      keyState.left = true;
      break;
    case KEYS.UP:
      if (keyState.up) break;
      keyState.up = true;
      break;
    case KEYS.RIGHT:
      if (keyState.right) break;
      keyState.right = true;
      break;
    case KEYS.DOWN:
      if (keyState.down) break;
      keyState.down = true;
      break;
  }
})


interface Game {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
}

interface Player {
  width: number,
  height: number,
  color: string,
  x: number,
  y: number,
}

const enum KEYS {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
}

interface KeyState {
  left: boolean,
  up: boolean,
  right: boolean,
  down: boolean,
}

interface PlayerControls {
  player: Player,
  keyState: KeyState,
}

const BOUNDRY = {
  LEFT: 0,
  TOP: 0,
  RIGHT: CANVAS_WIDTH,
  BOTTOM: CANVAS_HEIGHT,
}

class Game implements Game {
  constructor() {
    this.canvas = <HTMLCanvasElement>document.getElementById('square-game');
    this.ctx = this.canvas.getContext('2d');
  }

  clearFrame(): void {
    this.ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
  }

  protected isOutOfBounds(itemPosX: number, itemPosY: number, itemWidth: number = 0, itemHeight: number = 0) {
    if (itemPosX < BOUNDRY.LEFT) return true;
    if (itemPosY < BOUNDRY.TOP) return true;
    if (itemPosX > BOUNDRY.RIGHT - itemWidth) return true;
    if (itemPosY > BOUNDRY.BOTTOM - itemHeight) return true;
    
    return false;
  }
}

class Player extends Game implements Player{
  constructor(
      width: number = 10,
      height: number = 10,
      color: string = 'black',
      x: number = 450, 
      y: number = 450,
    ) {
    super()
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  setPos(x: number, y: number){ 
    this.x = x;
    this.y = y;
  }

  paint() {
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class PlayerControls extends Game implements PlayerControls {
  constructor(player, keyState) {
    super();
    this.player = player;
    this.keyState = keyState;
  }

  private _moveLeft() {
    if (!keyState.left) return;
    this.player.x--;
  }

  private _moveUp() {
    if (!keyState.up) return;
    this.player.y--;
  }

  private _moveRight() {
    if (!keyState.right) return;
    this.player.x++;
  }

  private _moveDown() {
    if (!keyState.down) return;
    this.player.y++;
  }

  private _resetToClosestBoundry() {
    let posX = this.player.x;
    let posY = this.player.y;
    if (this.player.x < BOUNDRY.LEFT) {
      posX = BOUNDRY.LEFT;
    } else if (this.player.y < BOUNDRY.TOP) {
      posY = BOUNDRY.TOP;
    } else if (this.player.x > BOUNDRY.RIGHT - this.player.width) {
      posX = BOUNDRY.RIGHT - this.player.width;
    } else if (this.player.y > BOUNDRY.BOTTOM - this.player.height) {
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
function draw(): void {
  game.clearFrame();
  playerControls.movePlayer();
  player.paint();
  window.requestAnimationFrame(draw);
}
draw();

