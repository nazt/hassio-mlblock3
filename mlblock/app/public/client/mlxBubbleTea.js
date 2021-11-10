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
} = require("./mlxElement");

class mlxBubbleTeaGame extends mlxElementLocakableOutput {
  constructor(mlx) {
    super(mlx);
    this.gameMode = "INTRO"; //INTRO,START,PLAY,END
    this.gameModeEnd = "TIMEUP"; //WIN,TIMEUP,DIE,PASS

    this.title = "We Love BubbleTea";
    this.category = "Output";
    this.type = "BubbleTeaGame";
    this.inType = "tensor";
    this.outType = "results";
    this.needMouse = false;
    this.cv_width = 854;
    this.cv_height = 560;
    this.fullscreen = false; //internal usage
    this.fullscreen_scale = 1; //internal usage
    this.w = this.cv_width / 2 + this.mlx.mlxPadding * 2; //size including frame
    this.h =
      this.cv_height / 2 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2; //size including frame
    this.fps = 15;
    this.createElementMenu();
    this.offScreenX = this.mlx.mlxPadding;
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.offScreen = this.mlx.createCanvas(
      this,
      this.offScreenX,
      this.offScreenY,
      this.cv_width / 2,
      this.cv_height / 2
    );
    this.canvas = this.offScreen.offScreen;
    this.canvas.imageMode(this.p5.CORNER);
    this.precanvas = this.p5.createGraphics(this.cv_width, this.cv_height);

    //internal setup
    this.preload();
    this.setup();

    //Output(required)
    this.output = this.canvas;
    this.ready = true;
  }
  preload() {
    this.img_waiting = this.p5.loadImage(
      "assets_game/mlxBubbleTea/waiting.png"
    );
    this.img_logo = this.p5.loadImage("assets_game/mlxBubbleTea/logo.png");
    this.img_b1 = this.p5.loadImage("assets_game/mlxBubbleTea/b_1.png");
    this.img_b2 = this.p5.loadImage("assets_game/mlxBubbleTea/b_2.png");
    this.img_b3 = this.p5.loadImage("assets_game/mlxBubbleTea/b_3.png");
    this.img_b4 = this.p5.loadImage("assets_game/mlxBubbleTea/b_4.png");
    this.img_b5 = this.p5.loadImage("assets_game/mlxBubbleTea/b_5.png");
    this.img_b6 = this.p5.loadImage("assets_game/mlxBubbleTea/b_6.png");
    this.img_direction = this.p5.loadImage(
      "assets_game/mlxBubbleTea/direction.png"
    );
    this.img_clock = this.p5.loadImage("assets_game/mlxBubbleTea/clock.png");
    this.img_heart = this.p5.loadImage("assets_game/mlxBubbleTea/heart.png");
    this.img_t1 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_1.png");
    this.img_t2 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_2.png");
    this.img_t3 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_3.png");
    this.img_t4 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_4.png");
    this.img_t5 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_5.png");
    this.img_t6 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_6.png");
    this.img_t7 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_7.png");
    this.img_t8 = this.p5.loadImage("assets_game/mlxBubbleTea/btea_8.png");

    this.img_w1 = this.p5.loadImage("assets_game/mlxBubbleTea/wall1.png");
    this.img_w2 = this.p5.loadImage("assets_game/mlxBubbleTea/wall2.png");
    this.img_w3 = this.p5.loadImage("assets_game/mlxBubbleTea/wall3.png");
    this.img_w4 = this.p5.loadImage("assets_game/mlxBubbleTea/wall4.png");

    this.img_sugar = this.p5.loadImage(
      "assets_game/mlxBubbleTea/sugarcube.png"
    );
    this.img_mouth_open = this.p5.loadImage(
      "assets_game/mlxBubbleTea/mouth_open.png"
    );
    this.img_mouth_close = this.p5.loadImage(
      "assets_game/mlxBubbleTea/mouth_close.png"
    );
    this.img_mouth_hold = this.p5.loadImage(
      "assets_game/mlxBubbleTea/mouth_hold.png"
    );

    this.font = this.p5.loadFont("assets_game/mlxBubbleTea/FFFFORWA.TTF");

    this.sound_okay = this.p5.loadSound("assets_game/mlxBubbleTea/okay.mp3");
    this.sound_yum = this.p5.loadSound("assets_game/mlxBubbleTea/yum.mp3");
    this.sound_hurt = this.p5.loadSound("assets_game/mlxBubbleTea/hurt.mp3");
    this.sound_beep = this.p5.loadSound("assets_game/mlxBubbleTea/beep.mp3");
    this.sound_sugar = this.p5.loadSound("assets_game/mlxBubbleTea/sugar.mp3");
    this.sound_timebeep = this.p5.loadSound(
      "assets_game/mlxBubbleTea/timebeep.mp3"
    );
    this.sound_applause = this.p5.loadSound(
      "assets_game/mlxBubbleTea/applause.mp3"
    );
    this.sound_burp = this.p5.loadSound("assets_game/mlxBubbleTea/burp.mp3");
    this.sound_jingle = this.p5.loadSound(
      "assets_game/mlxBubbleTea/jingle.mp3"
    );
    this.sound_powerup = this.p5.loadSound(
      "assets_game/mlxBubbleTea/powerup.mp3"
    );
  }

  setup() {
    //value
    this.teaimage = [
      this.img_t1,
      this.img_t2,
      this.img_t3,
      this.img_t4,
      this.img_t5,
      this.img_t6,
      this.img_t7,
      this.img_t8,
      this.img_sugar,
    ];
    this.mouth = new BubbleTeaGameMouth(this);
    this.lipTop = this.p5.createVector(0, 0);
    this.lipBottom = this.p5.createVector(0, 0);
    this.noseTip = this.p5.createVector(0, 0);
    this.isMouthClose = false;
    this.mouthRecover = 0;
    this.prevMouthCloseStatus = false;
    this.timeLimit = 0;

    this.alpha_1 = 0;
    this.precanvas.textFont(this.font);

    //setup start teaButton
    this.teas = [];
    this.teas[0] = new BubbleTeaGameTea(
      this,
      this.teaimage[this.p5.int(this.p5.random(0, 8))],
      111,
      this.cv_width / 2 + 457 / 2 - 42,
      this.cv_height / 2 + 308 / 2 - 42,
      null,
      null,
      0,
      0
    );
    //setup wall
    this.walls = [];
    this.spring = 0.05;
    this.gravity = 0;
    this.friction = -1; //-0.9;

    //copyright notice
    console.log(
      "Some Game Graphics usage under Premium Freepik License(Commercial License) from Freepik.com"
    );
  }

  //--------------------
  //Fullscreen
  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Full screen", (ui) => {
      this.hideMenu();
      this.enterFullScreen();
    });
    menu.addCommand("Focus", (ui) => {
      this.hideMenu();
      this.mlx.hideNavBar();
      window.dispatchEvent(new Event("resize"));
      this.mlx.focusedElement = this;
      this.lockCanvasToThisElement = true;
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }
  endFullScreen() {
    super.endFullScreen();
    this.canvas.resizeCanvas(this.cv_width, this.cv_width);
    this.fullscreen = false;
  }

  enterFullScreen() {
    super.enterFullScreen();
    this.fullscreen = true;
    this.fullscreen_scale = this.contentW / this.cv_width;
    var scale_h = (this.h - 110) / this.cv_height;
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h;
    this.canvas.resizeCanvas(
      this.cv_width * this.fullscreen_scale,
      this.cv_height * this.fullscreen_scale
    );
    //console.log("this.cv_width:"+this.cv_width+"||cv_height:"+this.cv_height+"||fullscreen_scale:"+this.fullscreen_scale+"||fullscreen_scale:"+this.fullscreen_scale)
  }

  draw(p5) {
    if (!this.lockCanvasToThisElement) super.draw(p5);
    if (
      this.inElement != null &&
      this.inElement.inElement != null &&
      this.inElement.inElement.videoCapture != null
    ) {
      if (!this.gameConnected) {
        //reset game
        this.gameMode = "INTRO";
        this.teas.splice(0, this.teas.length);
        this.teas[0] = new BubbleTeaGameTea(
          this,
          this.teaimage[this.p5.int(this.p5.random(0, 8))],
          111,
          this.cv_width / 2 + 457 / 2 - 42,
          this.cv_height / 2 + 308 / 2 - 42,
          null,
          null,
          0,
          0
        );
        this.gameConnected = true;
      }
      this.precanvas.push();
      if (this.inElement.inElement.flip) {
        this.precanvas.scale(-1, 1); //flip video
        this.precanvas.translate(0 - this.cv_width, 0);
      }
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.inElement.inElement.videoCapture,
        0,
        0,
        this.cv_width,
        this.cv_height
      );
      this.precanvas.pop();
      //----------------------
      //Game draw
      //update mouth position
      this.calculateMouthPos();
      //width,height
      if (this.gameMode == "PLAY") {
        this.precanvas.push();
        this.precanvas.imageMode(this.p5.CENTER);
        this.mouth.draw();
        this.drawTeas();
        this.drawWalls();
        this.drawGameUI();
        this.precanvas.pop();
      } else if (this.gameMode == "INTRO") {
        this.precanvas.push();
        this.precanvas.imageMode(this.p5.CENTER);
        this.precanvas.image(
          this.img_b1,
          this.cv_width / 2,
          this.cv_height / 2
        );
        this.precanvas.image(
          this.img_direction,
          this.cv_width / 2,
          this.cv_height / 2 + 154 + 53 + 5
        );
        //flash logo
        this.precanvas.push();
        this.alpha_1 += (p5.deltaTime / 50.0) % 50;
        this.precanvas.tint(
          255,
          p5.abs(p5.sin((p5.TWO_PI / 50.0) * this.alpha_1)) * 255
        );
        this.precanvas.image(
          this.img_logo,
          this.cv_width / 2,
          this.cv_height / 2
        );
        this.precanvas.pop();
        this.mouth.draw();
        this.drawTeas();
        this.precanvas.pop();
      } else if (this.gameMode == "START") {
        this.precanvas.push();
        this.precanvas.imageMode(p5.CENTER);
        this.precanvas.textSize(22);
        this.precanvas.image(
          this.img_b2,
          this.cv_width / 2,
          this.cv_height / 2,
          0
        );
        this.mouth.draw();
        this.drawTeas();
        this.precanvas.pop();
      } else if (this.gameMode == "END") {
        this.precanvas.push();
        this.precanvas.imageMode(this.p5.CENTER);
        this.precanvas.textSize(22);
        var img = this.img_b3;
        if (this.gameModeEnd == "TIMEUP") img = this.img_b6;
        else if (this.gameModeEnd == "DIE") img = this.img_b5;
        else if (this.gameModeEnd == "WIN") img = this.img_b4;
        else {
        }
        this.precanvas.image(img, this.cv_width / 2, this.cv_height / 2, 0);
        this.mouth.draw();
        this.drawTeas();
        this.precanvas.pop();
      }
      //----------------------
    } else {
      //no video input
      this.precanvas.push();
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.img_waiting,
        0,
        0,
        this.cv_width,
        this.cv_height
      );
      this.precanvas.pop();
      this.gameConnected = false;
    }

    //Fullscreen
    this.canvas.push();
    if (this.fullscreen) {
      //resize & draw
      this.canvas.scale(this.fullscreen_scale);
    } else {
      this.canvas.scale(0.5);
    }
    this.canvas.image(this.precanvas, 0, 0);
    this.canvas.pop();

    //LockableCanvas
    this.adjustThisElementToLockCanvas();
  }

  drawGameUI() {
    this.precanvas.push();
    //play beep on last 10 sec
    if (this.timeLimit < 0) {
      //times up
      this.gameMode = "END";
      this.gameModeEnd = "TIMEUP";
      this.sound_burp.play();
      this.walls.splice(0, this.walls.length);
      this.teas.splice(0, this.teas.length);
      this.teas[0] = new BubbleTeaGameTea(
        this,
        this.teaimage[this.p5.int(this.p5.random(0, 8))],
        110,
        this.cv_width / 2 + 457 / 2 - 42,
        this.cv_height / 2 + 308 / 2 - 42,
        null,
        null,
        0,
        0
      );
    }
    this.precanvas.imageMode(this.p5.CENTER);
    for (var i = 0; i < this.live; i++) {
      this.precanvas.image(this.img_heart, this.cv_width - 55 * i - 30, 5 + 25);
    }
    this.precanvas.strokeWeight(2);
    this.precanvas.textSize(22);
    this.precanvas.stroke(0);
    this.precanvas.textAlign(this.p5.RIGHT, this.p5.CENTER);
    this.precanvas.fill(255);
    this.precanvas.text(
      "Tea Left: " + this.teaCountdown,
      this.cv_width - 220,
      55,
      210,
      50
    );
    this.precanvas.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.precanvas.text("LEVEL " + this.level, 5, this.cv_height - 55, 210, 50);
    //count down to start
    if (this.timeCountdown > 0) {
      this.precanvas.push();
      //count down to start
      this.precanvas.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.precanvas.strokeWeight(5);
      this.precanvas.stroke(0);
      this.precanvas.fill(255, 255, 0);
      this.precanvas.textSize(70);
      var t = this.p5.int(this.timeCountdown / 1000);
      if (this.timeCountdown < 1000) {
        this.precanvas.fill(241, 148, 42);
        t = "Eat them ALL!!";
      }
      this.precanvas.text(t, 0, 0, this.cv_width, this.cv_height);
      this.precanvas.pop();
      this.timeCountdown -= this.p5.deltaTime;
      this.freezeTime -= this.p5.deltaTime;
      if (this.freezeTime < 0) {
        //play beep sound
        this.sound_beep.play();
        this.freezeTime = 1000;
      }
    } else {
      //game timer
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(this.img_clock, 5, 5, 52, 48);
      this.precanvas.strokeWeight(2);
      this.precanvas.stroke(0);
      if (this.timeLimit < 10000) {
        this.precanvas.fill(255, 0, 0);
        this.freezeTime -= this.p5.deltaTime;
        if (this.freezeTime < 0) {
          //play beep sound
          this.sound_timebeep.play();
          this.freezeTime = 1000;
        }
      } else {
        this.precanvas.fill(255, 255, 0);
      }
      this.precanvas.textSize(30);
      this.precanvas.textAlign(this.p5.LEFT, this.p5.CENTER);
      this.timeLimit -= this.p5.deltaTime;
      this.precanvas.text(
        this.p5.floor(this.timeLimit / 1000) + 1,
        5 + 52 + 5,
        5,
        100,
        48
      ); //time text
    }
    this.precanvas.pop();
  }

  drawWalls() {
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].collide();
      this.walls[i].draw();
    }
  }

  setupLevel1() {
    this.timeLimit = 90000;
    this.timeCountdown = 4000;
    this.teaCountdown = 10;
    this.sugarCountdown = 4;
    this.freezeTime = 1000; //time after user do game over action
    this.live = 3;
    this.level = 1;
    this.spring = 0.006;
    this.setupTeas();
  }

  setupLevel2() {
    this.timeLimit = 90000;
    this.timeCountdown = 4000;
    this.teaCountdown = 10;
    this.sugarCountdown = 6;
    this.freezeTime = 1000;
    this.live = 3;
    this.level = 2;
    this.spring = 0.009;
    this.setupTeas();
    this.walls.splice(0, this.walls.length);
    this.walls[0] = new BubbleTeaGameWall(
      this,
      147,
      113,
      122,
      110,
      this.img_w2
    );
    this.walls[1] = new BubbleTeaGameWall(
      this,
      615,
      324,
      122,
      110,
      this.img_w2
    );
  }

  setupLevel3() {
    this.timeLimit = 90000;
    this.timeCountdown = 4000;
    this.teaCountdown = 12;
    this.sugarCountdown = 6;
    this.freezeTime = 1000;
    this.live = 3;
    this.level = 3;
    this.setupTeas();
    this.spring = 0.01;
    this.walls.splice(0, this.walls.length);
    this.walls[0] = new BubbleTeaGameWall(this, 147, 85, 88, 88, this.img_w3);
    this.walls[1] = new BubbleTeaGameWall(this, 147, 367, 88, 88, this.img_w3);
    this.walls[2] = new BubbleTeaGameWall(this, 647, 85, 88, 88, this.img_w3);
    this.walls[3] = new BubbleTeaGameWall(this, 647, 367, 88, 88, this.img_w3);
    this.walls[4] = new BubbleTeaGameWall(this, 327, 246, 194, 40, this.img_w3);
  }

  setupLevel4() {
    this.timeLimit = 90000;
    this.timeCountdown = 4000;
    this.teaCountdown = 12;
    this.sugarCountdown = 7;
    this.freezeTime = 1000;
    this.live = 3;
    this.level = 4;
    this.setupTeas();
    this.spring = 0.02;
    this.walls.splice(0, this.walls.length);
    this.walls[0] = new BubbleTeaGameWall(this, 176, 140, 117, 75, this.img_w4);
    this.walls[1] = new BubbleTeaGameWall(
      this,
      135,
      352,
      110,
      127,
      this.img_w4
    );
    this.walls[2] = new BubbleTeaGameWall(
      this,
      479,
      169,
      211,
      254,
      this.img_w4
    );
  }

  setupLevel5() {
    this.timeLimit = 90000;
    this.timeCountdown = 4000;
    this.teaCountdown = 14;
    this.sugarCountdown = 7;
    this.freezeTime = 1500; //time after user do game over action
    this.live = 3;
    this.level = 5;
    this.setupTeas();
    this.spring = 0.02;
    this.walls.splice(0, this.walls.length);
    this.walls[0] = new BubbleTeaGameWall(this, 140, 108, 78, 78, this.img_w1);
    this.walls[1] = new BubbleTeaGameWall(this, 140, 341, 78, 78, this.img_w1);
    this.walls[2] = new BubbleTeaGameWall(this, 402, 457, 78, 78, this.img_w1);
    this.walls[3] = new BubbleTeaGameWall(this, 666, 346, 78, 78, this.img_w1);
    this.walls[4] = new BubbleTeaGameWall(this, 666, 108, 78, 78, this.img_w1);
    this.walls[5] = new BubbleTeaGameWall(this, 402, 24, 78, 78, this.img_w1);
    this.walls[6] = new BubbleTeaGameWall(this, 338, 262, 200, 35, this.img_w1);
  }

  drawTeas() {
    for (var i = this.teas.length - 1; i >= 0; i--) {
      if (this.teas[i].markForDelete) {
        //remove from array
        this.teas.splice(i, 1);
      } else {
        //draw
        this.teas[i].collide();
        this.teas[i].move();
        this.teas[i].draw();
      }
    }
  }

  calculateMouthPos() {
    //find Center of mouth
    //var mouthCenter = this.p5.Vector.add(this.lipTop, this.p5.Vector.sub(this.lipBottom, this.lipTop))
    //seems to be problem with p5.Vector namespace, add/sub manually
    var mouthCenter = this.p5.createVector(
      this.lipTop.x + (this.lipBottom.x - this.lipTop.x),
      this.lipTop.y + (this.lipBottom.y - this.lipTop.y)
    );
    var xpos = mouthCenter.x;
    if (this.inElement.inElement.flip)
      xpos = this.inElement.inElement.videoWidth - mouthCenter.x;
    this.mouth.position.x =
      (xpos / this.inElement.inElement.videoWidth) * this.cv_width;
    this.mouth.position.y =
      (mouthCenter.y / this.inElement.inElement.videoHeight) * this.cv_height;
    //console.log(this.mouth.position.x + "|" + this.mouth.position.y)
    //calculate mouth pos
    var p1 = this.p5.abs(
      this.p5.dist(this.noseTip.x, this.noseTip.y, this.lipTop.x, this.lipTop.y)
    );
    var p2 = this.p5.abs(
      this.p5.dist(
        this.lipBottom.x,
        this.lipBottom.y,
        this.lipTop.x,
        this.lipTop.y
      )
    );
    this.isMouthClose = p2 < p1 / 2;
    if (this.mouthRecover > 0) {
      this.mouthRecover -= this.p5.deltaTime;
    } else if (this.isMouthClose && !this.prevMouthCloseStatus) {
      //just close mouse
      var combo = this.checkEat(true);
      if (combo > 1) {
        this.mouth.showCombo(combo);
        this.sound_powerup.play();
      }
    } else {
      this.checkEat(false);
    }
    this.prevMouthCloseStatus = this.isMouthClose;
  }

  checkEat(doAction) {
    var eatCount = 0;
    //check eat wall
    if (doAction) {
      for (var i = 0; i < this.walls.length; i++) {
        if (this.walls[i].collideMouth()) {
          this.sound_hurt.play();
          this.mouthRecover = 3000; //eat wall, hold for 3 sec
          return 0;
        }
      }
    }
    //check eat object
    for (var i = 0; i < this.teas.length; i++) {
      if (this.teas[i].intersect(this.mouth)) {
        if (doAction) {
          //do action
          if (this.teas[i].action == 1 && this.timeCountdown <= 0) {
            //gameplay 'tea' object
            //console.log("eat");
            this.teas[i].eaten = true;
            this.teas[i].vx = 0;
            this.teas[i].vy = 0;
            this.sound_yum.play();
            this.teaCountdown--;
            if (this.teaCountdown <= 0) {
              //go to next level
              var nlevel = 113;
              if (this.level == 2) nlevel = 114;
              else if (this.level == 3) nlevel = 115;
              else if (this.level == 4) nlevel = 116;

              this.gameMode = "END";
              this.gameModeEnd = "PASS";
              this.sound_applause.play();
              if (this.level == 5) {
                this.gameModeEnd = "WIN";
                nlevel = 110;
                this.sound_applause.play();
                this.sound_jingle.play();
              }
              this.walls.splice(0, this.walls.length);
              this.teas.splice(0, this.teas.length);
              this.teas[0] = new BubbleTeaGameTea(
                this,
                this.teaimage[this.p5.int(this.p5.random(0, 8))],
                nlevel,
                this.cv_width / 2 + 457 / 2 - 42,
                this.cv_height / 2 + 308 / 2 - 42,
                null,
                null,
                0,
                0
              );
            }
            eatCount++;
          } else if (this.teas[i].action == 2 && this.timeCountdown <= 0) {
            //gameplay 'sugar' object
            //console.log("eat");
            this.teas[i].eaten = true;
            this.sound_sugar.play();
            this.live--;
            if (this.live <= 0) {
              this.gameMode = "END";
              this.gameModeEnd = "DIE";
              this.sound_burp.play();
              this.walls.splice(0, this.walls.length);
              this.teas.splice(0, this.teas.length);
              this.teas[0] = new BubbleTeaGameTea(
                this,
                this.teaimage[this.p5.int(this.p5.random(0, 8))],
                110,
                this.cv_width / 2 + 457 / 2 - 42,
                this.cv_height / 2 + 308 / 2 - 42,
                null,
                null,
                0,
                0
              );
            }
          } else if (this.teas[i].action == 110) {
            //go to START
            this.gameMode = "INTRO";
            this.teas[0] = new BubbleTeaGameTea(
              this,
              this.teaimage[this.p5.int(this.p5.random(0, 8))],
              111,
              this.cv_width / 2 + 457 / 2 - 42,
              this.cv_height / 2 + 308 / 2 - 42,
              null,
              null,
              0,
              0
            );
            this.sound_okay.play();
          } else if (this.teas[i].action == 111) {
            //go to START
            this.gameMode = "START";
            this.teas[0] = new BubbleTeaGameTea(
              this,
              this.teaimage[this.p5.int(this.p5.random(0, 8))],
              112,
              this.cv_width / 2 + 457 / 2 - 42,
              this.cv_height / 2 + 308 / 2 - 42,
              null,
              null,
              0,
              0
            );
            this.sound_okay.play();
          } else if (this.teas[i].action == 112) {
            //go to START level 1
            this.gameMode = "PLAY";
            this.sound_okay.play();
            this.setupLevel1();
          } else if (this.teas[i].action == 113) {
            //go to START level 2
            this.gameMode = "PLAY";
            this.sound_okay.play();
            this.setupLevel2();
          } else if (this.teas[i].action == 114) {
            //go to START level 3
            this.gameMode = "PLAY";
            this.sound_okay.play();
            this.setupLevel3();
          } else if (this.teas[i].action == 115) {
            //go to START level 2
            this.gameMode = "PLAY";
            this.sound_okay.play();
            this.setupLevel4();
          } else if (this.teas[i].action == 116) {
            //go to START level 2
            this.gameMode = "PLAY";
            this.sound_okay.play();
            this.setupLevel5();
          }
        } else {
          //hilight
          this.teas[i].hilight = true;
        }
      } else {
        //not hilight
        this.teas[i].hilight = false;
      }
    }
    return eatCount;
  }

  setupTeas() {
    this.teas.splice(0, this.teas.length);
    //create teas
    for (let j = 0; j < this.teaCountdown + this.sugarCountdown; j++) {
      var imgIndex = this.p5.int(this.p5.random(0, 8));
      var actionIndex = 1;
      if (j >= this.teaCountdown) {
        //set sugar
        imgIndex = 8;
        actionIndex = 2;
      }
      var vx = 1.8;
      var vy = 1.8;
      if (this.level == 1) {
        vx = 0.8;
        vy = 0.8;
      } else if (this.level == 2) {
        vx = 1;
        vy = 1;
      } else if (this.level == 3) {
        vx = 1.2;
        vy = 1.2;
      } else if (this.level == 4) {
        vx = 1.4;
        vy = 1.4;
      }

      this.teas[j] = new BubbleTeaGameTea(
        this,
        this.teaimage[imgIndex],
        actionIndex,
        this.p5.random(this.cv_width),
        this.p5.random(this.cv_height),
        this.p5.random(30, 70),
        this.teas,
        this.p5.random(0, vx),
        this.p5.random(0, vy)
      );
      //check if initial pos hit wall
      //if yes then reloacate and try checking again
      while (this.checkTeaInitialPos(this.teas[j])) {
        this.teas[j].x = this.p5.random(this.cv_width);
        this.teas[j].y = this.p5.random(this.cv_height);
      }
    }
  }

  checkTeaInitialPos(tea) {
    for (var i = 0; i < this.walls.length; i++) {
      if (this.walls[i].checkTeaInitialPos(tea)) return true;
    }
    return false;
  }

  ///-----------------
  //FACE API CALLBACK
  doProcess() {
    var detections = this.inElement.output;
    if (
      detections != null &&
      detections.length > 0 &&
      detections[0].landmarks
    ) {
      if (detections.length > 0) {
        this.lipTop = this.p5.createVector(
          detections[0].landmarks.positions[62].x,
          detections[0].landmarks.positions[62].y
        );
        this.lipBottom = this.p5.createVector(
          detections[0].landmarks.positions[66].x,
          detections[0].landmarks.positions[66].y
        );
        this.noseTip = this.p5.createVector(
          detections[0].landmarks.positions[33].x,
          detections[0].landmarks.positions[33].y
        );
      }
    }
    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }
}

class BubbleTeaGameWall {
  constructor(mlxParent, _x, _y, _width, _height, _img) {
    this.parent = mlxParent;
    this.x = _x;
    this.y = _y;
    this.w = _width;
    this.h = _height;
    this.g = this.parent.p5.createGraphics(_width, _height);
    this.g.imageMode(this.parent.p5.CORNER);
    for (var i = 0; i < this.parent.p5.ceil(_width / 50); i++) {
      for (var j = 0; j < this.parent.p5.ceil(_height / 50); j++) {
        this.g.image(_img, i * 50, j * 50, 50, 50);
      }
    }
  }
  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(this.g, this.x, this.y, this.w, this.h);
    this.parent.precanvas.pop();
  }

  collideMouth() {
    //check intersec with block(circle to rect check)
    var DeltaX =
      this.parent.mouth.position.x -
      this.parent.p5.max(
        this.x,
        this.parent.p5.min(this.parent.mouth.position.x, this.x + this.w)
      );
    var DeltaY =
      this.parent.mouth.position.y -
      this.parent.p5.max(
        this.y,
        this.parent.p5.min(this.parent.mouth.position.y, this.y + this.h)
      );
    return (
      DeltaX * DeltaX + DeltaY * DeltaY <
      this.parent.mouth.radius * this.parent.mouth.radius
    );
  }

  collide() {
    //check wall collide with tea object
    for (let i = 0; i < this.parent.teas.length; i++) {
      if (!this.parent.teas[i].eaten && !this.parent.teas[i].markForDelete) {
        //check if intersec with block
        var max_x = this.parent.p5.max(
          this.x,
          this.parent.p5.min(this.parent.teas[i].x, this.x + this.w)
        );
        var max_y = this.parent.p5.max(
          this.y,
          this.parent.p5.min(this.parent.teas[i].y, this.y + this.h)
        );
        var DeltaX = this.parent.teas[i].x - max_x;
        var DeltaY = this.parent.teas[i].y - max_y;
        if (
          DeltaX * DeltaX + DeltaY * DeltaY <
          this.parent.teas[i].radius * this.parent.teas[i].radius
        ) {
          //hit
          //check size
          if (this.x == max_x) {
            //left side
            this.parent.teas[i].x = this.x - this.parent.teas[i].radius;
            this.parent.teas[i].vx *= this.parent.friction;
          } else if (this.x + this.w == max_x) {
            //right side
            this.parent.teas[i].x =
              this.x + this.w + this.parent.teas[i].radius;
            this.parent.teas[i].vx *= this.parent.friction;
          }

          if (this.y == max_y) {
            //top side
            this.parent.teas[i].y = this.y - this.parent.teas[i].radius;
            this.parent.teas[i].vy *= this.parent.friction;
          } else if (this.y + this.h == max_y) {
            //bottom side
            this.parent.teas[i].y =
              this.y + this.h + this.parent.teas[i].radius;
            this.parent.teas[i].vy *= this.parent.friction;
          }
        }
      }
    }
  }

  checkTeaInitialPos(tea) {
    //check intersec with block(circle to rect check)
    var DeltaX =
      tea.x -
      this.parent.p5.max(this.x, this.parent.p5.min(tea.x, this.x + this.w));
    var DeltaY =
      tea.y -
      this.parent.p5.max(this.y, this.parent.p5.min(tea.y, this.y + this.h));
    return DeltaX * DeltaX + DeltaY * DeltaY < tea.radius * tea.radius;
  }

  intersect(teaObj) {
    var cx = this.parent.p5.abs(teaObj.x - this.x - this.w / 2);
    var xDist = this.w / 2 + teaObj.radius;
    if (cx > xDist) return false;
    var cy = this.parent.p5.abs(teaObj.y - this.y - this.h / 2);
    var yDist = this.h / 2 + teaObj.radius;
    if (cy > yDist) return false;
    if (cx <= this.w / 2 || cy <= this.h / 2) return true;
    var xCornerDist = cx - this.w / 2;
    var yCornerDist = cy - this.h / 2;
    var xCornerDistSq = xCornerDist * xCornerDist;
    var yCornerDistSq = yCornerDist * yCornerDist;
    var maxCornerDistSq = teaObj.radius * teaObj.radius;
    return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
  }
}

class BubbleTeaGameTea {
  constructor(mlxParent, timage, action, xin, yin, idin, oin, vx, vy) {
    this.parent = mlxParent;
    this.img = timage;
    this.eaten = false;
    this.scaleTime = 500;
    this.markForDelete = false;
    this.action = action;
    if (action == 2) {
      //setup sugar
      this.size = this.parent.p5.createVector(60, 60);
      this.diameter = 60;
      this.radius = 30;
    } else {
      //tea
      this.size = this.parent.p5.createVector(60, 68);
      this.diameter = 60;
      this.radius = 30;
    }
    this.hilight = false;
    this.x = xin;
    this.y = yin;
    this.vx = vx;
    this.vy = vy;
    this.id = idin;
    this.others = oin;
  }

  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    this.parent.precanvas.translate(this.x, this.y);
    if (this.eaten) {
      //scale to 0
      this.scaleTime -= this.parent.p5.deltaTime;
      this.parent.precanvas.scale(this.scaleTime / 500);
      if (this.scaleTime < 0) this.markForDelete = true; //mark for delete
      this.parent.precanvas.strokeWeight(0);
    } else {
      if (this.hilight) {
        this.parent.precanvas.scale(1.15);
        this.parent.precanvas.strokeWeight(4);
        this.parent.precanvas.stroke(255, 252, 0);
      } else {
        this.parent.precanvas.strokeWeight(0);
      }
    }
    this.parent.precanvas.image(this.img, 0, 0);
    this.parent.precanvas.pop();
    this.px = this.x;
    this.py = this.y;
  }

  restorePos() {
    this.x = this.px;
    this.y = this.py;
  }

  intersect(mouthObj) {
    if (this.eaten) return false;
    let dx = mouthObj.position.x - this.x;
    let dy = mouthObj.position.y - this.y;
    let distance = this.parent.p5.sqrt(dx * dx + dy * dy);
    let minDist = mouthObj.radius + this.radius;
    if (distance < minDist) {
      return true;
    }
    return false;
  }

  move() {
    var width = this.parent.cv_width;
    var height = this.parent.cv_height;
    this.vy += this.parent.gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx *= this.parent.friction;
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= this.parent.friction;
    }
    if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= this.parent.friction;
    } else if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= this.parent.friction;
    }
  }

  collide() {
    if (this.others == null) return;
    for (let i = 0; i < this.parent.teas.length; i++) {
      if (
        !this.others[i].eaten &&
        !this.others[i].markForDelete &&
        this.parent.teas[i] != this
      ) {
        let dx = this.others[i].x - this.x;
        let dy = this.others[i].y - this.y;
        let distance = this.parent.p5.sqrt(dx * dx + dy * dy);
        let minDist = this.others[i].radius + this.radius;
        if (distance < minDist) {
          let angle = this.parent.p5.atan2(dy, dx);
          let targetX = this.x + this.parent.p5.cos(angle) * minDist;
          let targetY = this.y + this.parent.p5.sin(angle) * minDist;
          let ax = (targetX - this.others[i].x) * this.parent.spring;
          let ay = (targetY - this.others[i].y) * this.parent.spring;
          this.vx -= ax;
          this.vy -= ay;
          this.others[i].vx += ax;
          this.others[i].vy += ay;
        }
      }
    }
  }
}

class BubbleTeaGameMouth {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.radius = 45;
    this.diameter = this.radius * 2;
    this.position = this.parent.p5.createVector(0, 0);
    this.comboCountdown = 0;
    this.comboText1 = "";
    this.comboText2 = "";
  }

  showCombo(combo) {
    this.comboCountdown = 1500;
    var timeAdded = (combo - 1) * 3;
    this.comboText1 = combo + " Pieces";
    this.comboText2 = "Time +" + timeAdded;
    this.parent.timeLimit += timeAdded;
  }

  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.strokeWeight(0);
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    //draw mouth
    if (this.comboCountdown > 0) {
      this.comboCountdown -= this.parent.p5.deltaTime;
      this.parent.precanvas.fill(255, 255, 0);
      this.parent.precanvas.stroke(0);
      this.parent.precanvas.strokeWeight(2);
      this.parent.precanvas.textSize(12);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.parent.precanvas.text(
        this.comboText1,
        this.position.x - 60,
        this.position.y - this.radius - 45,
        120,
        25
      );
      this.parent.precanvas.text(
        this.comboText2,
        this.position.x - 60,
        this.position.y - this.radius - 20,
        120,
        25
      );
      this.parent.precanvas.image(
        this.parent.img_mouth_hold,
        this.position.x,
        this.position.y
      );
    }
    if (this.parent.mouthRecover > 0) {
      this.parent.precanvas.fill(255, 0, 0);
      this.parent.precanvas.stroke(0);
      this.parent.precanvas.strokeWeight(2);
      this.parent.precanvas.textSize(12);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.parent.precanvas.text(
        "HIT WALL!",
        this.position.x - 60,
        this.position.y - this.radius - 45,
        120,
        25
      );
      this.parent.precanvas.text(
        "Recover in " +
          (this.parent.p5.floor(this.parent.mouthRecover / 1000) + 1),
        this.position.x - 60,
        this.position.y - this.radius - 20,
        120,
        25
      );
      this.parent.precanvas.image(
        this.parent.img_mouth_hold,
        this.position.x,
        this.position.y
      );
    } else if (this.parent.isMouthClose) {
      //draw radius
      this.parent.precanvas.fill(255, 0, 0, 60);
      this.parent.precanvas.circle(
        this.position.x,
        this.position.y,
        this.diameter
      );
      //mouth close
      this.parent.precanvas.image(
        this.parent.img_mouth_close,
        this.position.x,
        this.position.y
      );
    } else {
      //draw radius
      this.parent.precanvas.fill(0, 0, 255, 60);
      this.parent.precanvas.circle(
        this.position.x,
        this.position.y,
        this.diameter
      );
      //mouth open
      this.parent.precanvas.image(
        this.parent.img_mouth_open,
        this.position.x,
        this.position.y
      );
    }
    this.parent.precanvas.pop();
  }
}

module.exports = {
  mlxBubbleTeaGame,
};
