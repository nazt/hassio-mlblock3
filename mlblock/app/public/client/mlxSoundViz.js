const { mlxElementOutput } = require('./mlxElement');
// Audio Output
class mlxElementSoundViz extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Output';
        this.type = 'FFT';
        this.title = 'Sound Viz';

        this.inType = 'audio';
        this.outType = 'image';

        this.counter = 0;
        this.startFrame = 0;
        this.needMouse = true;

        this.w = 200 + this.mlx.mlxPadding * 2;
        this.levelLen = 120;
        this.h = 200 + 200 * 0 + 500;
        // this.prevLevels = new Array(this.levelLen);
        // this.prevLevels = new Array(this.w - this.mlx.mlxPadding * 2);
        // this.prevLevels = new Array(this.w - this.mlx.mlxPadding * 2);
        this.contentX = this.mlx.mlxPadding;
        9;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.text = '';
        this.createElementMenu();
        this.label = this.mlx.createLabel(
            this,
            'Loading...',
            18,
            this.mlx.mlxCaptionHeight + 5,
            this.w - 20,
            24
        );
        this.fft = new p5.FFT(0.8, 512);
        window.fft = this.fft;

        this.canvasSize = 200;

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
        window.mycanvas = this.canvas;

        this.canvas2 = this.mlx.createCanvas(
            this,
            this.offScreenX,
            this.offScreenY + 200 * 0 + 10,
            this.canvasSize,
            this.canvasSize
        );
        this.canvas2.hidden = true;

        this.canvas3 = this.mlx.createCanvas(
            this,
            this.offScreenX,
            this.offScreenY + 200 + 200 + 200 * 0 + 10 + 10,
            this.canvasSize,
            this.canvasSize
        );

        this.canvas.strokeWeight(10);
        this.canvas.stroke(0);
        this.canvas.frameRate(60);

        this.startFunc = () => {
            console.log('START!');
            console.log(new Date());
            this.loopSound = true;
            this.prevLevels = new Array(this.levelLen);
            this.startFrame = this.p5.frameCount;
            this.startFlag = true;
            this.frameElapse = 0;
        };

        this.startButton = this.mlx.createButton(
            this,
            'Start',
            () => {
                this.startFunc();
            },
            this.w - 60 - this.mlx.mlxPadding,
            this.h - 28,
            60,
            22
        );

        this.sendButton = this.mlx.createButton(
            this,
            'Loop',
            () => {
                // this.startFunc();
                this.loopSound = true;
            },
            this.w - 60 - this.mlx.mlxPadding - 60,
            this.h - 28,
            60,
            22
        );

        this.sendButton.hidden = true;
        this.startButton.hidden = true;

        this.startFlag = false;
        this.startButton.border = true;

        this.label.setText('FFT ready.');
        this.ready = true;
        this.busy = false;
        this.outputIsReady = false;
        this.startFunc();
        // this.canvas.hidden = true;
    }

    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    doProcess() {
        if (this.inElement && this.inElement.outType == 'audio') {
            this.amplitude = this.inElement.output;
            // console.log(this.inElement.output);
            console.log('do process');
            this.busy = true;
            // this.fft.setInput(this.inElement.output);
            // this.output = this.canvas;
            // this.outputIsReady = true;
            // this.outputIsReady = true;
            // if (this.p5.frameCount % 60 == 0) {
            //     this.outputIsReady = true;
            // }
        } else {
            // this.outputIsReady = false;
        }

        this.busy = false;
        if (this.inElement) this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }

    update() {
        super.update();
    }

    draw(p5) {
        super.draw(p5);

        if (this.inElement && this.inElement.outType == 'audio' && this.ready) {
            let height = 250;
            let xx = this.x + this.contentX;
            let yy = this.y + this.contentY;
            this.frameElapse = this.p5.frameCount - this.startFrame;
            if (this.amplitude) {
                this.prevLevels.push(this.amplitude.getLevel());
                this.counter++;
            }
            const that = this;

            !(function(p5, prevLevels) {
                p5.beginShape();
                p5.noFill();
                p5.stroke(20);
                for (let i = 0; i < prevLevels.length; i++) {
                    var vx = p5.map(
                        xx + i,
                        xx,
                        xx + prevLevels.length,
                        xx + that.w - that.mlx.mlxPadding * 2,
                        xx
                    );
                    var vy = 200 / 1.5 + yy + p5.map(prevLevels[i], 0.0, 1.0, height, 0);
                    p5.vertex(vx, vy);
                }
                p5.endShape();
            })(p5, this.prevLevels);

            !(function drawCanvas2(ctx, prevLevels) {
                if (!that.startFlag) return;
                console.log('internal', that.frameElapse);
                let d = new Array(prevLevels.length);
                d[that.frameElapse] = 100;
                // d[that.frameElapse / 2] = 50;
                ctx.noStroke();
                ctx.rectMode(ctx.CENTER);
                ctx.background(230);
                that.canvas2.offScreen.noStroke();
                that.canvas2.offScreen.rectMode(that.canvas2.offScreen.CENTER);
                that.canvas2.offScreen.background(230);
                let spacing = 10;
                let w = ctx.width / (prevLevels.length * spacing);
                let minHeight = 0;
                for (let i = 0; i < prevLevels.length; i++) {
                    let x = ctx.map(i, prevLevels.length, 0, 0, ctx.width);
                    let xReversed = ctx.map(i, prevLevels.length, 0, ctx.width, 0);
                    let h = ctx.map(prevLevels[i], 0, 1, minHeight, ctx.height);

                    ctx.fill(255, 0, 0);
                    ctx.rect(xReversed, ctx.height / 2, w, d[i]);
                    ctx.fill(0);
                    ctx.rect(x, ctx.height / 2, w, h);

                    // draw on blank canvas
                    that.canvas2.offScreen.fill(255, 0, 0);
                    that.canvas2.offScreen.fill(0);
                    that.canvas2.offScreen.rect(x, ctx.height / 2, w, h);
                }
            })(this.canvas, this.prevLevels);
            //
            this.prevLevels.splice(0, 1);
            if (this.startFlag) {
                if (that.frameElapse > 0 && that.frameElapse % this.levelLen == 0) {
                    if (this.loopSound) {
                        this.startFunc();
                        this.startFlag = true;
                    } else {
                        this.startFlag = false;
                    }
                    this.endFrame = that.p5.frameCount;
                    this.frameElapse = 0;
                    this.startFrame = that.p5.frameCount;
                    console.log(new Date());
                    console.log(that.frameElapse);
                    console.log('FRAME COUNT!');
                    that.canvas3.offScreen.reset();
                    that.canvas3.offScreen.rectMode(this.p5.CENTER);
                    this.canvas3.offScreen.image(
                        this.canvas2.offScreen,
                        0,
                        0,
                        this.canvas.width,
                        this.canvas.height
                    );
                    this.outputIsReady = true;
                    this.output = this.canvas3.offScreen;
                }
            }

            // if (true) {
            //     if (this.endFrame >= 0) {
            //         if (this.p5.frameCount - this.endFrame >= 10) {
            //             this.endFrame = 0;
            //             this.startFunc();
            //         }
            //     }
            // }
        }
    }
}

module.exports = {
    mlxElementSoundViz,
};
