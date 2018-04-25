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

interface Boundary {
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
  boundary: Boundary,
}

interface Obstacle {
  fallSpeed: number,
}

interface PowerUp {
  moveSpeed: number,
  movingRight: boolean,
}

interface Player {
  life: number,
  collisionDetected: boolean,
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

const BOUNDARY = {
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
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  public printGameOver(player: Player, animationId): void {
    this.clearFrame();
    window.cancelAnimationFrame(animationId);
    this.ctx.fillStyle = "black";
    this.ctx.font = "60px Verdana";
    this.ctx.textAlign = "center";
    this.ctx.fillText("You ded X_X", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    this.ctx.font = "26px Verdana";
    this.ctx.fillText(`Your Score: ${player.score} `, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 60)
  }

  drawNewFrame(player: Player, obstacle: Obstacle[], powerUp: PowerUp): void {
    playerControls.movePlayer();
    player.paint();
    obstacles.forEach((obstacle)=>{
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

class GameItem extends Game implements GameItem {
  constructor(
    width: number = 10,
    height: number = 10,
    x: number = 450, 
    y: number = 450,
    color: string = 'black',
    boundary?,
  ) {
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
    this.x = getRandomInt(0, this.boundary.right);
    this.y = 0 - this.height - obstacleOffset;
    this.fallSpeed = 3;
  }

  private _moveDown() {
    this.setPos(this.x, this.y + this.fallSpeed);
  }

  public resetObstacle(offset?) {
    this.y = 0 - this.height;
    this.x = getRandomInt(0, this.boundary.right);
  }

  public moveObstacle() {
    this._moveDown();
    if (this.y > CANVAS_HEIGHT) {
      this.resetObstacle();
    }
  }
}

class Player extends GameItem implements Player{
  constructor() {
    super();
    this.life = 10;
    this.collisionDetected = true;
    this.score = 0;
  }

  private _printScore(): void {
    this.ctx.fillStyle = "black";
    this.ctx.font = "20px Verdana";
    this.ctx.fillText(`Lives: ${this.life}`, 10, 30);
  }

  private _printLives(): void {
    this.ctx.fillStyle = "black";
    this.ctx.font = "20px Verdana";
    this.ctx.fillText(`Score: ${this.score}`, 10, CANVAS_HEIGHT - 10)
  }

  public gainLife(): void {
    this.life++;
    this.color = 'lightgreen';
  }
  
  public loseLife(): void {
    this.color = 'red';
    this.life--;
  }

  public setCollisionState(): void {
    this.collisionDetected = false;
    setTimeout(()=>{
      this.collisionDetected = true;
      this.color = 'black';
    }, 500)
  }

  public printPlayerStatus(): void {
    this._printScore();
    this._printLives();
  }

  public incrementScore(): void {
    this.score++;
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

  private _resetToClosestBOUNDARY(): void {
    let posX = this.player.x;
    let posY = this.player.y;
    if (this.player.x < BOUNDARY.LEFT) {
      posX = BOUNDARY.LEFT;
    } else if (this.player.y < BOUNDARY.TOP) {
      posY = BOUNDARY.TOP;
    } else if (this.player.x > BOUNDARY.RIGHT - this.player.width) {
      posX = BOUNDARY.RIGHT - this.player.width;
    } else if (this.player.y > BOUNDARY.BOTTOM - this.player.height) {
      posY = BOUNDARY.BOTTOM - this.player.height;
    }
    this.player.setPos(posX, posY);
  }

  movePlayer() {
    this._resetToClosestBOUNDARY();
    if (keyState.left) { this._moveLeft() };
    if (keyState.up) {this._moveUp() };
    if (keyState.right) { this._moveRight() };
    if (keyState.down) { this._moveDown() };
  }
}

class PowerUp extends GameItem implements PowerUp {
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

  private _switchDirections() {
    this.movingRight = !this.movingRight;
  }

  private _outOfBounds() {
    return this.x < 0 || this.x > CANVAS_WIDTH - this.width;
  }

  public resetToTop() {
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
    } else {
      this.x--;
    }

    this.y++;
  }
}

function handleCollision(player: Player, gameObject: (Obstacle|PowerUp)): void {
  if (player.y + player.height > gameObject.y &&
    player.y < (gameObject.y + gameObject.height) &&
    player.x + player.width > gameObject.x &&
    player.x < (gameObject.x + gameObject.width) &&
    player.collisionDetected
  ){
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
const obstacles: Obstacle[] = [];
const powerUp = new PowerUp();

let obstacleOffset = 0;
for (let i=0; i<5; i++) {
  obstacles.push(new Obstacle(obstacleOffset));
  if (i % 2) {
    obstacleOffset += 50;
  }
}

let animationId;
function draw(): void {
  game.clearFrame();
  game.drawNewFrame(player, obstacles, powerUp);
  player.incrementScore();
  animationId = window.requestAnimationFrame(draw);
  if (player.life == 0) {
    game.printGameOver(player, animationId);
  }
}
draw();

