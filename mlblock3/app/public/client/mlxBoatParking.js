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

class mlxBoatParking extends mlxElementLocakableOutput {
  constructor(mlx) {
    //mlx element
    super(mlx);
    this.title = "Boat Parking";
    this.category = "Output";
    this.type = "BoatParkingGame";
    this.inType = "posenet";
    this.outType = "results";
    this.needMouse = false;
    this.score = 0;
    this.canvasSize = 854;
    this.canvas_w = 854; //internal usage
    this.canvas_h = 560; //internal usage
    this.fullscreen = false; //internal usage
    this.fullscreen_scale = 1; //internal usage
    this.w = this.canvas_w / 2 + this.mlx.mlxPadding * 2; //size including frame
    this.h =
      this.canvas_h / 2 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2; //size including frame
    this.fps = 15;
    this.createElementMenu();
    this.offScreenX = this.mlx.mlxPadding;
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.offScreen = this.mlx.createCanvas(
      this,
      this.offScreenX,
      this.offScreenY,
      this.canvas_w / 2,
      this.canvas_h / 2
    );
    this.canvas = this.offScreen.offScreen;
    this.precanvas = this.p5.createGraphics(this.canvas_w, this.canvas_h);

    this.pose = [];
    this.skeletons = [];
    this.posNose = [];
    this.posLeftWrist = [];
    this.posRightWrist = [];
    this.posLeftElbow = [];
    this.posRightElbow = [];
    this.prevLeftElbowPos = null;
    this.prevRightElbowPos = null;
    /**posLeftShoulder = [],
      posRightShoulder = [];*/
    //Game Value
    this.gameMode = "SETUP"; //'SETUP','INTRO','PLAY','OVER'
    this.gameLevel;
    this.MIN_L_ANGLE;
    this.MIN_R_ANGLE;
    this.MAX_L_ANGLE;
    this.MAX_R_ANGLE;
    this.SPEED = 62; //100 is normal play mode
    this.INITIAL_RELEASE_TIME = 6000; //normal is 3600
    this.RELESEBOX_CONDITION_1 = 1600; //normal is 1200
    this.RELESEBOX_CONDITION_2 = 2600; //normal is 2200
    this.RELESEBOX_CONDITION_3 = 3700; //normal is 3300
    this.HP = 5;
    this.SCORE = 0;
    this.ALLOWED_CALIBRATE_MOVING_PIXEL = 40;
    //display size
    this.CV_SIZE_W = 854;
    this.CV_SIZE_H = 560;
    this.BOX_W = 101;
    this.BOX_H = 80;
    //image
    //this.img_logo, img_marker_red, img_marker, img_mask, img_step1, img_step2;
    //this.img_building_right, img_heart, img_box_blue, img_box_red, img_box_yellow, img_right, img_wrong, img_heart, img_heart_empty;
    //UI
    this.ui_calibrate;
    this.ui_game;
    this.boxes = [];
    this.font; //font
    //sound
    //this.sound_beep, sound_changepoint, sound_ok, sound_falldown, sound_correct, sound_movebridge, sound_wrong, sound_over, sound_start;
    //this.sound_yes, sound_no;

    //internal setup
    this.preload();
    this.setup();

    //Output(required)
    this.output = this.canvas;
    this.ready = true;
  }

  preload() {
    this.img_logo = this.p5.loadImage("assets_game/mlxBoatParking/logo.png");
    this.img_marker_red = this.p5.loadImage(
      "assets_game/mlxBoatParking/p_marker_red.png"
    );
    this.img_marker = this.p5.loadImage(
      "assets_game/mlxBoatParking/p_marker_black.png"
    );
    this.img_mask = this.p5.loadImage("assets_game/mlxBoatParking/mask.png");
    this.img_step1 = this.p5.loadImage("assets_game/mlxBoatParking/step2.png");
    this.img_step2 = this.p5.loadImage("assets_game/mlxBoatParking/step3.png");
    this.img_bg = this.p5.loadImage("assets_game/mlxBoatParking/bg.png");
    //this.img_building_right = loadImage('Assets/port.png');
    this.img_heart = this.p5.loadImage("assets_game/mlxBoatParking/heart.png");

    this.img_box_b1 = this.p5.loadImage("assets_game/mlxBoatParking/b1.png");
    this.img_box_b2 = this.p5.loadImage("assets_game/mlxBoatParking/b2.png");
    this.img_box_b3 = this.p5.loadImage("assets_game/mlxBoatParking/b3.png");
    this.img_box_b4 = this.p5.loadImage("assets_game/mlxBoatParking/b4.png");
    this.img_box_bf = this.p5.loadImage("assets_game/mlxBoatParking/bf.png");

    this.img_box_r1 = this.p5.loadImage("assets_game/mlxBoatParking/r1.png");
    this.img_box_r2 = this.p5.loadImage("assets_game/mlxBoatParking/r2.png");
    this.img_box_r3 = this.p5.loadImage("assets_game/mlxBoatParking/r3.png");
    this.img_box_r4 = this.p5.loadImage("assets_game/mlxBoatParking/r4.png");
    this.img_box_rf = this.p5.loadImage("assets_game/mlxBoatParking/rf.png");

    this.img_box_y1 = this.p5.loadImage("assets_game/mlxBoatParking/y1.png");
    this.img_box_y2 = this.p5.loadImage("assets_game/mlxBoatParking/y2.png");
    this.img_box_y3 = this.p5.loadImage("assets_game/mlxBoatParking/y3.png");
    this.img_box_y4 = this.p5.loadImage("assets_game/mlxBoatParking/y4.png");
    this.img_box_yf = this.p5.loadImage("assets_game/mlxBoatParking/yf.png");

    this.img_buoy1 = this.p5.loadImage("assets_game/mlxBoatParking/buoy1.png");
    this.img_buoy2 = this.p5.loadImage("assets_game/mlxBoatParking/buoy2.png");
    this.img_buoy3 = this.p5.loadImage("assets_game/mlxBoatParking/buoy3.png");
    this.img_buoy4 = this.p5.loadImage("assets_game/mlxBoatParking/buoy4.png");

    this.img_rock1 = this.p5.loadImage("assets_game/mlxBoatParking/rock1.png");
    this.img_rock2 = this.p5.loadImage("assets_game/mlxBoatParking/rock2.png");

    this.img_right = this.p5.loadImage("assets_game/mlxBoatParking/right.png");
    this.img_wrong = this.p5.loadImage("assets_game/mlxBoatParking/wrong.png");
    this.img_heart = this.p5.loadImage("assets_game/mlxBoatParking/heart.png");
    this.img_heart_empty = this.p5.loadImage(
      "assets_game/mlxBoatParking/heart_empty.png"
    );
    this.img_waiting = this.p5.loadImage(
      "assets_game/mlxBoatParking/waittoconnect.png"
    );

    this.font = this.p5.loadFont("assets_game/mlxBoatParking/FFFFORWA.TTF");

    this.sound_beep = this.p5.loadSound("assets_game/mlxBoatParking/beep.mp3");
    this.sound_changepoint = this.p5.loadSound(
      "assets_game/mlxBoatParking/beep.mp3"
    );
    this.sound_ok = this.p5.loadSound("assets_game/mlxBoatParking/ok.mp3");
    this.sound_falldown = this.p5.loadSound(
      "assets_game/mlxBoatParking/falldown.mp3"
    );
    this.sound_correct = this.p5.loadSound(
      "assets_game/mlxBoatParking/correct.mp3"
    );
    this.sound_movebridge = this.p5.loadSound(
      "assets_game/mlxBoatParking/movebridge.mp3"
    );
    this.sound_wrong = this.p5.loadSound(
      "assets_game/mlxBoatParking/wrong.mp3"
    );
    this.sound_over = this.p5.loadSound(
      "assets_game/mlxBoatParking/gameover.mp3"
    );
    //this.sound_start = loadSound('Assets/start.mp3');
    this.sound_yes = this.p5.loadSound("assets_game/mlxBoatParking/yes.mp3");
    this.sound_no = this.p5.loadSound("assets_game/mlxBoatParking/no.mp3");
    this.sound_start = this.p5.loadSound(
      "assets_game/mlxBoatParking/music.mp3"
    );
    this.sound_wave = this.p5.loadSound("assets_game/mlxBoatParking/wave.mp3");
  }

  setup() {
    /*
    createCanvas(this.CV_SIZE_W, this.CV_SIZE_H);
    maximizeCanvas();
    video = createCapture(VIDEO);
    video.size(this.CV_SIZE_W, this.CV_SIZE_H);
    pixelDensity(1);
    pg = createGraphics(this.CV_SIZE_W, this.CV_SIZE_H);
    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, this.modelReady);
    poseNet.on('pose', function(results) {
      //main.poses = results;
      drawKeypoints(results); //get POSTNET data
    });
    // Hide the video element, and just show the canvas
    video.hide();
	*/

    //Game Setup
    this.imageListY = [
      this.img_box_y1,
      this.img_box_y2,
      this.img_box_y3,
      this.img_box_y4,
      this.img_box_yf,
    ];
    this.imageListB = [
      this.img_box_b1,
      this.img_box_b2,
      this.img_box_b3,
      this.img_box_b4,
      this.img_box_bf,
    ];
    this.imageListR = [
      this.img_box_r1,
      this.img_box_r2,
      this.img_box_r3,
      this.img_box_r4,
      this.img_box_rf,
    ];
    this.imgBuoy = [
      this.img_buoy1,
      this.img_buoy2,
      this.img_buoy3,
      this.img_buoy4,
    ];
    this.Buoy = [];
    this.Buoy[0] = new Buoy(this, 24, 101, 0);
    this.Buoy[1] = new Buoy(this, 94, 101, 1);
    this.Buoy[2] = new Buoy(this, 165, 101, 2);
    this.Buoy[3] = new Buoy(this, 24, 231, 1);
    this.Buoy[4] = new Buoy(this, 94, 231, 2);
    this.Buoy[5] = new Buoy(this, 165, 231, 0);
    this.Buoy[6] = new Buoy(this, 24, 360, 2);
    this.Buoy[7] = new Buoy(this, 94, 360, 0);
    this.Buoy[8] = new Buoy(this, 165, 360, 1);
    this.Buoy[9] = new Buoy(this, 24, 487, 0);
    this.Buoy[10] = new Buoy(this, 94, 487, 1);
    this.Buoy[11] = new Buoy(this, 165, 487, 2);

    this.ui_calibrate = new UI_Calibrate(this);
    this.ui_game = new UI_Game(this);
    this.precanvas.textFont(this.font);
  }

  doProcess() {
    this.poses = this.inElement.output;
    this.getKeypoints(); //process data

    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  draw(p5) {
    if (!this.lockCanvasToThisElement) super.draw(p5);
    //check if has video input
    //if has then play game
    if (
      this.inElement != null &&
      this.inElement.inElement != null &&
      this.inElement.inElement.videoCapture != null
    ) {
      //Video&Skeleton
      if (!this.gameConnected) {
        //reset game
        this.ui_calibrate.calibrateStep = "step1";
        this.gameMode = "SETUP";
        this.gameConnected = true;
      }
      this.precanvas.push();
      if (this.inElement.inElement.flip) {
        this.precanvas.scale(-1, 1); //flip video
        this.precanvas.translate(0 - this.canvas_w, 0);
      }
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.inElement.inElement.videoCapture,
        0,
        0,
        this.canvas_w,
        this.canvas_h
      );
      this.precanvas.pop();

      //Game Draw
      if (this.gameMode == "SETUP") {
        //console.log(this.inElement.inElement.videoWidth+"||"+this.inElement.inElement.videoHeight)
        this.ui_calibrate.draw();
      } else {
        this.ui_game.draw();
      }
    } else {
      //no video input
      this.precanvas.push();
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.img_waiting,
        0,
        0,
        this.canvas_w,
        this.canvas_h
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
    this.canvas.resizeCanvas(this.canvas_w, this.canvas_h);
    this.fullscreen = false;
  }

  enterFullScreen() {
    super.enterFullScreen();
    this.fullscreen = true;
    this.fullscreen_scale = this.contentW / this.canvas_w;
    var scale_h = (this.h - 110) / this.canvas_h;
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h;
    this.canvas.resizeCanvas(
      this.canvas_w * this.fullscreen_scale,
      this.canvas_h * this.fullscreen_scale
    );
  }
  //===============================
  // POSTNET Draw
  //===============================
  // A function to draw ellipses over the detected keypoints
  getKeypoints() {
    //prevent null object
    if (this.poses == null) return;
    // Loop through all the poses detected
    var nScore = 0;
    var elScore = 0;
    var erScore = 0;
    var wlScore = 0;
    var wrScore = 0;
    //for (let i = 0; i < this.p5.min(this.poses.length, 1); i++) {
    for (let i = 0; i < this.poses.length; i++) {
      if (this.poses[i].pose == null) return;
      // For each pose detected, loop through all the keypoints
      //for (let j = 0; j < this.poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let kps = this.poses[i].pose.keypoints;
      // Only draw an ellipse is the pose probability is bigger than 0.2
      //if (keypoint.score > 0.08) {
      var keypoint = kps[0]; //nose
      if (keypoint.score > 0.1 && nScore < keypoint.score) {
        var xpos = keypoint.position.x;
        if (this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        this.posNose[0] = this.p5.createVector(xpos, keypoint.position.y);
        nScore = keypoint.score;
      }
      keypoint = kps[7]; //leftElbow
      if (keypoint.score > 0.1 && elScore < keypoint.score) {
        var xpos = keypoint.position.x;
        if (this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        this.posLeftElbow[0] = this.p5.createVector(xpos, keypoint.position.y);
        elScore = keypoint.score;
      }
      keypoint = kps[8]; //rightElbow
      if (keypoint.score > 0.1 && erScore < keypoint.score) {
        var xpos = keypoint.position.x;
        if (this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        this.posRightElbow[0] = this.p5.createVector(xpos, keypoint.position.y);
        erScore = keypoint.score;
      }
      keypoint = kps[10]; //rightWrist
      if (keypoint.score > 0.1 && wrScore < keypoint.score) {
        var xpos = keypoint.position.x;
        if (this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        this.posRightWrist[0] = this.p5.createVector(xpos, keypoint.position.y);
        wrScore = keypoint.score;
      }
      keypoint = kps[9]; //leftWrist
      if (keypoint.score > 0.1 && wlScore < keypoint.score) {
        var xpos = keypoint.position.x;
        if (this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        this.posLeftWrist[0] = this.p5.createVector(xpos, keypoint.position.y);
        wlScore = keypoint.score;
      }
    }
  }
  //===============================
  //Angle Calculation
  //===============================
  degree(pos1, pos2) {
    //calculate degree between 2 point
    //To eliminate positive/negative value problem
    //we added all degree into range of 271 to 630 degrees
    //Left hand degree is increase when raise hand
    //Right hand degree is decrease when raise hand
    var d = this.p5.degrees(this.p5.atan2(pos2.y - pos1.y, pos2.x - pos1.x));
    if (d < 0) d += 360;
    if (d < 270) d += 360;
    return d;
  }

  distance(pos1, pos2) {
    var dist = this.p5.sqrt(
      this.p5.pow(pos2.x - pos1.x, 2) + this.p5.pow(pos2.y - pos1.y, 2)
    );
    return dist;
  }

  checkRaiseHand() {
    //check null
    if (
      this.posRightElbow[0] == null ||
      this.posLeftElbow[0] == null ||
      this.posNose[0] == null ||
      this.prevLeftElbowPos == null ||
      this.prevRightElbowPos == null
    )
      return false;
    if (
      (this.degree(this.posNose[0], this.posRightElbow[0]) >= 300 ||
        this.degree(this.posNose[0], this.posRightElbow[0]) <= 380) &&
      this.degree(this.posNose[0], this.posLeftElbow[0]) <= 600 &&
      this.degree(this.posNose[0], this.posLeftElbow[0]) >= 520
    ) {
      //raise hand,
      //now check if user stay still
      //allowed moving in ALLOWED_CALIBRATE_MOVING_PIXEL radius
      if (
        this.distance(this.posLeftElbow[0], this.prevLeftElbowPos) <=
          this.ALLOWED_CALIBRATE_MOVING_PIXEL &&
        this.distance(this.posRightElbow[0], this.prevRightElbowPos) <=
          this.ALLOWED_CALIBRATE_MOVING_PIXEL
      ) {
        return true;
      }
    }
    return false;
  }

  checkLowerHand() {
    //check null
    if (
      this.posRightElbow[0] == null ||
      this.posLeftElbow[0] == null ||
      this.posNose[0] == null ||
      this.prevLeftElbowPos == null ||
      this.prevRightElbowPos == null
    )
      return false;
    //now check if user lower hand(top is 0)
    if (
      this.posNose[0].y <= this.posLeftWrist[0].y &&
      this.posNose[0].y <= this.posRightWrist[0].y &&
      this.posLeftWrist[0].y < this.posLeftElbow[0].y &&
      this.posRightWrist[0].y < this.posRightElbow[0].y
    ) {
      //lower hand,
      //now check if user stay still
      //allowed moving in ALLOWED_CALIBRATE_MOVING_PIXEL radius
      if (
        this.distance(this.posLeftElbow[0], this.prevLeftElbowPos) <=
          this.ALLOWED_CALIBRATE_MOVING_PIXEL &&
        this.distance(this.posRightElbow[0], this.prevRightElbowPos) <=
          this.ALLOWED_CALIBRATE_MOVING_PIXEL
      ) {
        return true;
      }
    }
    return false;
  }

  // The callback that gets called every time there's an update from the model
  gotPoses(results) {
    this.poses = results;
  }

  modelReady() {
    //select('#status').html('model Loaded');
  }
}

//===============================
// Box
//===============================
class Buoy {
  constructor(mlxParent, _x, _y, startIndex) {
    this.parent = mlxParent;
    this.x = _x;
    this.y = _y;
    this.time = 200;
    this.index = startIndex;
  }
  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.translate(this.x, this.y);
    this.parent.precanvas.image(this.parent.imgBuoy[this.index], 0, 0);
    this.time -= this.parent.p5.deltaTime;
    if (this.time < 0) {
      this.time = 200;
      this.index++;
      if (this.index >= 4) this.index = 0;
    }
    this.parent.precanvas.pop();
  }
}

//===============================
// Box
//===============================
class Box {
  constructor(mlxParent, platform, target) {
    this.parent = mlxParent;
    this.xPos = [224, 634];
    this.yPos = [204, 342, 475];
    this.originPlatform = platform;
    this.targetPlatform = target; //yellow,red,blue
    this.imageList = this.parent.imageListY;
    if (this.targetPlatform == 1) this.imageList = this.parent.imageListB;
    else if (this.targetPlatform == 2) this.imageList = this.parent.imageListR;
    this.myImage = this.imageList[this.parent.p5.random([0, 1, 2, 3])];
    this.x = 0;
    this.y = 0; //use only when drop
    this.onBridge = false;
    this.onTarget = false;
    this.drop = false;
    this.bridgeWidth = this.xPos[1] - this.xPos[0];
    this.checked = false;
    this.correct = 0;
    this.deleteTime = 2000;
    this.delete = false;
  }

  draw() {
    if (!this.delete) {
      //img_box_blue, img_box_red, img_box_yellow
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CORNER);
      if (!this.drop) {
        this.x += this.parent.p5.floor(
          this.parent.SPEED * (this.parent.p5.deltaTime / 1000)
        );
        if (this.x > this.parent.CV_SIZE_W + this.parent.BOX_W / 2)
          this.delete = true;
        //draw box
        if (this.x < this.xPos[0]) {
          //on origin platform
          this.parent.precanvas.translate(
            this.x,
            this.yPos[this.originPlatform]
          );
          this.parent.precanvas.image(
            this.myImage,
            -this.parent.BOX_W / 2,
            -this.parent.BOX_H,
            this.parent.BOX_W,
            this.parent.BOX_H
          );
        } else if (this.x >= this.xPos[0] && !this.onBridge && !this.onTarget) {
          //calculate if bridge is on current origin platform
          if (this.parent.ui_game.selectedPointL == this.originPlatform) {
            this.onBridge = true;
            this.parent.precanvas.translate(this.x, this.calculateHeight());
            this.parent.precanvas.image(
              this.myImage,
              -this.parent.BOX_W / 2,
              -this.parent.BOX_H,
              this.parent.BOX_W,
              this.parent.BOX_H
            );
          } else {
            //box is missing the bridge
            this.drop = true;
            this.parent.sound_falldown.play();
            this.y = this.yPos[this.originPlatform];
            this.myImage = this.imageList[4]; //
            this.parent.HP--;
            if (this.parent.HP <= 0) {
              //Game Over
              this.parent.gameMode = "OVER";
              this.parent.sound_over.play();
            }
          }
        } else if (this.x >= this.xPos[0] && this.onBridge && !this.onTarget) {
          this.parent.precanvas.translate(this.x, this.calculateHeight());
          this.parent.precanvas.image(
            this.myImage,
            -this.parent.BOX_W / 2,
            -this.parent.BOX_H,
            this.parent.BOX_W,
            this.parent.BOX_H
          );
          if (this.x >= this.xPos[1]) {
            //reach target bridge
            this.onTarget = true;
            this.originPlatform = this.parent.ui_game.selectedPointR;
          }
        } else {
          //on origin platform
          this.parent.precanvas.translate(
            this.x,
            this.yPos[this.originPlatform]
          );
          this.parent.precanvas.image(
            this.myImage,
            -this.parent.BOX_W / 2,
            -this.parent.BOX_H,
            this.parent.BOX_W,
            this.parent.BOX_H
          );
          //draw right/wrong sign on top
          if (this.correct == 1)
            this.parent.precanvas.image(
              this.parent.img_right,
              -21,
              -42,
              42,
              42
            );
          else if (this.correct == 2)
            this.parent.precanvas.image(
              this.parent.img_wrong,
              -21,
              -42,
              42,
              42
            );
          //check if on the right platform
          if (
            !this.checked &&
            this.x < this.parent.CV_SIZE_W - 70 &&
            this.targetPlatform == this.originPlatform
          ) {
            //correct platform
            this.correct = 1;
            this.parent.sound_correct.play();
            this.parent.SCORE++;
            this.checked = true;
          } else if (
            !this.checked &&
            this.x < this.parent.CV_SIZE_W - 70 &&
            this.targetPlatform != this.originPlatform
          ) {
            //wrong platform
            this.parent.sound_wrong.play();
            this.correct = 2;
            this.parent.HP--;
            if (this.parent.HP <= 0) {
              //Game Over
              this.parent.gameMode = "OVER";
              this.parent.sound_over.play();
            }
            this.checked = true;
          }
        }
      }
      if (this.drop) {
        // ship break
        this.parent.precanvas.translate(this.x, this.y);
        //this.y += (this.y * 0.02);
        this.parent.precanvas.imageMode(this.parent.precanvas.CORNER);
        this.parent.precanvas.image(
          this.myImage,
          -this.parent.BOX_W / 2,
          -this.parent.BOX_H,
          this.parent.BOX_W,
          this.parent.BOX_H
        );
        //if (this.y > this.parent.CV_SIZE_H + (this.parent.BOX_H / 2)) this.delete = true;
        this.deleteTime -= this.parent.p5.deltaTime;
        if (this.deleteTime < 0) {
          this.delete = true;
        }
      }
      this.parent.precanvas.pop();
    }
  }

  calculateHeight() {
    var percent = (this.x - this.xPos[0]) / this.bridgeWidth;
    var yCurrent =
      this.yPos[this.parent.ui_game.selectedPointL] +
      percent *
        (this.yPos[this.parent.ui_game.selectedPointR] -
          this.yPos[this.parent.ui_game.selectedPointL]);
    return yCurrent;
  }
}
//===============================
// UI
//===============================
class UI_Game {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.leftPos = [
      this.parent.p5.createVector(224, 204),
      this.parent.p5.createVector(224, 342),
      this.parent.p5.createVector(224, 475),
    ]; //top,mid,bottom
    this.rightPos = [
      this.parent.p5.createVector(634, 204),
      this.parent.p5.createVector(634, 342),
      this.parent.p5.createVector(634, 475),
    ]; //top,mid,bottom
    (this.previousPointL = 2), (this.previousPointR = 2);
    //this.selectedPointL,this.selectedPointR;	//display point
    //this.upperL,this.upperR,this.lowerL,this.lowerR	// bound for calculation
    this.alpha_2 = 0;
    this.checkingCountDown = 3000;
    this.beepSoundTime = 1000;
    this.degreeL = null;
    this.degreeR = null;
    this.nextBox = new Box(
      this.parent,
      this.parent.p5.random([0, 1, 2]),
      this.parent.p5.random([0, 1, 2])
    );
    this.releasebox = this.parent.INITIAL_RELEASE_TIME;
  }

  /*img_marker, img_mask, img_building_left,img_building_right,img_heart,img_box_blue,img_box_red,img_box_yellow;*/
  draw() {
    this.getCurrentAngle();
    this.calculateCurrentSelectedPoint();
    this.drawBackground();
    //draw Buoy
    for (var i = 0; i < this.parent.Buoy.length; i++) {
      this.parent.Buoy[i].draw();
    }
    //score & heart
    this.parent.precanvas.push();
    this.parent.precanvas.fill(255, 170, 0);
    this.parent.precanvas.textAlign(this.parent.p5.LEFT, this.parent.p5.CENTER);
    this.setTextSizeStrokeWeight(30, 0, 5);
    this.parent.precanvas.text("SCORE: " + this.parent.SCORE, 20, 30);
    for (var i = 0; i < 5; i++) {
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      if (i < this.parent.HP)
        this.parent.precanvas.image(
          this.parent.img_heart,
          this.parent.CV_SIZE_W - 30 - 54 * i,
          28
        );
      else
        this.parent.precanvas.image(
          this.parent.img_heart_empty,
          this.parent.CV_SIZE_W - 30 - 54 * i,
          28
        );
    }
    this.parent.precanvas.pop();
    //draw bridge line between selected point
    this.parent.precanvas.push();
    this.parent.precanvas.stroke(25, 151, 200);
    this.parent.precanvas.drawingContext.setLineDash([5, 15]);
    this.parent.precanvas.strokeWeight(10);
    this.parent.precanvas.line(
      this.leftPos[this.selectedPointL].x,
      this.leftPos[this.selectedPointL].y,
      this.rightPos[this.selectedPointR].x,
      this.rightPos[this.selectedPointR].y
    );
    this.parent.precanvas.pop();
    var boxes = this.parent.boxes;
    //Intro
    if (this.parent.gameMode == "INTRO") {
      this.drawIntro();
    } else if (this.parent.gameMode == "PLAY") {
      //GamePlay
      //add speed factor
      if (this.parent.SCORE < 15) this.parent.SPEED = 65;
      else if (this.parent.SCORE < 35) this.parent.SPEED = 90;
      else if (this.parent.SCORE < 50) this.parent.SPEED = 100;
      else if (this.parent.SCORE < 70) this.parent.SPEED = 115;
      //draw box
      this.releasebox -= this.parent.p5.deltaTime;
      if (this.releasebox < 0) {
        //--------------------------
        //plan for next box
        if (boxes.length == 0) {
          console.log("boxes.length == 0");
          this.releasebox = this.parent.INITIAL_RELEASE_TIME;
          boxes[boxes.length] = this.nextBox;
          this.nextBox = new Box(
            this.parent,
            this.parent.p5.random([0, 1, 2]),
            this.parent.p5.random([0, 1, 2])
          );
        } else {
          console.log("boxes.length:" + boxes.length);
          var choice = this.parent.p5.random([0, 1, 2]);
          if (choice == 1) {
            //samebox ,same platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_1 -
              850 * ((this.parent.SPEED - 65) / 50);
            boxes[boxes.length] = this.nextBox;
            this.nextBox = new Box(
              this.parent,
              boxes[boxes.length - 1].originPlatform,
              boxes[boxes.length - 1].targetPlatform
            );
          } else if (choice == 2) {
            //diff box ,random platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_2 -
              1200 * ((this.parent.SPEED - 65) / 50);
            boxes[boxes.length] = this.nextBox;
            var target = this.parent.p5.random([0, 1, 2]);
            var platform = this.parent.p5.random([0, 1, 2]);
            while (boxes[boxes.length - 1].originPlatform == platform) {
              target = this.parent.p5.random([0, 1, 2]);
              platform = this.parent.p5.random([0, 1, 2]);
            }
            this.nextBox = new Box(
              this.parent,
              platform,
              this.parent.p5.random([0, 1, 2])
            );
          } else {
            //diff box , diff platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_3 -
              1500 * ((this.parent.SPEED - 65) / 50);
            boxes[boxes.length] = this.nextBox;
            var target = this.parent.p5.random([0, 1, 2]);
            var platform = this.parent.p5.random([0, 1, 2]);
            while (
              boxes[boxes.length - 1].originPlatform == platform ||
              boxes[boxes.length - 1].targetPlatform == target
            ) {
              target = this.parent.p5.random([0, 1, 2]);
              platform = this.parent.p5.random([0, 1, 2]);
            }
            this.nextBox = new Box(this.parent, platform, target);
          }
        }
        //--------------------------
      }

      for (var i = 0; i < boxes.length; i++) {
        boxes[i].draw();
      }

      //draw marker point
      this.drawMarkerPoint();
      /*
		//draw port on top
		push();
		imageMode(CORNER);
		image(this.parent.img_building_right, 637, 173, 216, 343);
		pop();
		*/
    } else if (this.parent.gameMode == "OVER") {
      this.drawOver();

      //draw marker point
      this.drawMarkerPoint();
    }
  }

  initialRangeCalculate() {
    //calculate both Left&right
    //MIN_L_ANGLE, MIN_R_ANGLE, MAX_L_ANGLE, MAX_R_ANGLE
    //Left hand degree is increase when raise hand
    //Right hand degree is decrease when raise hand
    var rangeL = this.parent.MAX_L_ANGLE - this.parent.MIN_L_ANGLE;
    var rangeR = this.parent.MAX_R_ANGLE - this.parent.MIN_R_ANGLE;
    this.upperL = rangeL * 0.8 + this.parent.MIN_L_ANGLE;
    this.lowerL = rangeL * 0.35 + this.parent.MIN_L_ANGLE;
    this.upperR = this.parent.MAX_R_ANGLE - rangeR * 0.8;
    this.lowerR = this.parent.MAX_R_ANGLE - rangeR * 0.35;
  }
  ///-----------------------------
  //Control selected point
  //------------------------------
  calculateCurrentSelectedPoint() {
    //Left hand degree is increase when raise hand
    this.selectedPointL = 1;
    if (this.degreeL > this.upperL) this.selectedPointL = 0;
    else if (this.degreeL < this.lowerL) this.selectedPointL = 2;
    //Right hand degree is decrease when raise hand
    this.selectedPointR = 1;
    if (this.degreeR < this.upperR) this.selectedPointR = 0;
    else if (this.degreeR > this.lowerR) this.selectedPointR = 2;
    //Play sound when point change
    if (this.previousPointL != this.selectedPointL)
      this.parent.sound_movebridge.play();
    if (this.previousPointR != this.selectedPointR)
      this.parent.sound_movebridge.play();
    this.previousPointL = this.selectedPointL;
    this.previousPointR = this.selectedPointR;
  }

  getCurrentAngle() {
    if (this.degreeL == null)
      this.degreeL = this.parent.degree(
        this.parent.posNose[0],
        this.parent.posLeftElbow[0]
      );
    if (this.degreeR == null)
      this.degreeR = this.parent.degree(
        this.parent.posNose[0],
        this.parent.posLeftElbow[0]
      );
    this.degreeL =
      (this.degreeL +
        this.parent.degree(
          this.parent.posNose[0],
          this.parent.posLeftElbow[0]
        )) /
      2; //simple filter
    this.degreeR =
      (this.degreeR +
        this.parent.degree(
          this.parent.posNose[0],
          this.parent.posRightElbow[0]
        )) /
      2;
  }

  drawBackground() {
    //game background
    this.parent.precanvas.push();
    this.parent.precanvas.fill(0, 200);
    this.parent.precanvas.rect(
      0,
      0,
      this.parent.CV_SIZE_W,
      this.parent.CV_SIZE_H
    );
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(
      this.parent.img_bg,
      0,
      0,
      this.parent.CV_SIZE_W,
      this.parent.CV_SIZE_H
    );
    //image(this.parent.img_building_right, 637, 173, 216, 343);
    this.parent.precanvas.strokeWeight(10);
    this.parent.precanvas.stroke(25, 151, 200);
    this.parent.precanvas.drawingContext.setLineDash([5, 15]);
    this.parent.precanvas.line(0, 204, 223, 204);
    this.parent.precanvas.line(0, 342, 223, 342);
    this.parent.precanvas.line(0, 475, 223, 475);
    this.parent.precanvas.pop();
  }

  drawMarkerPoint() {
    //draw marker point
    for (var i = 0; i < 3; i++) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      //leftpoint
      if (i == this.selectedPointL) {
        this.parent.precanvas.image(
          this.parent.img_marker_red,
          this.leftPos[i].x,
          this.leftPos[i].y
        );
      } else {
        this.parent.precanvas.image(
          this.parent.img_marker,
          this.leftPos[i].x,
          this.leftPos[i].y
        );
      }
      //right point
      if (i == this.selectedPointR) {
        this.parent.precanvas.image(
          this.parent.img_marker_red,
          this.rightPos[i].x,
          this.rightPos[i].y
        );
      } else {
        this.parent.precanvas.image(
          this.parent.img_marker,
          this.rightPos[i].x,
          this.rightPos[i].y
        );
      }
      this.parent.precanvas.pop();
    }
  }

  drawIntro() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    this.parent.precanvas.image(
      this.parent.img_logo,
      this.parent.CV_SIZE_W / 2,
      this.parent.CV_SIZE_H / 2
    );
    this.parent.precanvas.pop();
    this.parent.precanvas.push();
    this.alpha_2 += (this.parent.p5.deltaTime / 50.0) % 50;
    this.parent.precanvas.fill(
      255,
      170,
      0,
      this.parent.p5.abs(
        this.parent.p5.sin((this.parent.p5.TWO_PI / 50) * this.alpha_2)
      ) * 255
    );
    this.parent.precanvas.textAlign(
      this.parent.p5.CENTER,
      this.parent.p5.CENTER
    );
    this.setTextSizeStrokeWeight(25, 0, 5);
    this.parent.precanvas.text(
      "Raise both hands to Start !!",
      this.parent.CV_SIZE_W / 2,
      this.parent.CV_SIZE_H - 70
    );
    this.parent.precanvas.pop();
    if (this.parent.checkRaiseHand()) {
      this.checkingCountDown -= this.parent.p5.deltaTime;
      this.beepSoundTime -= this.parent.p5.deltaTime;
      if (this.checkingCountDown <= 2001) {
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.CV_SIZE_W,
          this.parent.CV_SIZE_H
        );
        this.parent.precanvas.push();
        this.parent.precanvas.textAlign(
          this.parent.p5.CENTER,
          this.parent.p5.CENTER
        );
        this.setTextSizeStrokeWeight(80, 0, 5);
        this.parent.precanvas.fill(255);
        this.parent.precanvas.text(
          this.parent.p5.floor(this.checkingCountDown / 1000) + 1,
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H / 2
        );
        this.parent.precanvas.pop();
        if (this.beepSoundTime <= 0) {
          this.beepSoundTime += 1000;
          //play beep sound
          this.parent.sound_beep.play();
        }
      }
      if (this.checkingCountDown < 0) {
        this.parent.sound_yes.play();
        this.checkingCountDown = 3000;
        this.beepSoundTime = 1000;
        this.parent.gameMode = "PLAY"; //Get Into Game

        this.parent.sound_start.play();
      }
    } else {
      this.checkingCountDown = 3000;
      //store prev data
      this.parent.prevLeftElbowPos = this.parent.posLeftElbow[0];
      this.parent.prevRightElbowPos = this.parent.posRightElbow[0];
    }
  }

  drawOver() {
    this.parent.precanvas.push();
    this.alpha_2 += (this.parent.p5.deltaTime / 50.0) % 20;
    this.parent.precanvas.fill(
      255,
      170,
      0,
      this.parent.p5.abs(
        this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_2)
      ) * 255
    );
    this.parent.precanvas.textAlign(
      this.parent.p5.CENTER,
      this.parent.p5.CENTER
    );
    this.setTextSizeStrokeWeight(28, 0, 5);
    this.parent.precanvas.text(
      "Raise both hands to try again !!",
      this.parent.CV_SIZE_W / 2,
      this.parent.CV_SIZE_H - 70
    );
    this.parent.precanvas.pop();
    if (this.parent.checkRaiseHand()) {
      this.checkingCountDown -= this.parent.p5.deltaTime;
      this.beepSoundTime -= this.parent.p5.deltaTime;
      if (this.checkingCountDown <= 2001) {
        this.parent.precanvas.push();
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.CV_SIZE_W,
          this.parent.CV_SIZE_H
        );
        this.parent.precanvas.textAlign(
          this.parent.p5.CENTER,
          this.parent.p5.CENTER
        );
        this.setTextSizeStrokeWeight(80, 0, 5);
        this.parent.precanvas.fill(255);
        this.parent.precanvas.text(
          this.parent.p5.floor(this.checkingCountDown / 1000) + 1,
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H / 2
        );
        this.parent.precanvas.pop();
        if (this.beepSoundTime <= 0) {
          this.beepSoundTime += 1000;
          //play beep sound
          this.parent.sound_beep.play();
        }
      }
      if (this.checkingCountDown < 0) {
        this.checkingCountDown = 3000;
        this.parent.sound_yes.play();
        //------------------
        //RESET
        this.parent.HP = 5;
        this.parent.SCORE = 0;
        this.parent.boxes = [];
        this.releasebox = this.parent.INITIAL_RELEASE_TIME;
        //------------------
        this.beepSoundTime = 1000;
        this.parent.gameMode = "PLAY"; //Get Into Game
        this.parent.sound_start.play();
      }
    } else {
      this.parent.precanvas.push();
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.parent.precanvas.fill(255, 234, 0);
      this.setTextSizeStrokeWeight(40, 0, 5);
      this.parent.precanvas.text(
        "GAME OVER",
        this.parent.CV_SIZE_W / 2,
        this.parent.CV_SIZE_H / 2
      );
      this.parent.precanvas.pop();
      this.checkingCountDown = 3000;
      //store prev data
      this.parent.prevLeftElbowPos = this.parent.posLeftElbow[0];
      this.parent.prevRightElbowPos = this.parent.posRightElbow[0];
    }
  }

  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.parent.precanvas.textSize(_size);
    this.parent.precanvas.stroke(_stroke);
    this.parent.precanvas.strokeWeight(_weight);
  }
}
//===============================
// UI_Calibrate
//===============================
class UI_Calibrate {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.calibrateStep = "step1";
    this.checkingCountDown = 3000;
    this.beepSoundTime = 1000; //When countdown, beep every 1 sec.
  }

  draw() {
    if (this.parent.gameMode == "SETUP") {
      this.parent.precanvas.push();
      this.drawSetupText(); //setup text & image
      this.parent.precanvas.pop();
    }
  }

  drawSetupText() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(
      this.parent.img_mask,
      0,
      0,
      this.parent.CV_SIZE_W,
      this.parent.CV_SIZE_H
    );
    this.parent.precanvas.fill(255);
    this.parent.precanvas.rect(
      20,
      this.parent.CV_SIZE_H - 120,
      this.parent.CV_SIZE_W - 40,
      100,
      15
    );
    //----------------------------------
    // STEP 1
    // check if user raise hand
    if (this.calibrateStep == "step1") {
      this.parent.precanvas.fill(255, 170, 0);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(25, 0, 5);
      if (this.checkingCountDown >= 2001) {
        this.parent.precanvas.text(
          "stand 2 m. from camera and raise both hands",
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H - 70
        );
      } else {
        //start count down
        this.parent.precanvas.text(
          "Stay still (" +
            (this.parent.p5.int(this.checkingCountDown / 1000) + 1) +
            " sec.)",
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H - 70
        );
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.CV_SIZE_W,
          this.parent.CV_SIZE_H
        );
        this.beepSoundTime -= this.parent.p5.deltaTime;
        if (this.beepSoundTime <= 0) {
          this.beepSoundTime += 1000;
          //play beep sound
          this.parent.sound_beep.play();
        }
      }
      this.parent.precanvas.image(
        this.parent.img_step1,
        20,
        this.parent.CV_SIZE_H - 120 - 231,
        263,
        231
      );
      this.ratio_w =
        this.parent.canvas_w / this.parent.inElement.inElement.videoWidth;
      this.ratio_h =
        this.parent.canvas_h / this.parent.inElement.inElement.videoHeight;
      this.drawElbowMarker(); //draw marker at elbow
      this.drawNoseMarker();
      if (this.parent.checkRaiseHand()) {
        this.checkingCountDown -= this.parent.p5.deltaTime;
        if (this.checkingCountDown < 0) {
          this.parent.sound_yes.play();
          //******************
          //save calibrated value for raise hand angle
          //MIN_L_ANGLE,MIN_R_ANGLE,MAX_L_ANGLE,MAX_R_ANGLE
          this.parent.MAX_L_ANGLE = this.parent.p5.int(
            this.parent.degree(
              this.parent.posNose[0],
              this.parent.posLeftElbow[0]
            )
          );
          this.parent.MIN_R_ANGLE = this.parent.p5.int(
            this.parent.degree(
              this.parent.posNose[0],
              this.parent.posRightElbow[0]
            )
          );
          //console.log('MAX_L_ANGLE' + MAX_L_ANGLE);
          //console.log('MIN_R_ANGLE' + MIN_R_ANGLE);
          this.checkingCountDown = 3000;
          this.beepSoundTime = 1000;
          this.calibrateStep = "step2"; //go to next step
        }
      } else {
        this.checkingCountDown = 3000;
        //store prev data
        this.parent.prevLeftElbowPos = this.parent.posLeftElbow[0];
        this.parent.prevRightElbowPos = this.parent.posRightElbow[0];
      }
      //----------------------------------
      // STEP 2
      //check for lower pos of elbow
    } else if (this.calibrateStep == "step2") {
      this.parent.precanvas.fill(255, 170, 0);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(25, 0, 5);
      if (this.checkingCountDown >= 2001) {
        this.parent.precanvas.text(
          "Lower both elbows",
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H - 70
        );
      } else {
        //start count down
        this.parent.precanvas.text(
          "Stay still (" +
            (this.parent.p5.int(this.checkingCountDown / 1000) + 1) +
            " sec.)",
          this.parent.CV_SIZE_W / 2,
          this.parent.CV_SIZE_H - 70
        );
        this.beepSoundTime -= this.parent.p5.deltaTime;
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.CV_SIZE_W,
          this.parent.CV_SIZE_H
        );
        if (this.beepSoundTime <= 0) {
          this.beepSoundTime += 1000;
          //play beep sound
          this.parent.sound_beep.play();
        }
      }
      this.parent.precanvas.image(
        this.parent.img_step2,
        20,
        this.parent.CV_SIZE_H - 120 - 225,
        228,
        225
      );
      this.ratio_w =
        this.parent.canvas_w / this.parent.inElement.inElement.videoWidth;
      this.ratio_h =
        this.parent.canvas_h / this.parent.inElement.inElement.videoHeight;
      this.drawElbowMarker(); //draw marker at elbow
      this.drawWristMarker();
      if (this.parent.checkLowerHand()) {
        this.checkingCountDown -= this.parent.p5.deltaTime;
        if (this.checkingCountDown < 0) {
          this.parent.sound_yes.play();
          this.parent.MIN_L_ANGLE = this.parent.p5.int(
            this.parent.degree(
              this.parent.posNose[0],
              this.parent.posLeftElbow[0]
            )
          );
          this.parent.MAX_R_ANGLE = this.parent.p5.int(
            this.parent.degree(
              this.parent.posNose[0],
              this.parent.posRightElbow[0]
            )
          );
          this.checkingCountDown = 3000;
          this.beepSoundTime = 1000;
          this.parent.gameMode = "INTRO"; //Get Into Game
          this.parent.ui_game.initialRangeCalculate(); //Set upper/lower bound angle ***************************
          //play wave sound
          this.parent.sound_wave.loop();
          this.parent.sound_wave.play();
        }
      } else {
        this.checkingCountDown == 3000;
        //store prev data
        this.parent.prevLeftElbowPos = this.parent.posLeftElbow[0];
        this.parent.prevRightElbowPos = this.parent.posRightElbow[0];
      }
    }
    this.parent.precanvas.pop();
  }

  drawElbowMarker() {
    if (this.parent.posLeftElbow[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posLeftElbow[0].x * this.ratio_w,
        this.parent.posLeftElbow[0].y * this.ratio_h,
        0,
        0
      );
      this.parent.precanvas.pop();
    }
    if (this.parent.posRightElbow[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posRightElbow[0].x * this.ratio_w,
        this.parent.posRightElbow[0].y * this.ratio_h,
        0,
        0
      );
      //img_marker_red
      this.parent.precanvas.pop();
    }
  }
  drawWristMarker() {
    if (this.parent.posLeftWrist[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posLeftWrist[0].x * this.ratio_w,
        this.parent.posLeftWrist[0].y * this.ratio_h,
        0,
        0
      );
      //img_marker_red
      this.parent.precanvas.pop();
    }
    if (this.parent.posRightWrist[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posRightWrist[0].x * this.ratio_w,
        this.parent.posRightWrist[0].y * this.ratio_h,
        0,
        0
      );
      //img_marker_red
      this.parent.precanvas.pop();
    }
  }
  drawNoseMarker() {
    if (this.parent.posNose[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posNose[0].x * this.ratio_w,
        this.parent.posNose[0].y * this.ratio_h,
        0,
        0
      );
      this.parent.precanvas.stroke(255, 0, 0);
      this.parent.precanvas.strokeWeight(10);
      if (this.parent.posLeftElbow[0] != null) {
        this.parent.precanvas.line(
          this.parent.posLeftElbow[0].x * this.ratio_w,
          this.parent.posLeftElbow[0].y * this.ratio_h,
          this.parent.posNose[0].x * this.ratio_w,
          this.parent.posNose[0].y * this.ratio_h
        );
      }
      if (this.parent.posRightElbow[0] != null) {
        this.parent.precanvas.line(
          this.parent.posRightElbow[0].x * this.ratio_w,
          this.parent.posRightElbow[0].y * this.ratio_h,
          this.parent.posNose[0].x * this.ratio_w,
          this.parent.posNose[0].y * this.ratio_h
        );
      }
      this.parent.precanvas.pop();
    }
  }

  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.parent.precanvas.textSize(_size);
    this.parent.precanvas.stroke(_stroke);
    this.parent.precanvas.strokeWeight(_weight);
  }
}

module.exports = {
  mlxBoatParking,
};
