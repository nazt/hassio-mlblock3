const {
    mlxElement,
    mlxElementInput,
    mlxElementModel,
    mlxElementOutput,
    mlxElementLocakableOutput,
    mlxLabel,
    mlxOscillator,
    mlxConsoleLog,
    mlxSpeech,
    mlxAudioInput,
    mlxFFTSpectrum,
    mlxTextInput,
} = require('./mlxElement');

class mlxGamePad extends mlxElementInput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Input';
        this.type = 'GamePad';
        this.title = 'GamePad';

        this.inType = 'none';
        this.outType = 'results';

        this.needMouse = true;
        this.canvasSize = 120;
        this.createElementMenu();

        this.w = this.canvasSize + this.mlx.mlxPadding * 2;
        this.h = 96 + 48 + 32 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;

        let y = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        let x = this.mlx.mlxPadding + 43;
        this.buttonA = this.mlx.createButton(
            this,
            'A',
            () => {
                this.cmd('A');
            },
            x,
            y,
            34,
            24
        );
        this.buttonA.border = true;
        x = this.mlx.mlxPadding;
        y += 32;
        this.buttonB = this.mlx.createButton(
            this,
            'B',
            () => {
                this.cmd('B');
            },
            x,
            y,
            34,
            24
        );
        this.buttonB.border = true;
        x += 43;
        this.buttonC = this.mlx.createButton(
            this,
            'C',
            () => {
                this.cmd('C');
            },
            x,
            y,
            34,
            24
        );
        this.buttonC.border = true;
        x += 44;
        this.buttonD = this.mlx.createButton(
            this,
            'D',
            () => {
                this.cmd('D');
            },
            x,
            y,
            34,
            24
        );
        this.buttonD.border = true;
        x = this.mlx.mlxPadding + 43;
        y += 32;
        this.buttonE = this.mlx.createButton(
            this,
            'E',
            () => {
                this.cmd('E');
            },
            x,
            y,
            34,
            24
        );
        this.buttonE.border = true;

        x = this.mlx.mlxPadding;
        y += 48;
        this.buttonF = this.mlx.createButton(
            this,
            'F',
            () => {
                this.cmd('F');
            },
            x,
            y,
            34,
            24
        );
        this.buttonF.border = true;
        x += 43;
        this.buttonG = this.mlx.createButton(
            this,
            'G',
            () => {
                this.cmd('G');
            },
            x,
            y,
            34,
            24
        );
        this.buttonG.border = true;
        x += 44;
        this.buttonH = this.mlx.createButton(
            this,
            'H',
            () => {
                this.cmd('H');
            },
            x,
            y,
            34,
            24
        );
        this.buttonH.border = true;

        x = this.mlx.mlxPadding;
        y += 32;
        this.buttonI = this.mlx.createButton(
            this,
            'I',
            () => {
                this.cmd('I');
            },
            x,
            y,
            34,
            24
        );
        this.buttonI.border = true;
        x += 43;
        this.buttonJ = this.mlx.createButton(
            this,
            'J',
            () => {
                this.cmd('J');
            },
            x,
            y,
            34,
            24
        );
        this.buttonJ.border = true;
        x += 44;
        this.buttonK = this.mlx.createButton(
            this,
            'K',
            () => {
                this.cmd('K');
            },
            x,
            y,
            34,
            24
        );
        this.buttonK.border = true;

        this.output = '';
        this.outputIsReady = false;
        this.ready = true;
    }

    cmd(cmd) {
        //console.log(cmd);
        this.output = {
            label: cmd,
        };
        this.outputIsReady = true;
    }
    doProcess() {
        if (!this.outputIsReady) {
            return false;
        }
        this.numResults = 1;
        this.busy = false;
        this.outputIsReady = true;
        return true;
    }
}

class mlxSnakeGame extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'SnakeGame';
        this.title = 'Snake Game';

        this.inType = 'results';
        this.outType = 'results';

        this.needMouse = true;
        this.score = 0;
        this.canvasSize = 300;
        this.gameRunning = false;

        this.fps = 5;

        this.createElementMenu();

        this.numSegments = 0;
        this.direction = 'right';

        this.xStart = 0; //starting x coordinate for snake
        this.yStart = 150; //starting y coordinate for snake
        this.diff = 6;

        this.xCor = [];
        this.yCor = [];
        this.xFruit = 0;
        this.yFruit = 0;

        //this.startGame();

        this.offScreenX = this.mlx.mlxPadding;
        this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.offScreen = this.mlx.createCanvas(
            this,
            this.offScreenX,
            this.offScreenY,
            this.canvasSize,
            this.canvasSize
        );
        this.canvas = this.offScreen.offScreen;
        this.canvas.strokeWeight(this.diff);
        this.canvas.stroke(255);
        this.canvas.background(0);

        this.w = this.canvasSize + this.mlx.mlxPadding * 2;
        this.h = this.canvasSize + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 + 32;

        this.labelScore = this.mlx.createLabel(
            this,
            this.score,
            this.mlx.mlxPadding,
            this.offScreenY + this.canvasSize + 5,
            this.w - this.mlx.mlxPadding * 2,
            24
        );
        this.setScore(0);

        this.buttonStart = this.mlx.createButton(
            this,
            'Start',
            () => {
                this.startGame();
            },
            this.w - this.mlx.mlxPadding - 80,
            this.offScreenY + this.canvasSize + 5,
            80,
            24
        );
        this.buttonStart.border = true;

        this.then = Date.now();
        this.output = this.canvas;
        this.ready = true;
    }

    startGame() {
        this.xStart = 0; //starting x coordinate for snake
        this.yStart = 150; //starting y coordinate for snake
        this.xCor = [];
        this.yCor = [];
        this.xFruit = 0;
        this.yFruit = 0;
        this.numSegments = 10;
        for (let i = 0; i < this.numSegments; i++) {
            this.xCor.push(this.xStart + i * this.diff);
            this.yCor.push(this.yStart);
        }
        this.updateFruitCoordinates();
        this.gameRunning = true;
    }

    setScore(score) {
        this.score = score;
        this.labelScore.setText(`Score: ${this.score}`);
    }

    updateFruitCoordinates() {
        /*
      The complex math logic is because I wanted the point to lie
      in between 100 and width-100, and be rounded off to the nearest
      number divisible by 10, since I move the snake in multiples of 10.
    */

        this.xFruit = this.p5.floor(this.p5.random(5, this.canvasSize / this.diff - 5)) * this.diff;
        this.yFruit = this.p5.floor(this.p5.random(5, this.canvasSize / this.diff - 5)) * this.diff;
        //console.log("Fruit", this.xFruit, this.yFruit);
    }

    checkForFruit() {
        this.canvas.point(this.xFruit + this.diff / 2, this.yFruit + this.diff / 2);
        if (
            this.xCor[this.xCor.length - 1] === this.xFruit &&
            this.yCor[this.yCor.length - 1] === this.yFruit
        ) {
            this.setScore(this.score + 1);
            this.xCor.unshift(this.xCor[0]);
            this.yCor.unshift(this.yCor[0]);
            this.numSegments++;
            this.updateFruitCoordinates();
        }
    }

    checkSnakeCollision() {
        const snakeHeadX = this.xCor[this.xCor.length - 1];
        const snakeHeadY = this.yCor[this.yCor.length - 1];
        for (let i = 0; i < this.xCor.length - 1; i++) {
            if (this.xCor[i] === snakeHeadX && this.yCor[i] === snakeHeadY) {
                return true;
            }
        }
    }

    checkGameStatus() {
        if (
            this.xCor[this.xCor.length - 1] > this.canvasSize ||
            this.xCor[this.xCor.length - 1] < 0 ||
            this.yCor[this.yCor.length - 1] > this.canvasSize ||
            this.yCor[this.yCor.length - 1] < 0 ||
            this.checkSnakeCollision()
        ) {
            this.labelScore.setText('Game ended! Score: ' + this.score);
            this.gameRunning = false;
        }
    }

    draw(p5) {
        super.draw(p5);
        if (this.gameRunning) {
            let fpsInterval = 1000 / this.fps;
            this.now = Date.now();
            let elapsed = this.now - this.then;

            if (elapsed > fpsInterval) {
                this.canvas.background(0);
                for (let i = 0; i < this.numSegments - 1; i++) {
                    this.canvas.line(
                        this.xCor[i] + this.diff / 2,
                        this.yCor[i] + this.diff / 2,
                        this.xCor[i + 1] + this.diff / 2,
                        this.yCor[i + 1] + this.diff / 2
                    );
                }
                this.updateSnakeCoordinates();
                this.checkGameStatus();
                this.checkForFruit();
                this.then = this.now - (elapsed % fpsInterval);
            }
        } else {
        }
    }

    doProcess() {
        this.results = this.inElement.output;
        //console.log(this.results);
        this.key = null;
        if (Array.isArray(this.results)) {
            if (this.results[0].label) {
                this.key = this.results[0].label;
            }
        } else {
            if (this.results.label) {
                this.key = this.results.label;
            }
        }
        if (this.key == 'A') {
            if (this.direction !== 'down') this.direction = 'up';
        } else if (this.key == 'B') {
            if (this.direction !== 'right') this.direction = 'left';
        } else if (this.key == 'D') {
            if (this.direction !== 'left') this.direction = 'right';
        } else if (this.key == 'E') {
            if (this.direction !== 'up') this.direction = 'down';
        }

        this.busy = false;
        this.outputIsReady = true;
        this.output = this.inElement.output;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }

    updateSnakeCoordinates() {
        for (let i = 0; i < this.numSegments - 1; i++) {
            this.xCor[i] = this.xCor[i + 1];
            this.yCor[i] = this.yCor[i + 1];
        }
        switch (this.direction) {
            case 'right':
                this.xCor[this.numSegments - 1] = this.xCor[this.numSegments - 2] + this.diff;
                this.yCor[this.numSegments - 1] = this.yCor[this.numSegments - 2];
                break;
            case 'up':
                this.xCor[this.numSegments - 1] = this.xCor[this.numSegments - 2];
                this.yCor[this.numSegments - 1] = this.yCor[this.numSegments - 2] - this.diff;
                break;
            case 'left':
                this.xCor[this.numSegments - 1] = this.xCor[this.numSegments - 2] - this.diff;
                this.yCor[this.numSegments - 1] = this.yCor[this.numSegments - 2];
                break;
            case 'down':
                this.xCor[this.numSegments - 1] = this.xCor[this.numSegments - 2];
                this.yCor[this.numSegments - 1] = this.yCor[this.numSegments - 2] + this.diff;
                break;
        }
    }
}

// mlxPongGame
class mlxPongGame extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'PongGame';
        this.title = 'Pong Game';

        this.inType = 'results';
        this.outType = 'results';

        this.needMouse = true;
        this.score = 0;
        this.canvasSizeW = 400;
        this.canvasSizeH = 300;
        this.gameRunning = false;

        this.fps = 60;

        this.createElementMenu();

        this.width = this.canvasSizeW;
        this.height = this.canvasSizeH;
        this.MAX_SPEED = 5;
        this.paddleA = this.p5.createSprite(15, this.height / 2, 10, 70);
        this.paddleA.immovable = true;
        this.paddleB = this.p5.createSprite(this.width - 14, this.height / 2, 10, 70);
        this.paddleB.immovable = true;

        this.wallTop = this.p5.createSprite(this.width / 2, 0, this.width, 1);
        this.wallTop.immovable = true;

        this.wallBottom = this.p5.createSprite(this.width / 2, this.height - 1, this.width, 1);
        this.wallBottom.immovable = true;

        this.ball = this.p5.createSprite(this.width / 2, this.height / 2, 10, 10);
        this.ball.maxSpeed = this.MAX_SPEED;

        this.paddleA.shapeColor = this.paddleB.shapeColor = this.ball.shapeColor = this.p5.color(
            255,
            255,
            255
        );
        this.wallTop.shapeColor = this.wallBottom.shapeColor = this.p5.color(0, 0, 0, 0);

        this.ball.setSpeed(this.MAX_SPEED, -180);

        this.group = new this.p5.Group();
        this.paddleA.addToGroup(this.group);
        this.paddleB.addToGroup(this.group);
        this.wallTop.addToGroup(this.group);
        this.wallBottom.addToGroup(this.group);
        this.paddleA.addToGroup(this.group);
        this.ball.addToGroup(this.group);

        this.numSegments = 0;
        this.direction = 'right';

        this.xStart = 0; //starting x coordinate for snake
        this.yStart = 150; //starting y coordinate for snake
        this.diff = 2;

        this.offScreenX = this.mlx.mlxPadding;
        this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.p5.fill(0);
        this.p5.rect(
            this.x + this.offScreenX,
            this.y + this.offScreenY,
            this.canvasSizeW,
            this.canvasSizeH
        );
        this.p5.strokeWeight(this.diff);
        this.p5.stroke(255);

        this.w = this.canvasSizeW + this.mlx.mlxPadding * 2;
        this.h = this.canvasSizeH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 + 32;

        this.labelScore = this.mlx.createLabel(
            this,
            this.score,
            this.mlx.mlxPadding,
            this.offScreenY + this.canvasSizeH + 5,
            this.w - this.mlx.mlxPadding * 2,
            24
        );
        this.setScore(0);

        this.buttonStart = this.mlx.createButton(
            this,
            'Start',
            () => {
                this.startGame();
            },
            this.w - this.mlx.mlxPadding - 80,
            this.offScreenY + this.canvasSizeH + 5,
            80,
            24
        );
        this.buttonStart.border = true;

        this.then = Date.now();
        this.output = this.canvas;
        this.ready = true;
    }

    startGame() {
        this.xStart = 0; //starting x coordinate for snake
        this.yStart = 150; //starting y coordinate for snake
        this.gameRunning = true;
    }

    setScore(s) {
        this.score = s;
    }

    remove() {
        if (this.group) this.group.removeSprites();
        super.remove();
    }

    draw(p5) {
        super.draw(p5);
        if (this.gameRunning) {
            p5.push();
            let x = this.x + this.offScreenX;
            let y = this.y + this.offScreenY;
            p5.translate(x, y);
            p5.fill(0);
            p5.rect(0, 0, this.canvasSizeW, this.canvasSizeH);

            if (this.inElement) {
                this.paddleA.position.y = p5.constrain(
                    this.paddleA.position.y,
                    this.paddleA.height / 2,
                    this.height - this.paddleA.height / 2
                );
                this.paddleB.position.y = p5.constrain(
                    this.paddleB.position.y,
                    this.paddleA.height / 2,
                    this.height - this.paddleA.height / 2
                );
            } else {
                this.paddleA.position.y = p5.constrain(
                    p5.mouseY - y,
                    this.paddleA.height / 2,
                    this.height - this.paddleA.height / 2
                );
                this.paddleB.position.y = p5.constrain(
                    p5.mouseY - y,
                    this.paddleA.height / 2,
                    this.height - this.paddleA.height / 2
                );
            }

            this.ball.bounce(this.wallTop);
            this.ball.bounce(this.wallBottom);

            var swing;
            if (this.ball.bounce(this.paddleA)) {
                swing = (this.ball.position.y - this.paddleA.position.y) / 3;
                this.ball.setSpeed(this.MAX_SPEED, this.ball.getDirection() + swing);
            }

            if (this.ball.bounce(this.paddleB)) {
                swing = (this.ball.position.y - this.paddleB.position.y) / 3;
                this.ball.setSpeed(this.MAX_SPEED, this.ball.getDirection() - swing);
            }

            if (this.ball.position.x < 0) {
                this.ball.position.x = this.width / 2;
                this.ball.position.y = this.height / 2;
                this.ball.setSpeed(this.MAX_SPEED, 0);
            }

            if (this.ball.position.x > this.width) {
                this.ball.position.x = this.width / 2;
                this.ball.position.y = this.height / 2;
                this.ball.setSpeed(this.MAX_SPEED, 180);
            }

            if (this.group) this.group.draw();
            p5.pop();
        } else {
        }
    }

    doProcess() {
        this.results = this.inElement.output;
        //console.log(this.results);
        this.key = null;
        if (Array.isArray(this.results)) {
            if (this.results[0].label) {
                this.key = this.results[0].label;
            }
        } else {
            if (this.results.label) {
                this.key = this.results.label;
            }
        }

        if (this.key == 'A') {
            this.paddleA.position.y -= 15;
        } else if (this.key == 'E') {
            this.paddleA.position.y += 15;
        } else if (this.key == 'G') {
            this.paddleB.position.y -= 15;
        } else if (this.key == 'J') {
            this.paddleB.position.y += 15;
        }

        this.busy = false;
        this.outputIsReady = true;
        this.output = this.inElement.output;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }
}

// mlxBreakoutGame
class mlxBreakoutGame extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'BreakoutGame';
        this.title = 'Breakout Game';

        this.inType = 'results';
        this.outType = 'results';

        this.needMouse = true;
        this.score = 0;
        this.canvasSizeW = 400;
        this.canvasSizeH = 300;
        this.gameRunning = false;

        this.fps = 60;

        this.createElementMenu();

        this.width = this.canvasSizeW;
        this.height = this.canvasSizeH;
        this.MAX_SPEED = 5;
        this.paddle = this.p5.createSprite(this.width / 2, this.height - 25, 70, 10);
        this.paddle.immovable = true;

        this.wallTop = this.p5.createSprite(this.width / 2, 0, this.width, 1);
        this.wallTop.immovable = true;

        this.wallBottom = this.p5.createSprite(this.width / 2, this.height - 1, this.width, 1);
        this.wallBottom.immovable = true;

        this.wallLeft = this.p5.createSprite(0, this.height / 2, 1, this.height);
        this.wallLeft.immovable = true;

        this.wallRight = this.p5.createSprite(this.width, this.height / 2, 1, this.height);
        this.wallRight.immovable = true;

        var BRICK_W = 20;
        var BRICK_H = 10;
        var BRICK_MARGIN = 2;
        var ROWS = 9;
        var COLUMNS = 16;
        var offsetX = this.width / 2 - ((COLUMNS - 1) * (BRICK_MARGIN + BRICK_W)) / 2;
        var offsetY = 40;
        this.bricks = new this.p5.Group();
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLUMNS; c++) {
                var brick = this.p5.createSprite(
                    offsetX + c * (BRICK_W + BRICK_MARGIN),
                    offsetY + r * (BRICK_H + BRICK_MARGIN),
                    BRICK_W,
                    BRICK_H
                );
                brick.shapeColor = this.p5.color(255, 255, 255);
                brick.addToGroup(this.bricks);
                brick.immovable = true;
            }
        }

        this.ball = this.p5.createSprite(this.width / 2, this.height - 100, 10, 10);
        this.ball.maxSpeed = this.MAX_SPEED;
        this.paddle.shapeColor = this.ball.shapeColor = this.p5.color(255, 255, 255);
        this.wallTop.shapeColor = this.wallBottom.shapeColor = this.wallLeft.shapeColor = this.wallRight.shapeColor = this.p5.color(
            0,
            0,
            0,
            0
        );

        this.group = new this.p5.Group();
        this.paddle.addToGroup(this.group);
        this.wallTop.addToGroup(this.group);
        this.wallBottom.addToGroup(this.group);
        this.wallLeft.addToGroup(this.group);
        this.wallRight.addToGroup(this.group);
        this.ball.addToGroup(this.group);

        this.numSegments = 0;
        this.direction = 'right';

        this.xStart = 0;
        this.yStart = 150;
        this.diff = 2;

        this.offScreenX = this.mlx.mlxPadding;
        this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.p5.fill(0);
        this.p5.rect(
            this.x + this.offScreenX,
            this.y + this.offScreenY,
            this.canvasSizeW,
            this.canvasSizeH
        );
        this.p5.strokeWeight(this.diff);
        this.p5.stroke(255);

        this.w = this.canvasSizeW + this.mlx.mlxPadding * 2;
        this.h = this.canvasSizeH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 + 32;

        this.labelScore = this.mlx.createLabel(
            this,
            this.score,
            this.mlx.mlxPadding,
            this.offScreenY + this.canvasSizeH + 5,
            this.w - this.mlx.mlxPadding * 2,
            24
        );
        this.setScore(0);

        this.buttonStart = this.mlx.createButton(
            this,
            'Start',
            () => {
                this.startGame();
            },
            this.w - this.mlx.mlxPadding - 80,
            this.offScreenY + this.canvasSizeH + 5,
            80,
            24
        );
        this.buttonStart.border = true;

        this.then = Date.now();
        this.output = this.canvas;
        this.ready = true;
    }

    startGame() {
        console.log('startGame()');
        this.xStart = 0;
        this.yStart = 150;
        if (this.ball.velocity.x == 0 && this.ball.velocity.y == 0) {
            this.ball.setSpeed(this.MAX_SPEED, this.p5.random(90 - 10, 90 + 10));
            console.log('startGame + ball.setSpeed');
        }
        this.gameRunning = true;
        console.log('startGame() this.gameRunning = true');
    }

    setScore(s) {
        this.score = s;
    }

    remove() {
        if (this.bricks) this.bricks.removeSprites();
        if (this.group) this.group.removeSprites();
        super.remove();
    }

    draw(p5) {
        super.draw(p5);
        if (this.gameRunning) {
            p5.push();
            let x = this.x + this.offScreenX;
            let y = this.y + this.offScreenY;
            p5.translate(x, y);
            p5.fill(247, 134, 131);
            p5.rect(0, 0, this.canvasSizeW, this.canvasSizeH);

            if (this.inElement) {
                this.paddle.position.x = p5.constrain(
                    this.paddle.position.x,
                    this.paddle.width / 2,
                    this.width - this.paddle.width / 2
                );
            } else {
                this.paddle.position.x = p5.constrain(
                    p5.mouseX - x,
                    this.paddle.width / 2,
                    this.width - this.paddle.width / 2
                );
            }

            this.ball.bounce(this.wallTop);
            this.ball.bounce(this.wallBottom);
            this.ball.bounce(this.wallLeft);
            this.ball.bounce(this.wallRight);

            if (this.ball.bounce(this.paddle)) {
                var swing = (this.ball.position.x - this.paddle.position.x) / 3;
                this.ball.setSpeed(this.MAX_SPEED, this.ball.getDirection() + swing);
            }

            // console.log('draw before bounce');
            function brickHit(ball_, brick_) {
                brick_.remove();
            }

            this.ball.bounce(this.bricks, brickHit);
            // console.log('draw after bounce');

            if (this.bricks) this.bricks.draw();
            if (this.group) this.group.draw();

            p5.pop();
        } else {
            // console.log('draw but game is not Running');
        }
    }

    doProcess() {
        this.results = this.inElement.output;
        //console.log(this.results);
        this.key = null;
        if (Array.isArray(this.results)) {
            if (this.results[0].label) {
                this.key = this.results[0].label;
            }
        } else {
            if (this.results.label) {
                this.key = this.results.label;
            }
        }

        if (this.key == 'B') {
            this.paddle.position.x -= 15;
        } else if (this.key == 'D') {
            this.paddle.position.x += 15;
        }

        this.busy = false;
        this.outputIsReady = true;
        this.output = this.inElement.output;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }
}

module.exports = {
    mlxGamePad,
    mlxSnakeGame,
    mlxPongGame,
    mlxBreakoutGame,
};
