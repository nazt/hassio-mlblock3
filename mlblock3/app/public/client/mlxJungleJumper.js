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

class mlxJungleJumper extends mlxElementOutput {
  constructor(mlx) {
    //mlx element
    super(mlx);
    this.title = "JungleJumper";
    this.category = "Output";
    this.type = "JungleJumperGame";
    this.inType = "results";
    this.outType = "results";
    this.needMouse = false;
    this.score = 0;
    this.canvasSize = 400;
    this.canvas_w = 400; //internal usage
    this.canvas_h = 250; //internal usage
    this.fullscreen = false; //internal usage
    this.fullscreen_scale = 1; //internal usage
    this.w = 400 + this.mlx.mlxPadding * 2; //size including frame
    this.h = 250 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2; //size including frame
    this.fps = 25;
    this.createElementMenu();
    this.offScreenX = this.mlx.mlxPadding;
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.offScreen = this.mlx.createCanvas(
      this,
      this.offScreenX,
      this.offScreenY,
      this.canvas_w,
      this.canvas_h
    );
    this.canvas = this.offScreen.offScreen;
    this.precanvas = this.p5.createGraphics(this.canvas_w, this.canvas_h);

    //Game element
    //this.matchRate = 0.90;

    //Global Value
    this.MAIN_SPEED = 0.35; //default is 0.4; adopt for mini
    this.GAMEPHASE = "PREGAME"; //'PREGAME','PLAYING','OVER'
    this.TIME_SLIDE = 800; //slide action is hold for 0.8 sec.(800ms)
    this.ui;
    this.font;
    this.img_logo;
    this.obstacleGenerator;
    //Character
    this.character;
    this.character_w = 25;
    this.character_h = 40;
    this.character_w_slide = 40;
    this.character_h_slide = 25;
    this.img_run;
    this.image_jump;
    this.image_landing;
    this.image_particle;
    //TileFloor
    this.TILE_TOTAL;
    this.TILE_LOOP_NO = [];
    this.floorTile;
    this.img_tile_floor;
    this.img_floor_start;
    this.img_floor_end;
    this.img_slide;
    this.floor_w = 26;
    this.floor_h = 50;
    //Parallax BG
    this.img_p1;
    this.img_p2;
    this.img_p3;
    this.parallaxBG1;
    this.parallaxBG2;
    this.parallaxBG3;
    //Sound
    this.sound_slide;
    this.sound_fall;
    this.sound_jump;
    this.sound_hit;
    this.sound_readygo;
    //Pit data
    this.pits = [];
    this.pitCount = 0;
    //Spike data
    this.spikes = [];
    this.spikeCount;
    this.img_spike;
    this.spike_w = 40;
    this.spike_h = 178;
    //Food
    this.food = [];
    this.foodCount = 0;
    this.img_food;
    this.foodScore = 0;

    this.preload();
    this.setup();

    console.log(
      "Game Art (Free Commercial Licens) from https://jesse-m.itch.io/jungle-pack/"
    );

    //Output(required)
    this.output = this.canvas;
    this.ready = true;
  }

  //--------------------
  //Fullscreen
  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Full screen", (ui) => {
      this.hideMenu();
      this.enterFullScreen();
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }
  endFullScreen() {
    super.endFullScreen();
    this.canvas.resizeCanvas(this.canvas_w, this.canvas_h);
    this.fullscreen = false;
  }

  enterFullScreen() {
    super.enterFullScreen();
    this.fullscreen = true;
    this.fullscreen_scale = this.contentW / this.canvas_w;
    //console.log("scaleW = "+this.fullscreen_scale);
    var scale_h = (this.h - 110) / this.canvas_h;
    //console.log("scaleH = "+scale_h);
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h;
    this.canvas.resizeCanvas(
      this.canvas_w * this.fullscreen_scale,
      this.canvas_h * this.fullscreen_scale
    );
  }

  //--------------------
  //Game Content
  preload() {
    //Load Image
    this.img_logo = this.p5.loadImage("assets_game/mlxJungleJumper/logo.png");
    this.img_run_1 = this.p5.loadImage("assets_game/mlxJungleJumper/run_1.png");
    this.img_run_2 = this.p5.loadImage("assets_game/mlxJungleJumper/run_2.png");
    this.img_run_3 = this.p5.loadImage("assets_game/mlxJungleJumper/run_3.png");
    this.img_run_4 = this.p5.loadImage("assets_game/mlxJungleJumper/run_4.png");
    this.img_run_5 = this.p5.loadImage("assets_game/mlxJungleJumper/run_5.png");
    this.img_run_6 = this.p5.loadImage("assets_game/mlxJungleJumper/run_6.png");
    this.img_run_7 = this.p5.loadImage("assets_game/mlxJungleJumper/run_7.png");
    this.img_run_8 = this.p5.loadImage("assets_game/mlxJungleJumper/run_8.png");
    this.image_jump = this.p5.loadImage("assets_game/mlxJungleJumper/jump.png");
    this.image_landing = this.p5.loadImage(
      "assets_game/mlxJungleJumper/landing.png"
    );
    this.img_slide = this.p5.loadImage("assets_game/mlxJungleJumper/slide.png");
    this.image_particle = this.p5.loadImage(
      "assets_game/mlxJungleJumper/particle.png"
    );
    this.img_tile_floor = this.p5.loadImage(
      "assets_game/mlxJungleJumper/tilefloor.png"
    );
    this.img_floor_start = this.p5.loadImage(
      "assets_game/mlxJungleJumper/tilefloor_start.png"
    );
    this.img_floor_end = this.p5.loadImage(
      "assets_game/mlxJungleJumper/tilefloor_end.png"
    );
    this.img_spike = this.p5.loadImage("assets_game/mlxJungleJumper/spike.png");
    this.img_p1 = this.p5.loadImage("assets_game/mlxJungleJumper/plx-5.png");
    this.img_p2 = this.p5.loadImage("assets_game/mlxJungleJumper/plx-4.png");
    this.img_p3 = this.p5.loadImage("assets_game/mlxJungleJumper/plx-2.png");
    this.img_food = this.p5.loadImage(
      "assets_game/mlxJungleJumper/sandwich.png"
    );
    this.sound_slide = this.p5.loadSound(
      "assets_game/mlxJungleJumper/slide.mp3"
    );
    this.sound_fall = this.p5.loadSound("assets_game/mlxJungleJumper/fall.mp3");
    this.sound_jump = this.p5.loadSound("assets_game/mlxJungleJumper/jump.mp3");
    this.sound_hit = this.p5.loadSound("assets_game/mlxJungleJumper/hit.mp3");
    this.sound_readygo = this.p5.loadSound(
      "assets_game/mlxJungleJumper/readygo.mp3"
    );
    this.sound_collect = this.p5.loadSound(
      "assets_game/mlxJungleJumper/correct.mp3"
    );
    this.font = this.p5.loadFont(
      "assets_game/mlxJungleJumper/Anakotmai-Bold.ttf"
    );
  }

  setup() {
    //Game Value
    this.TILE_TOTAL = 0; //all tile count(distance)
    this.MAIN_SPEED = 0.35;
    this.GAMEPHASE = "PREGAME"; //charcter is running+user can test sound action, no pit or obstracle is spawn yet.
    //Game Class
    this.ui = new JungleJumperUI(this);
    this.character = new JungleJumperCharacter(this);
    this.floorTile = new JungleJumperFloorTile(this);
    this.parallaxBG1 = new JungleJumperParallaxBG(this.img_p1, 8, this);
    this.parallaxBG2 = new JungleJumperParallaxBG(this.img_p2, 4, this);
    this.parallaxBG3 = new JungleJumperParallaxBG(this.img_p3, 1, this);
    this.img_run_array = [
      this.img_run_1,
      this.img_run_2,
      this.img_run_3,
      this.img_run_4,
      this.img_run_5,
      this.img_run_6,
      this.img_run_7,
      this.img_run_8,
    ];
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
    if (this.key == "A") {
      this.actionJump();
    } else if (this.key == "E") {
      this.actionSlide();
    } else if (this.key == "C") {
      this.actionStart();
    }

    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  draw(p5) {
    super.draw(p5);
    //put push/pop to prevent affect over other component
    this.precanvas.push();
    this.precanvas.background(0);
    //Parallax Background
    this.parallaxBG3.draw();
    this.parallaxBG2.draw();
    this.parallaxBG1.draw();
    //guide line
    if (this.GAMEPHASE == "PLAY") {
      this.precanvas.push();
      this.precanvas.stroke(255, 0, 0, 60);
      this.precanvas.strokeWeight(5);
      this.precanvas.line(
        this.canvas_w / 2,
        0,
        this.canvas_w / 2,
        this.canvas_h
      );
      this.precanvas.pop();
    }
    //Floor
    this.floorTile.draw();
    //spike
    for (var i = 0; i < this.spikeCount; i++) {
      this.spikes[i].draw();
    }
    if (this.spikeCount > 0 && this.spikes[0].markForRemove) {
      for (var i = 0; i < this.spikeCount + 1; i++) {
        this.spikes[i] = this.spikes[i + 1];
      }
      this.spikeCount--;
    }
    //----------------------
    //food
    for (var i = 0; i < this.foodCount; i++) {
      this.food[i].draw();
    }
    if (this.foodCount > 0 && this.food[0].markForRemove) {
      for (var i = 0; i < this.foodCount + 1; i++) {
        this.food[i] = this.food[i + 1];
      }
      this.foodCount--;
    }
    //Draw Character & check Pitfall
    var test = this.character.calculateAndDraw(this.floor_h);
    if (test > this.canvas_h && this.GAMEPHASE == "PLAY") {
      //Game Over
      this.MAIN_SPEED = 0;
      this.GAMEPHASE = "OVER";
      this.sound_fall.play();
    }
    //check hit Spike
    for (var i = 0; i < this.spikeCount; i++) {
      if (
        this.spikes[i].collide(
          this.p5.createVector(
            this.character.positionXOnScreen -
              this.character.characterWidth / 2,
            this.character.previousPositionY -
              this.character.characterHeight / 2
          ),
          this.p5.createVector(
            this.character.characterWidth,
            this.character.characterHeight
          )
        ) &&
        this.GAMEPHASE != "OVER"
      ) {
        //hit spike
        this.MAIN_SPEED = 0;
        this.GAMEPHASE = "OVER";
        this.sound_hit.play();
      }
    }
    //---------------------
    //check hit food
    for (var i = 0; i < this.foodCount; i++) {
      if (
        this.food[i].collide(
          this.p5.createVector(
            this.character.positionXOnScreen -
              this.character.characterWidth / 2,
            this.character.previousPositionY -
              this.character.characterHeight / 2
          ),
          this.p5.createVector(
            this.character.characterWidth,
            this.character.characterHeight
          )
        ) &&
        this.GAMEPHASE != "OVER"
      ) {
        //hit food
        this.foodScore += 1;
        this.food[i].markForRemove = true;
        this.sound_collect.play();
      }
    }
    //Obstacle gen
    if (this.GAMEPHASE == "PLAY") {
      this.obstacleGenerator.checkForObstacleGeneration();
    }
    //UI
    this.ui.draw();
    this.precanvas.pop();

    //Fullscreen
    this.canvas.push();
    if (this.fullscreen) {
      //resize & draw
      this.canvas.scale(this.fullscreen_scale);
    }
    this.canvas.image(this.precanvas, 0, 0);
    this.canvas.pop();
  }

  resetGame() {
    this.GAMEPHASE = "PLAY";
    this.MAIN_SPEED = 0.35;
    //Game Class
    this.ui = new JungleJumperUI(this);
    this.character = new JungleJumperCharacter(this);
    this.floorTile = new JungleJumperFloorTile(this);
    this.foodScore = 0;
    this.foodCount = 0;
    this.pitCount = 0;
    this.spikeCount = 0;
    this.obstacleGenerator = new JungleJumperObstacleGenerator(
      this.floorTile.tileCount + 16,
      this
    );
    this.sound_readygo.play();
  }

  //----------------------
  // Game action
  //----------------------
  actionJump() {
    if (this.character.currentAction == "RUN" && this.GAMEPHASE != "OVER") {
      this.sound_jump.play();
      this.character.currentAction = "JUMP";
      this.character.velocityY = 0.5;
    }
  }

  actionSlide() {
    if (this.character.currentAction == "RUN" && this.GAMEPHASE != "OVER") {
      this.sound_slide.play();
      this.character.currentAction = "SLIDE";
      this.character.currentActionTime = this.TIME_SLIDE;
    }
  }

  actionStart() {
    if (this.GAMEPHASE == "PREGAME" || this.GAMEPHASE == "OVER") {
      this.resetGame();
    }
  }
}

//==============================
// Character
//==============================
class JungleJumperCharacter {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.gravity = -0.001;
    this.positionY = 0;
    this.velocityY = 0;
    this.previousPositionY = 0;
    this.currentAction = "RUN"; //'RUN','JUMP','SLIDE'
    this.currentActionTime = 0;
    this.totalMeter = 0;
    this.positionXOnScreen = this.parent.canvas_w / 4;
    this.framecount = 0;
    this.frametime = 150;
    this.currentframe = 0;
    //this.ps = new ParticleSystem(0, createVector(0, 0), this.parent.image_particle);
  }

  calculateAndDraw(floorHeight) {
    //display bound
    if (this.currentAction == "SLIDE") {
      this.characterWidth = this.parent.character_w_slide;
      this.characterHeight = this.parent.character_h_slide;
    } else {
      this.characterWidth = this.parent.character_w;
      this.characterHeight = this.parent.character_h;
    }
    if (this.parent.GAMEPHASE != "OVER") {
      //simple gravity physics
      this.floorHeight = floorHeight;
      this.positionY += this.velocityY * this.parent.p5.deltaTime;
      this.velocityY += this.gravity * this.parent.p5.deltaTime;

      //check collide with floor
      if (
        this.parent.floorTile.collide(
          this.parent.p5.createVector(
            this.positionXOnScreen - this.characterWidth / 2,
            this.parent.canvas_h - this.positionY - this.characterHeight / 2
          ),
          this.parent.p5.createVector(this.characterWidth, this.characterHeight)
        )
      ) {
        if (this.currentAction == "SLIDE") {
          //slideing bypass action setting
          this.velocityY = this.positionY = 0;
        } else if (this.positionY < 0) {
          this.velocityY = this.positionY = 0;
          this.currentAction = "RUN"; //character finish jumping and touch the floor,reset action to none
        }
      }
    }
    //curretn Y pos
    var charYPos =
      this.parent.canvas_h -
      this.positionY -
      this.characterHeight / 2 -
      this.floorHeight;

    /*
    //draw particle
    push();
    let wind = createVector(-0.2, 0);
    this.ps.applyForce(wind);
    this.ps.run();
    if (GAMEPHASE != 'OVER' &&
      this.currentAction != 'JUMP') {
      //don't add particle when jump
      this.framecount = (this.framecount + 1) % 8;
      if (this.framecount == 0) {
        this.ps.origin = createVector((this.positionXOnScreen), charYPos + (this.characterHeight / 2));
        this.ps.addParticle();
      }
    }
    pop();
	*/
    //draw character
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    if (this.parent.GAMEPHASE == "OVER") {
      this.parent.precanvas.tint(100, 255);
      this.parent.precanvas.image(
        this.parent.image_jump,
        this.positionXOnScreen,
        charYPos,
        this.characterWidth,
        this.characterHeight
      );
    } else if (this.currentAction == "SLIDE") {
      //slideing
      this.parent.precanvas.image(
        this.parent.img_slide,
        this.positionXOnScreen,
        charYPos,
        this.characterWidth,
        this.characterHeight
      );
      this.currentActionTime -= this.parent.p5.deltaTime;
      //console.log(this.currentActionTime);
      if (this.currentActionTime <= 0) this.currentAction = "RUN";
    } else {
      //running/jumping
      charYPos =
        this.parent.canvas_h -
        this.positionY -
        this.characterHeight / 2 -
        this.floorHeight;
      if (this.previousPositionY < charYPos) {
        //Jumping
        this.parent.precanvas.image(
          this.parent.image_landing,
          this.positionXOnScreen,
          charYPos,
          this.characterWidth,
          this.characterHeight
        );
      } else if (this.previousPositionY > charYPos) {
        //Landing
        this.parent.precanvas.image(
          this.parent.image_jump,
          this.positionXOnScreen,
          charYPos,
          this.characterWidth,
          this.characterHeight
        );
      } else {
        //manual animation
        this.frametime -= this.parent.p5.deltaTime;
        if (this.frametime < 0) {
          this.frametime = 150;
          this.currentframe++;
          if (this.currentframe >= 8) this.currentframe = 0;
        }
        var current_img = this.parent.img_run_array[this.currentframe];
        this.parent.precanvas.image(
          current_img,
          this.positionXOnScreen,
          charYPos,
          this.characterWidth,
          this.characterHeight
        );
      }
    }
    this.previousPositionY = charYPos;
    //console.log(charYPos);
    this.parent.precanvas.pop();
    return charYPos;
  }

  checkCollideWithSpike() {
    for (var i = 0; i < this.parent.spikeCount; i++) {
      if (
        this.parent.spikes[i].collide(
          this.parent.p5.createVector(
            this.positionXOnScreen,
            this.previousPositionY
          ),
          this.parent.p5.createVector(this.characterWidth, this.characterHeight)
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
//==============================
// UI
//==============================
class JungleJumperUI {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.alpha_1 = 0;
    this.alpha_2 = 0;
    this.countdown = 4.0;
  }

  draw() {
    var width = this.parent.canvas_w;
    var height = this.parent.canvas_h;
    this.parent.precanvas.push();
    this.parent.precanvas.textFont(this.parent.font);
    //GAMEPHASE = 'PREGAME'; //'PREGAME','PLAYING','OVER'
    //----------------------------
    if (this.parent.GAMEPHASE == "PREGAME") {
      //draw welcome page
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(12, 0, 4);
      this.parent.precanvas.fill(255, 0, 0);
      this.parent.precanvas.text("How to Setup", width / 2, height / 2 + 20);
      this.parent.precanvas.fill(255);
      this.parent.precanvas.text('"A" to Jump', width / 2, height / 2 + 38);
      this.parent.precanvas.text('"E" to Slide', width / 2, height / 2 + 54);
      this.parent.precanvas.fill(255, 234, 0);
      this.parent.precanvas.text(
        '"C" to Start Game',
        width / 2,
        height / 2 + 67
      );
      //alpha with sin()
      this.alpha_1 += (this.parent.p5.deltaTime / 50.0) % 50;
      this.parent.precanvas.tint(
        255,
        this.parent.p5.abs(
          this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_1)
        ) * 255
      );
      this.parent.precanvas.image(
        this.parent.img_logo,
        width / 2,
        height / 2 - 50
      );
    }
    //----------------------------
    else if (this.parent.GAMEPHASE == "PLAY") {
      if (this.countdown < 0) {
        this.parent.precanvas.push();
        //show running meter
        this.parent.precanvas.textAlign(this.parent.p5.LEFT);
        this.setTextSizeStrokeWeight(15, 0, 4);
        this.parent.precanvas.fill(255, 230, 0);
        this.parent.precanvas.text(
          "Distance " +
            this.parent.p5.int(this.parent.character.totalMeter) +
            " m.",
          10,
          30
        );
        this.parent.precanvas.pop();
      } else if (this.countdown >= 0) {
        //show countdown to start
        this.parent.precanvas.textAlign(
          this.parent.p5.CENTER,
          this.parent.p5.CENTER
        );
        this.setTextSizeStrokeWeight(100, 0, 4);
        var alpha =
          255.0 * (this.countdown - this.parent.p5.int(this.countdown));
        this.parent.precanvas.stroke(0, alpha);
        this.parent.precanvas.fill(255, 0, 0, alpha);
        if (this.countdown > 1) {
          this.parent.precanvas.text(
            this.parent.p5.int(this.countdown),
            width / 2,
            height / 2
          );
        } else {
          this.parent.precanvas.text("GO!", width / 2, height / 2);
        }
        this.countdown -= this.parent.p5.deltaTime / 1000.0;
        this.parent.character.totalMeter = 0;
      }
    }
    //----------------------------
    else if (this.parent.GAMEPHASE == "OVER") {
      //draw gameover page
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(15, 0, 4);
      this.parent.precanvas.fill(157, 255, 134);
      this.parent.precanvas.text(
        "Your distance " + this.parent.character.totalMeter + " m.",
        width / 2,
        height / 2 + 20
      );
      this.parent.precanvas.text(
        "Food x" + this.parent.foodScore + " piece(s).",
        width / 2,
        height / 2 + 40
      );
      this.parent.precanvas.fill(100, 255, 100);
      this.parent.precanvas.text(
        "Total " +
          this.parent.p5.int(
            this.parent.character.totalMeter + this.parent.foodScore * 10
          ) +
          " point.",
        width / 2,
        height / 2 + 60
      );

      this.setTextSizeStrokeWeight(12, 0, 4);
      this.parent.precanvas.fill(255, 234, 0);
      this.parent.precanvas.text(
        '"C" to Start Game',
        width / 2,
        height / 2 + 80
      );
      this.setTextSizeStrokeWeight(30, 0, 6);
      //alpha with sin()
      this.alpha_1 += (this.parent.deltaTime / 50.0) % 50;
      this.parent.precanvas.stroke(
        0,
        0,
        0,
        this.parent.p5.abs(
          this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_1)
        ) * 255
      );
      this.parent.precanvas.fill(
        255,
        0,
        0,
        this.parent.p5.abs(
          this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_1)
        ) * 255
      );
      this.parent.precanvas.text("Game Over", width / 2, height / 2 - 20);
    }
    this.parent.precanvas.pop();
  }

  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.parent.precanvas.textSize(_size);
    this.parent.precanvas.stroke(_stroke);
    this.parent.precanvas.strokeWeight(_weight);
  }
}

//==============================
// FloorTile
//==============================
class JungleJumperFloorTile {
  constructor(mlxParent) {
    this.parent = mlxParent;
    //display image
    this.parent.TILE_TOTAL = 0;
    this.tileCount =
      this.parent.p5.floor(this.parent.canvas_w / this.parent.floor_w) + 2;
    this.PositionFloorTile = [];
    for (var i = 0; i < this.tileCount; i++) {
      this.PositionFloorTile[i] =
        this.parent.floor_w / 2 + this.parent.floor_w * (i + 1);
      this.parent.TILE_LOOP_NO[i] = this.parent.TILE_TOTAL;
      this.parent.TILE_TOTAL++;
    }
  }

  draw() {
    var width = this.parent.canvas_w;
    var height = this.parent.canvas_h;
    for (var i = 0; i < this.tileCount; i++) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      //check floor type
      var type = 0;
      if (this.parent.pitCount > 0) {
        for (var j = 0; j < this.parent.pitCount; j++) {
          if (this.parent.pits[j].isStartPit(this.parent.TILE_LOOP_NO[i]))
            type = 1;
          else if (this.parent.pits[j].isEndPit(this.parent.TILE_LOOP_NO[i]))
            type = 2;
          else if (this.parent.pits[j].isPitNone(this.parent.TILE_LOOP_NO[i]))
            type = 3;
        }
      }
      //draw floor tile
      if (type == 0)
        this.parent.precanvas.image(
          this.parent.img_tile_floor,
          this.PositionFloorTile[i],
          height - this.parent.floor_h / 2,
          this.parent.floor_w,
          this.parent.floor_h
        );
      else if (type == 1)
        this.parent.precanvas.image(
          this.parent.img_floor_start,
          this.PositionFloorTile[i],
          height - this.parent.floor_h / 2,
          this.parent.floor_w,
          this.parent.floor_h
        );
      else if (type == 2)
        this.parent.precanvas.image(
          this.parent.img_floor_end,
          this.PositionFloorTile[i],
          height - this.parent.floor_h / 2,
          this.parent.floor_w,
          this.parent.floor_h
        );
      else if (type == 3) {
      } //do nothing
      this.PositionFloorTile[i] -= 8 * this.parent.MAIN_SPEED;
      if (this.PositionFloorTile[i] < -(this.parent.floor_w / 2)) {
        this.parent.character.totalMeter += 0.5;
        this.PositionFloorTile[i] += this.parent.floor_w * this.tileCount;
        //pit[] is FIFO se we only need to check the first one(if avilable)
        if (
          this.parent.pitCount > 0 &&
          this.parent.pits[0].nextPit(this.parent.TILE_LOOP_NO[i])
        ) {
          //remove first pit object from pits[]
          for (var j = 0; j < this.parent.pitCount - 1; j++) {
            this.parent.pits[j] = this.parent.pits[j + 1];
          }
          this.parent.pitCount--;
        }
        this.parent.TILE_LOOP_NO[i] = this.parent.TILE_TOTAL;
        this.parent.TILE_TOTAL++;
      }
    }
    this.parent.precanvas.pop();
  }

  collide(charPos, charBound) {
    if (this.parent.pits == null) return true;
    for (var i = 0; i < this.tileCount; i++) {
      //check if current tile is not pit
      var isPit = false;
      for (var j = 0; j < this.parent.pitCount; j++) {
        if (this.parent.pits[j].isPitNone(this.parent.TILE_LOOP_NO[i]))
          isPit = true;
      }
      if (!isPit) {
        var vPos = this.parent.p5.createVector(
          this.PositionFloorTile[i] - this.parent.floor_w / 2,
          this.parent.canvas_h - this.parent.floor_h / 2
        );
        var vBound = this.parent.p5.createVector(
          this.parent.floor_w,
          this.parent.floor_h
        );
        //check intersection
        if (
          vPos.x < charPos.x + charBound.x &&
          vPos.x + vBound.x > charPos.x &&
          vPos.y < charPos.y + charBound.y &&
          vPos.y + vBound.y > charPos.y
        ) {
          //console.log('hit');
          return true;
        }
      }
    }
    return false;
  }
}

//==============================
//ObstrcleGenerator
//==============================
//create and maintain Spike+Pit
class JungleJumperObstacleGenerator {
  constructor(firstObstacleTile, mlxParent) {
    this.parent = mlxParent;
    this.nextRandom = firstObstacleTile;
    this.currentTileCount = this.parent.TILE_TOTAL;
    //console.log('firstObstacleTile:' + this.nextRandom);
  }

  checkForObstacleGeneration() {
    if (this.currentTileCount != this.parent.TILE_TOTAL) {
      this.currentTileCount = this.parent.TILE_TOTAL;
      if (this.parent.TILE_TOTAL >= this.nextRandom) {
        //create obstacle
        var ob = this.parent.p5.random([0, 1, 2, 3, 4]);
        if (ob == 2) {
          //create pit
          var target = this.parent.TILE_TOTAL + 1; // + random(0, 8);
          this.parent.pits[this.parent.pitCount] = new JungleJumperPitData(
            target,
            this.parent
          );
          this.parent.pitCount++;
          this.nextRandom = target + 19 + this.parent.p5.random(0, 8);
          //console.log('pit:' + target);
        } else if (ob == 3 || ob == 4) {
          //food
          var target = this.parent.TILE_TOTAL + 1; // + random(0, 8);
          this.parent.food[this.parent.foodCount] = new JungleJumperFood(
            target,
            this.parent
          );
          this.parent.foodCount++;
          this.nextRandom = target + 9 + this.parent.p5.random(0, 5);
        } else {
          //75% chance of create spike
          var target = this.parent.TILE_TOTAL + 1; // + random(0, 8);
          this.parent.spikes[this.parent.spikeCount] = new JungleJumperSpike(
            target,
            this.parent
          );
          this.parent.spikeCount++;
          this.nextRandom = target + 15 + this.parent.p5.random(0, 8);
          //console.log('spike:' + target);
        }
      }
    }
  }
}
//==============================
// Food
//==============================
class JungleJumperFood {
  constructor(appearOnTile, mlxParent) {
    this.parent = mlxParent;
    this.appearOnTile = appearOnTile;
    this.PositionX =
      this.parent.floor_w * this.parent.floorTile.tileCount -
      this.parent.floor_w / 2; //set start x position to synchronize with floortile
    this.markForRemove = false;
    this.food_wh = 30;
    this.PositionY = 100;
    this.alpha_1 = 0;
  }

  draw() {
    if (this.appearOnTile <= this.parent.TILE_TOTAL) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      //alpha with sin()
      this.alpha_1 += (this.parent.p5.deltaTime / 50.0) % 50;
      this.parent.precanvas.tint(
        255,
        this.parent.p5.abs(
          this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_1)
        ) * 255
      );
      this.parent.precanvas.image(
        this.parent.img_food,
        this.PositionX,
        this.PositionY,
        this.food_wh,
        this.food_wh
      );
      this.parent.precanvas.pop();
      this.PositionX -= 8 * this.parent.MAIN_SPEED;
      if (this.PositionX < -(this.food_wh / 2)) {
        this.markForRemove = true;
      }
    }
  }

  collide(charPos, charBound) {
    //rect(charPos.x, charPos.y, charBound.x, charBound.y);
    var vPos = this.parent.p5.createVector(
      this.PositionX - this.food_wh / 2,
      this.PositionY
    );
    var vBound = this.parent.p5.createVector(this.food_wh, this.food_wh);
    //rect(vPos.x, vPos.y, vBound.x, vBound.y);
    //check intersection
    if (
      vPos.x < charPos.x + charBound.x &&
      vPos.x + vBound.x > charPos.x &&
      vPos.y < charPos.y + charBound.y &&
      vPos.y + vBound.y > charPos.y
    ) {
      return true;
    }
    return false;
  }
}

//==============================
// SPIKE
//==============================
class JungleJumperSpike {
  constructor(appearOnTile, mlxParent) {
    this.parent = mlxParent;
    this.appearOnTile = appearOnTile;
    this.PositionX =
      this.parent.floor_w * this.parent.floorTile.tileCount -
      this.parent.floor_w / 2; //set start x position to synchronize with floortile
    this.markForRemove = false;
  }

  draw() {
    if (this.appearOnTile <= this.parent.TILE_TOTAL) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_spike,
        this.PositionX,
        this.parent.spike_h / 2,
        this.parent.spike_w,
        this.parent.spike_h
      );
      this.parent.precanvas.pop();
      this.PositionX -= 8 * this.parent.MAIN_SPEED;
      if (this.PositionX < -(this.parent.spike_w / 2)) {
        this.markForRemove = true;
      }
    }
  }

  collide(charPos, charBound) {
    //rect(charPos.x, charPos.y, charBound.x, charBound.y);
    var vPos = this.parent.p5.createVector(
      this.PositionX - this.parent.spike_w / 2 + 16,
      0
    );
    var vBound = this.parent.p5.createVector(
      this.parent.spike_w - 32,
      this.parent.spike_h - 10
    );
    //rect(vPos.x, vPos.y, vBound.x, vBound.y);
    //check intersection
    if (
      vPos.x < charPos.x + charBound.x &&
      vPos.x + vBound.x > charPos.x &&
      vPos.y < charPos.y + charBound.y &&
      vPos.y + vBound.y > charPos.y
    ) {
      return true;
    }
    return false;
  }
}

//==============================
// PIT
//==============================
class JungleJumperPitData {
  constructor(index, mlxParent) {
    //Pit Value
    this.parent = mlxParent;
    this.pitWidth = 6;
    this.pitStart = index;
    this.pitEnd = this.pitStart + this.pitWidth;
    //console.log(this.pitStart);
  }

  isStartPit(index) {
    if (this.parent.p5.int(index) == this.parent.p5.int(this.pitStart)) {
      return true;
    }
    return false;
  }

  isEndPit(index) {
    if (this.parent.p5.int(index) == this.parent.p5.int(this.pitEnd)) {
      return true;
    }
    return false;
  }
  isPitNone(index) {
    if (index > this.pitStart && index < this.pitEnd) {
      return true;
    }
    return false;
  }
  nextPit(index) {
    if (this.pitEnd < index) {
      return true;
    }
    return false;
  }
}
//==============================
// Parallax Background
//==============================
class JungleJumperParallaxBG {
  constructor(img, speed, mlxParent) {
    this.parent = mlxParent;
    this.speed = speed;
    this.img = img;
    this.count = 2;
    this.bgTile = [];
    for (var i = 0; i < this.count; i++) {
      this.bgTile[i] = this.parent.canvas_w * i;
    }
  }

  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    for (var i = 0; i < this.count; i++) {
      this.parent.precanvas.image(
        this.img,
        this.bgTile[i],
        0,
        this.parent.canvas_w,
        this.parent.canvas_h
      );
      this.bgTile[i] -= this.speed * this.parent.MAIN_SPEED;
      if (this.bgTile[i] < -this.parent.canvas_w)
        this.bgTile[i] += this.parent.canvas_w * this.count;
    }
    this.parent.precanvas.pop();
  }
}

module.exports = {
  mlxJungleJumper,
};
