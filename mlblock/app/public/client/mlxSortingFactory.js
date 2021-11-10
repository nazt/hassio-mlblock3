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

class mlxSortingFactory extends mlxElementLocakableOutput {
  constructor(mlx) {
    //mlx element
    super(mlx);
    this.title = "SortingFactory";
    this.category = "Output";
    this.type = "SortingFactoryGame";
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

    //game value
    //this.video;
    this.poseNet;
    this.poses = [];
    this.skeletons = [];
    this.posNose = [];
    this.posLeftWrist = [];
    this.posRightWrist = [];
    this.posLeftElbow = [];
    this.posRightElbow = [];
    this.prevLeftElbowPos = null;
    this.prevRightElbowPos = null;
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
    this.BOX_WH = 54;
    //image
    this.img_logo;
    this.img_marker_red;
    this.img_marker;
    this.img_mask;
    this.img_step1;
    this.img_step2;
    this.img_building_left;
    this.img_building_right;
    this.img_heart;
    this.img_box_blue;
    this.img_box_red;
    this.img_box_yellow;
    this.img_right;
    this.img_wrong;
    this.img_heart;
    this.img_heart_empty;
    //UI
    this.ui_calibrate;
    this.ui_game;
    this.boxes = [];
    this.font; //font
    //sound
    this.sound_beep;
    this.sound_changepoint;
    this.sound_ok;
    this.sound_falldown;
    this.sound_correct;
    this.sound_movebridge;
    this.sound_wrong;
    this.sound_over;
    this.sound_start;
    this.sound_yes;
    this.sound_no;

    //internal setup
    this.preload();
    this.setup();

    //Output(required)
    this.output = this.canvas;
    this.ready = true;
  }

  preload() {
    this.img_logo = this.p5.loadImage("assets_game/mlxSortingFactory/logo.png");
    this.img_marker_red = this.p5.loadImage(
      "assets_game/mlxSortingFactory/p_marker_red.png"
    );
    this.img_marker = this.p5.loadImage(
      "assets_game/mlxSortingFactory/p_marker_black.png"
    );
    this.img_mask = this.p5.loadImage("assets_game/mlxSortingFactory/mask.png");
    this.img_step1 = this.p5.loadImage(
      "assets_game/mlxSortingFactory/step2.png"
    );
    this.img_step2 = this.p5.loadImage(
      "assets_game/mlxSortingFactory/step3.png"
    );
    this.img_building_left = this.p5.loadImage(
      "assets_game/mlxSortingFactory/factory_left.png"
    );
    this.img_building_right = this.p5.loadImage(
      "assets_game/mlxSortingFactory/factory_right.png"
    );
    this.img_heart = this.p5.loadImage(
      "assets_game/mlxSortingFactory/heart.png"
    );
    this.img_box_blue = this.p5.loadImage(
      "assets_game/mlxSortingFactory/box_blue.png"
    );
    this.img_box_red = this.p5.loadImage(
      "assets_game/mlxSortingFactory/box_red.png"
    );
    this.img_box_yellow = this.p5.loadImage(
      "assets_game/mlxSortingFactory/box_yellow.png"
    );
    this.img_right = this.p5.loadImage(
      "assets_game/mlxSortingFactory/box_right.png"
    );
    this.img_wrong = this.p5.loadImage(
      "assets_game/mlxSortingFactory/box_wrong.png"
    );
    this.img_heart = this.p5.loadImage(
      "assets_game/mlxSortingFactory/heart.png"
    );
    this.img_heart_empty = this.p5.loadImage(
      "assets_game/mlxSortingFactory/heart_empty.png"
    );
    this.img_waiting = this.p5.loadImage(
      "assets_game/mlxSortingFactory/waittoconnect.png"
    );
    this.font = this.p5.loadFont(
      "assets_game/mlxSortingFactory/Anakotmai-Bold.ttf"
    );
    this.sound_beep = this.p5.loadSound(
      "assets_game/mlxSortingFactory/beep.mp3"
    );
    this.sound_changepoint = this.p5.loadSound(
      "assets_game/mlxSortingFactory/beep.mp3"
    );
    this.sound_ok = this.p5.loadSound("assets_game/mlxSortingFactory/ok.mp3");
    this.sound_falldown = this.p5.loadSound(
      "assets_game/mlxSortingFactory/falldown.mp3"
    );
    this.sound_correct = this.p5.loadSound(
      "assets_game/mlxSortingFactory/correct.mp3"
    );
    this.sound_movebridge = this.p5.loadSound(
      "assets_game/mlxSortingFactory/movebridge.mp3"
    );
    this.sound_wrong = this.p5.loadSound(
      "assets_game/mlxSortingFactory/wrong.mp3"
    );
    this.sound_over = this.p5.loadSound(
      "assets_game/mlxSortingFactory/gameover.mp3"
    );
    this.sound_start = this.p5.loadSound(
      "assets_game/mlxSortingFactory/start.mp3"
    );
    this.sound_yes = this.p5.loadSound("assets_game/mlxSortingFactory/yes.mp3");
    this.sound_no = this.p5.loadSound("assets_game/mlxSortingFactory/no.mp3");
  }

  setup() {
    //createCanvas(this.canvas_w, this.canvas_h);
    //this.precanvas = createGraphics(this.canvas_w, this.canvas_h);
    //maximizeCanvas();
    //this.video = this.p5.createCapture(this.p5.VIDEO);
    //this.video.size(this.canvas_w, this.canvas_h);
    //this.pixelDensity(1);
    // Create a new poseNet method with a single detection
    /*this.poseNet = ml5.poseNet(this.video, this.modelReady);
    this.poseNet.on('pose', function(results) {
      //this.poses = results;
      getKeypoints(results)
    });*/
    // Hide the video element, and just show the canvas
    //this.video.hide();
    //Game Setup
    this.ui_calibrate = new SortingFactory_UI_Calibrate(this);
    this.ui_game = new SortingFactory_UI_Game(this);
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
      this.prevRightElbowPos == null ||
      this.prevRightElbowPos == null
    )
      return false;
    //check if user raise hand
    if (
      this.degree(this.posNose[0], this.posRightElbow[0]) >= 300 &&
      this.degree(this.posNose[0], this.posRightElbow[0]) <= 380 &&
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
      this.posLeftWrist[0] == null ||
      this.posRightWrist[0] == null ||
      this.posRightElbow[0] == null ||
      this.posLeftElbow[0] == null ||
      this.posNose[0] == null ||
      this.prevRightElbowPos == null ||
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
}
//===============================
// Box
//===============================
class SortingFactoryBox {
  constructor(platform, target, mlxParent) {
    this.parent = mlxParent;
    this.xPos = [232, 633];
    this.yPos = [190, 326, 460];
    this.originPlatform = platform;
    this.targetPlatform = target; //yellow,red,blue
    this.imageList = [
      this.parent.img_box_yellow,
      this.parent.img_box_red,
      this.parent.img_box_blue,
    ];
    this.myImage = this.imageList[this.targetPlatform];
    this.x = 0;
    this.y = 0; //use only when drop
    this.onBridge = false;
    this.onTarget = false;
    this.drop = false;
    this.bridgeWidth = this.xPos[1] - this.xPos[0];
    this.checked = false;
    this.correct = 0;
    this.delete = false;
  }

  draw() {
    if (!this.delete) {
      this.x += this.parent.p5.floor(
        this.parent.SPEED * (this.parent.p5.deltaTime / 1000)
      );
      if (this.x > this.parent.canvas_w + this.parent.BOX_WH / 2)
        this.delete = true;
      //img_box_blue, img_box_red, img_box_yellow
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CORNER);
      if (this.correct == 1) this.myImage = this.parent.img_right;
      else if (this.correct == 2) this.myImage = this.parent.img_wrong;
      if (!this.drop) {
        if (this.x < this.xPos[0]) {
          //on origin platform
          this.parent.precanvas.translate(
            this.x,
            this.yPos[this.originPlatform]
          );
          this.parent.precanvas.image(
            this.myImage,
            -this.parent.BOX_WH / 2,
            -this.parent.BOX_WH,
            this.parent.BOX_WH,
            this.parent.BOX_WH
          );
        } else if (this.x >= this.xPos[0] && !this.onBridge && !this.onTarget) {
          //calculate if bridge is on current origin platform
          if (this.parent.ui_game.selectedPointL == this.originPlatform) {
            this.onBridge = true;
            this.parent.precanvas.translate(this.x, this.calculateHeight());
            this.parent.precanvas.image(
              this.myImage,
              -this.parent.BOX_WH / 2,
              -this.parent.BOX_WH,
              this.parent.BOX_WH,
              this.parent.BOX_WH
            );
          } else {
            //box is missing the bridge
            this.drop = true;
            this.parent.sound_falldown.play();
            this.y = this.yPos[this.originPlatform];
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
            -this.parent.BOX_WH / 2,
            -this.parent.BOX_WH,
            this.parent.BOX_WH,
            this.parent.BOX_WH
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
            -this.parent.BOX_WH / 2,
            -this.parent.BOX_WH,
            this.parent.BOX_WH,
            this.parent.BOX_WH
          );
          //check if on the right platform
          if (
            !this.checked &&
            this.x < this.parent.canvas_w - 70 &&
            this.targetPlatform == this.originPlatform
          ) {
            //correct platform
            this.correct = 1;
            this.parent.sound_correct.play();
            this.parent.SCORE++;
            this.checked = true;
          } else if (
            !this.checked &&
            this.x < this.parent.canvas_w - 70 &&
            this.targetPlatform != this.originPlatform
          ) {
            //wrong platform
            this.parent.sound_wrong.play();
            this.correct = 2;
            this.parent.HP--;
            if (this.parentHP <= 0) {
              //Game Over
              this.parent.gameMode = "OVER";
              this.parent.sound_over.play();
            }
            this.checked = true;
          }
        }
      }
      if (this.drop) {
        // fall down
        this.parent.precanvas.translate(this.x, this.y);
        this.y += this.y * 0.02;
        this.parent.precanvas.imageMode(this.parent.p5.CORNER);
        this.parent.precanvas.image(
          this.myImage,
          -this.parent.BOX_WH / 2,
          -this.parent.BOX_WH,
          this.parent.BOX_WH,
          this.parent.BOX_WH
        );
        if (this.y > this.parent.canvas_h + this.parent.BOX_WH / 2)
          this.delete = true;
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
class SortingFactory_UI_Game {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.leftPos = [
      this.parent.p5.createVector(232, 190),
      this.parent.p5.createVector(232, 326),
      this.parent.p5.createVector(232, 460),
    ]; //top,mid,bottom
    this.rightPos = [
      this.parent.p5.createVector(633, 190),
      this.parent.p5.createVector(633, 326),
      this.parent.p5.createVector(633, 460),
    ]; //top,mid,bottom
    (this.previousPointL = 2), (this.previousPointR = 2);
    //this.selectedPointL,this.selectedPointR;	//display point
    //this.upperL,this.upperR,this.lowerL,this.lowerR	// bound for calculation
    this.alpha_2 = 0;
    this.checkingCountDown = 3000;
    this.beepSoundTime = 1000;
    this.degreeL = null;
    this.degreeR = null;

    this.nextBox = new SortingFactoryBox(
      this.parent.p5.random([0, 1, 2]),
      this.parent.p5.random([0, 1, 2]),
      this.parent
    );
    this.releasebox = this.parent.INITIAL_RELEASE_TIME;
  }

  /*img_marker, img_mask, img_building_left,img_building_right,img_heart,img_box_blue,img_box_red,img_box_yellow;*/
  draw() {
    this.getCurrentAngle();
    this.calculateCurrentSelectedPoint();
    this.drawBackground();
    //score & heart
    this.parent.precanvas.push();
    this.parent.precanvas.fill(255, 170, 0);
    this.parent.precanvas.textAlign(this.parent.p5.LEFT, this.parent.p5.CENTER);
    this.setTextSizeStrokeWeight(40, 0, 5);
    this.parent.precanvas.text("SCORE: " + this.parent.SCORE, 20, 30);
    for (var i = 0; i < 5; i++) {
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      if (i < this.parent.HP)
        this.parent.precanvas.image(
          this.parent.img_heart,
          this.parent.canvas_w - 30 - 54 * i,
          28
        );
      else
        this.parent.precanvas.image(
          this.parent.img_heart_empty,
          this.parent.canvas_w - 30 - 54 * i,
          28
        );
    }
    this.parent.precanvas.pop();
    //draw bridge line between selected point
    this.parent.precanvas.push();
    this.parent.precanvas.stroke(156, 129, 76);
    this.parent.precanvas.strokeWeight(12);
    this.parent.precanvas.line(
      this.leftPos[this.selectedPointL].x,
      this.leftPos[this.selectedPointL].y,
      this.rightPos[this.selectedPointR].x,
      this.rightPos[this.selectedPointR].y
    );
    this.parent.precanvas.pop();
    this.drawMarkerPoint();
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
        if (this.parent.boxes.length == 0) {
          this.releasebox = this.parent.INITIAL_RELEASE_TIME;
          this.parent.boxes[this.parent.boxes.length] = this.nextBox;
          this.nextBox = new SortingFactoryBox(
            this.parent.p5.random([0, 1, 2]),
            this.parent.p5.random([0, 1, 2]),
            this.parent
          );
        } else {
          var choice = this.parent.p5.random([0, 1, 2]);
          if (choice == 1) {
            //samebox ,same platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_1 -
              850 * ((this.parent.SPEED - 65) / 50);
            this.parent.boxes[this.parent.boxes.length] = this.nextBox;
            this.nextBox = new SortingFactoryBox(
              this.parent.boxes[this.parent.boxes.length - 1].originPlatform,
              this.parent.boxes[this.parent.boxes.length - 1].targetPlatform,
              this.parent
            );
          } else if (choice == 2) {
            //diff box ,random platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_2 -
              1200 * ((this.parent.SPEED - 65) / 50);
            this.parent.boxes[this.parent.boxes.length] = this.nextBox;
            var target = this.parent.p5.random([0, 1, 2]);
            var platform = this.parent.p5.random([0, 1, 2]);
            while (
              this.parent.boxes[this.parent.boxes.length - 1].originPlatform ==
              platform
            ) {
              target = this.parent.p5.random([0, 1, 2]);
              platform = this.parent.p5.random([0, 1, 2]);
            }
            this.nextBox = new SortingFactoryBox(
              platform,
              this.parent.p5.random([0, 1, 2]),
              this.parent
            );
          } else {
            //diff box , diff platform
            this.releasebox =
              this.parent.RELESEBOX_CONDITION_3 -
              1500 * ((this.parent.SPEED - 65) / 50);
            this.parent.boxes[this.parent.boxes.length] = this.nextBox;
            var target = this.parent.p5.random([0, 1, 2]);
            var platform = this.parent.p5.random([0, 1, 2]);
            while (
              this.parent.boxes[this.parent.boxes.length - 1].originPlatform ==
                platform ||
              this.parent.boxes[this.parent.boxes.length - 1].targetPlatform ==
                target
            ) {
              target = this.parent.p5.random([0, 1, 2]);
              platform = this.parent.p5.random([0, 1, 2]);
            }
            this.nextBox = new SortingFactoryBox(platform, target, this.parent);
          }
        }
        //--------------------------
      }
      for (var i = 0; i < this.parent.boxes.length; i++) {
        this.parent.boxes[i].draw();
      }
    } else if (this.parent.gameMode == "OVER") {
      this.drawOver();
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
    //console.log('upperL' + this.upperL);
    //console.log('upperR' + this.upperR);
    //console.log('lowerL' + this.lowerL);
    //console.log('lowerR' + this.lowerR);
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
    //console.log('this.degreeL' + this.degreeL);
    //console.log('this.degreeR' + this.degreeR);
  }

  drawBackground() {
    //game background
    this.parent.precanvas.push();
    this.parent.precanvas.fill(0, 200);
    this.parent.precanvas.rect(
      0,
      0,
      this.parent.canvas_w,
      this.parent.precanvas.canvas_h
    );
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(this.parent.img_building_left, 0, 43, 231, 516);
    this.parent.precanvas.image(
      this.parent.img_building_right,
      630,
      43,
      223,
      516
    );
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
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(
      this.parent.img_logo,
      0,
      0,
      this.parent.canvas_w,
      this.parent.canvas_h
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
    this.setTextSizeStrokeWeight(35, 0, 5);
    this.parent.precanvas.text(
      "raise both hands to start !!",
      this.parent.canvas_w / 2,
      this.parent.canvas_h - 70
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
          this.parent.canvas_w,
          this.parent.vanvas_h
        );
        this.parent.precanvas.push();
        this.parent.precanvas.textAlign(
          this.parent.p5.CENTER,
          this.parent.p5.CENTER
        );
        this.setTextSizeStrokeWeight(100, 0, 5);
        this.parent.precanvas.fill(255);
        this.parent.precanvas.text(
          this.parent.p5.floor(this.checkingCountDown / 1000) + 1,
          this.parent.canvas_w / 2,
          this.parent.canvas_h / 2
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
    this.setTextSizeStrokeWeight(35, 0, 5);
    this.parent.precanvas.text(
      "raise both hands to restart!!",
      this.parent.canvas_w / 2,
      this.parent.canvas_h - 70
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
          this.parent.canvas_w,
          this.parent.canvas_h
        );
        this.parent.precanvas.textAlign(
          this.parent.p5.CENTER,
          this.parent.p5.CENTER
        );
        this.setTextSizeStrokeWeight(100, 0, 5);
        this.parent.precanvas.fill(255);
        this.parent.precanvas.text(
          this.parent.p5.floor(this.checkingCountDown / 1000) + 1,
          this.parent.canvas_w / 2,
          this.parent.canvas_h / 2
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
        (this.parent.HP = 5), (this.parent.SCORE = 0);
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
      this.setTextSizeStrokeWeight(50, 0, 5);
      this.parent.precanvas.text(
        "GAME OVER",
        this.parent.canvas_w / 2,
        this.parent.canvas_h / 2
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
class SortingFactory_UI_Calibrate {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.calibrateStep = "step1";
    this.checkingCountDown = 3000;
    this.beepSoundTime = 1000; //When countdown, beep every 1 sec.
  }
  draw() {
    this.parent.precanvas.push();
    if (this.parent.gameMode == "SETUP") {
      this.parent.precanvas.push();
      this.drawSetupText(); //setup text & image
      this.parent.precanvas.pop();
    }
    this.parent.precanvas.pop();
  }
  drawSetupText() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CORNER);
    this.parent.precanvas.image(
      this.parent.img_mask,
      0,
      0,
      this.parent.canvas_w,
      this.parent.canvas_h
    );
    this.parent.precanvas.fill(255);
    this.parent.precanvas.rect(
      20,
      this.parent.canvas_h - 120,
      this.parent.canvas_w - 40,
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
      this.setTextSizeStrokeWeight(35, 0, 5);
      if (this.checkingCountDown >= 2001) {
        this.parent.precanvas.text(
          "stand 2 meter away and raise both hands",
          this.parent.canvas_w / 2,
          this.parent.canvas_h - 70
        );
      } else {
        //start count down
        this.parent.precanvas.text(
          "Stay Still(" +
            (this.parent.p5.int(this.checkingCountDown / 1000) + 1) +
            " s.)",
          this.parent.canvas_w / 2,
          this.parent.canvas_h - 70
        );
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.canvas_w,
          this.parent.canvas_h
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
        this.parent.canvas_h - 120 - 231,
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
    }
    //----------------------------------
    // STEP 2
    //check for lower pos of elbow
    else if (this.calibrateStep == "step2") {
      this.parent.precanvas.fill(255, 170, 0);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(35, 0, 5);
      if (this.checkingCountDown >= 2001) {
        this.parent.precanvas.text(
          "lower both elbows",
          this.parent.canvas_w / 2,
          this.parent.canvas_h - 70
        );
      } else {
        //start count down
        this.parent.precanvas.text(
          "Stay Still(" +
            (this.parent.p5.int(this.checkingCountDown / 1000) + 1) +
            " s.)",
          this.parent.canvas_w / 2,
          this.parent.canvas_h - 70
        );
        this.beepSoundTime -= this.parent.p5.deltaTime;
        this.parent.precanvas.fill(3, 143, 0, 60);
        this.parent.precanvas.rect(
          0,
          0,
          this.parent.canvas_w,
          this.parent.canvas_h
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
        this.parent.canvas_h - 120 - 225,
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
          //console.log('MAX_L_ANGLE' + MAX_L_ANGLE);
          //console.log('MAX_R_ANGLE' + MAX_R_ANGLE);
          //console.log('MIN_L_ANGLE' + MIN_L_ANGLE);
          //console.log('MIN_R_ANGLE' + MIN_R_ANGLE);
          //reset game
          (this.parent.HP = 5), (this.parent.SCORE = 0);
          this.parent.boxes = [];
          this.releasebox = this.parent.INITIAL_RELEASE_TIME;
          //next state
          this.checkingCountDown = 3000;
          this.beepSoundTime = 1000;
          this.parent.gameMode = "INTRO"; //Get Into Game
          this.parent.ui_game.initialRangeCalculate(); //Set upper/lower bound angle ***************************
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
      //console.log("this.parent.posLeftElbow[0]||"+this.parent.posLeftElbow[0].x+"||"+this.parent.posLeftElbow[0].y);
      //console.log("this.parent.posLeftElbow[R]||"+(this.parent.posLeftElbow[0].x)*this.ratio_w+"||"+(this.parent.posLeftElbow[0].y)*this.ratio_h);
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posLeftElbow[0].x * this.ratio_w,
        this.parent.posLeftElbow[0].y * this.ratio_h
      );
      //img_marker_red
      this.parent.precanvas.pop();
    }
    if (this.parent.posRightElbow[0] != null) {
      this.parent.precanvas.push();
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_marker_red,
        this.parent.posRightElbow[0].x * this.ratio_w,
        this.parent.posRightElbow[0].y * this.ratio_h
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
        this.parent.posLeftWrist[0].y * this.ratio_h
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
        this.parent.posRightWrist[0].y * this.ratio_h
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
        this.parent.posNose[0].y * this.ratio_h
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
  mlxSortingFactory,
};
