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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}


interface Game {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
}

interface Boundry {
  left: number,
  top: number,
  right: number,
  bottom: number
}
interface GameItem {
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  boundry: Boundry,
}

interface Obstacle {
  fallSpeed: number,
}

interface Player {
  life: number,
  active: boolean,
  score: number,
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
  speedX: number,
  speedY: number,
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

  protected isOutOfBounds(itemPosX: number, itemPosY: number, itemWidth: number = 0, itemHeight: number = 0): boolean {
    if (itemPosX < BOUNDRY.LEFT) return true;
    if (itemPosY < BOUNDRY.TOP) return true;
    if (itemPosX > BOUNDRY.RIGHT - itemWidth) return true;
    if (itemPosY > BOUNDRY.BOTTOM - itemHeight) return true;
    
    return false;
  }
}

class GameItem extends Game implements GameItem {
  constructor(
    width: number = 10,
    height: number = 10,
    x: number = 450, 
    y: number = 450,
    color: string = 'black',
    boundry?,
  ) {
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
    }
  }

  setPos(x: number, y: number): void{ 
    this.x = x;
    this.y = y;
  }

  paint(): void {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Obstacle extends GameItem implements Obstacle {
  constructor(obstacleOffset) {
    super(getRandomInt(30, 80), 10);
    this.x = getRandomInt(0, this.boundry.right);
    this.y = 0 - this.height - obstacleOffset;
    this.fallSpeed = 3;
  }

  private _moveDown() {
    this.setPos(this.x, this.y + this.fallSpeed);
  }

  private _resetObstacle() {
    this.y = 0 - this.height;
    this.x = getRandomInt(0, this.boundry.right);
  }

  public moveObstacle() {
    this._moveDown();
    if (this.y > CANVAS_HEIGHT) {
      this._resetObstacle();
    }
  }
}

class Player extends GameItem implements Player{
  constructor() {
    super();
    this.life = 10;
    this.active = true;
    this.score = 0;
  }
}

class PlayerControls extends Game implements PlayerControls {
  constructor(player, keyState) {
    super();
    this.player = player;
    this.keyState = keyState;
    this.speedX = 0.2 * this.player.width;
    this.speedY = 0.15 * this.player.height;
  }

  private _moveLeft(): void {
    this.player.x = this.player.x - this.speedX;
  }

  private _moveUp(): void {
    this.player.y = this.player.y - this.speedY;
  }

  private _moveRight(): void {
    this.player.x = this.player.x + this.speedX;
  }

  private _moveDown(): void {
    this.player.y = this.player.y + this.speedY;
  }

  private _resetToClosestBoundry(): void {
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
  }

  movePlayer() {
    this._resetToClosestBoundry();
    if (keyState.left) { this._moveLeft() };
    if (keyState.up) {this._moveUp() };
    if (keyState.right) { this._moveRight() };
    if (keyState.down) { this._moveDown() };
  }
}

function handleCollision(player: Player, obstacle: (Obstacle)): void {
  if (player.y < obstacle.y + 10 &&
    player.y > obstacle.y - 10 &&
    player.x > obstacle.x &&
    player.x < (obstacle.x + obstacle.width)
  ){
    if (player.active) {
      player.life--;
      player.color = 'red';
      player.active = false;
      setTimeout(()=>{
        player.active = true;
        player.color = 'black';
      }, 500)
    }
  }
}

const game = new Game();
const player = new Player();
const playerControls = new PlayerControls(player, keyState);
const obstacles: Obstacle[] = [];
let obstacleOffset = 0;
for (let i=0; i<30; i++) {
  obstacles.push(new Obstacle(obstacleOffset));
  if (i % 2) {
    obstacleOffset += 50;
  }
}

let animationId;
function draw(): void {
  game.clearFrame();
  game.ctx.font = "20px Verdana";
  game.ctx.fillText(`Lives: ${player.life}`, 10, 30);
  game.ctx.fillText(`Score: ${player.score}`, 10, CANVAS_HEIGHT - 10)
  playerControls.movePlayer();
  player.paint();
  obstacles.forEach((obstacle)=>{
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
    game.ctx.fillText("You ded X_X", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    game.ctx.font = "26px Verdana";
    game.ctx.fillText(`Your Score: ${player.score} `, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60)
  }
}
draw();

