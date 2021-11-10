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

function isMobileMlxNoseArtist() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}

class mlxNoseArtistMobile extends mlxElementLocakableOutput {
  constructor(mlx) {
    //mlx element
    super(mlx);
    this.title = "Nose Artist";
    this.category = "Output";
    this.type = "NoseArtistMobileGame";
    this.inType = "posenet";
    this.outType = "results";
    this.needMouse = false;
    this.score = 0;
    this.canvasSize = 854;

    this.poses = [];
    this.skeletons = [];
    this.pg;
    this.noseX = 0;
    this.noseY = 0;
    this.pNoseX;
    this.pNoseY;
    this.isDraw = false;
    this.posNose;
    //Game Value
    this.gameMode = "WELCOME"; //'WELCOME','LEVEL','PLAY','RESULT'
    this.gameLevel;
    this.BUTTON_ACTIVATED_TIME = 1200.0; //1.2sec
    this.DOTPOINT_ACTIVATED_TIME = 800.0; //0.8sec
    this.hp;
    //-------------------------------------------
    //PROMO Text
    this.CAPTURE_IMAGE = true;
    this.displayText = [
      "1.ควรใส่หน้ากากอนามัยเพื่อป้องกัน",
      "2.หมั่นล้างมือหรือเช็ดด้วยแอลกอฮอล์",
      "3.งดเดินทางไปยังพื้นที่เสี่ยงโรคระบาด",
      "4.ไม่ใช้สิ่งของร่วมกับผู้อื่น",
      "5.ถ้ามีอาการรีบไปพบแพทย์ทันที!",
    ];
    this.cornerText = "เกมประกอบบทเรียน AI&IoT Junior";
    this.GAMENAME = "Nose Artist";
    this.OPEN_WEB_ON_FINISH = "";
    this.FINISH_MESSAGE = "ยินดีด้วย คุณวาดรูปสำเร็จแล้ว!!";
    //-------------------------------------------
    //display size
    this.CV_SIZE_W = 450;
    this.CV_SIZE_H = 732;
    /*
		this.CV_SIZE_W = 854;
		this.CV_SIZE_H = 560;
		*/
    this.BG_SIZE_W = 450;
    this.BG_SIZE_H = 400;
    this.fullscreen = false; //internal usage
    this.fullscreen_scale = 1; //internal usage
    this.w = this.CV_SIZE_W / 2 + this.mlx.mlxPadding * 2; //size including frame
    this.h =
      this.CV_SIZE_H / 2 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2; //size including frame
    this.fps = 15;
    this.createElementMenu();
    this.offScreenX = this.mlx.mlxPadding;
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.offScreen = this.mlx.createCanvas(
      this,
      this.offScreenX,
      this.offScreenY,
      this.CV_SIZE_W / 2,
      this.CV_SIZE_H / 2
    );
    this.canvas = this.offScreen.offScreen;
    this.precanvas = this.p5.createGraphics(this.CV_SIZE_W, this.CV_SIZE_H);

    //image
    this.img_bg;
    this.img_pointer;
    this.img_logo;
    this.img_btbbig_n;
    this.img_btbbig_d;
    this.img_round_n;
    this.img_round_d;
    this.img_point;
    this.img_doctor;
    this.img_howto1;
    this.img_howto2;
    this.img_howto3;
    this.img_win;
    this.img_lose;
    this.img_virus = [];
    this.img_virus_1;
    this.img_virus_2;
    this.img_virus_3;
    this.font;
    this.ui; //UI
    this.pointer; //Pointer
    //Sound
    this.sound_button_activated;
    this.sound_button_touch;
    this.sound_button_discontact; //button sound
    //this.sound_opening;
    this.sound_contact_point;
    this.sound_levelcomplete;
    this.sound_virus;
    this.sound_sneeze;
    this.sound_virus_hit;
    //Drawing tool
    this.levelPos = [];
    this.levelPointCount;
    this.levelNotDrawLint;
    this.levelNotDrawLintCount;
    this.levelFinish = false;
    this.levelOver = false;
    //LevelPrototypeValue
    /*
		this.level1Sequence = [151, 433, 662, 183, 662, 432, 151, 182, 151, 433, 662, 432, 662, 183, 151, 182, 412, 77, 662, 183, 537, 130, 537, 54, 621, 54, 620, 165];
		this.level1PointCount = 14;
		this.level1NotDrawLint = [6, 10];
		this.level1NotDrawLintCount = 2;
		*/
    //this.level1Sequence = [201, 209, 648, 208, 286, 470, 424, 45, 563, 470, 201, 209];
    this.level1Sequence = [
      26, 312, 410, 312, 50, 601, 222, 167, 393, 601, 26, 312,
    ];
    this.level1PointCount = 6;
    this.level1NotDrawLint = [];
    this.level1NotDrawLintCount = 0;

    this.level2Sequence = [
      30, 346, 70, 241, 165, 177, 278, 180, 367, 250, 398, 361, 360, 469, 266,
      530, 153, 527, 62, 453, 30, 346, 129, 407, 159, 436, 210, 450, 261, 436,
      291, 406, 159, 303, 159, 255, 261, 255, 261, 303,
    ];
    this.level2PointCount = 20;
    this.level2NotDrawLint = [11, 16, 18];
    this.level2NotDrawLintCount = 3;

    this.level3Sequence = [
      58, 611, 58, 409, 58, 204, 387, 409, 58, 611, 387, 611, 387, 409, 387,
      204, 58, 409, 387, 611, 387, 409, 58, 409, 58, 204, 387, 204, 255, 60, 58,
      204, 109, 160, 109, 78, 159, 78, 159, 117,
    ];
    this.level3PointCount = 20;
    this.level3NotDrawLint = [10, 12, 16];
    this.level3NotDrawLintCount = 3;

    //Virus ball
    this.numBalls = 10;
    this.spring = 0.05;
    this.gravity = 0.0;
    this.friction = -0.9;
    this.virusBalls = [];
    //PointValue
    this.currentPoint;
    this.cameraMode = false;

    //internal setup
    this.preload();
    this.setup();

    //Output(required)
    this.output = this.canvas;
    this.ready = true;
  }

  preload() {
    this.img_bg = this.p5.loadImage("assets_game/mlxNoseArtist/img_bg.png");
    this.img_pointer = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_pointer.png"
    );
    this.img_logo = this.p5.loadImage("assets_game/mlxNoseArtist/logo.png");

    this.img_btflip_n = this.p5.loadImage(
      "assets_game/mlxNoseArtist/flipcamera_bt_n.png"
    );
    this.img_btflip_d = this.p5.loadImage(
      "assets_game/mlxNoseArtist/flipcamera_bt_d.png"
    );

    this.img_btbbig_n = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_btbig_n.png"
    );
    this.img_btbbig_d = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_btbig_d.png"
    );
    this.img_round_n = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_round_n.png"
    );
    this.img_round_d = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_round_d.png"
    );
    this.img_howto1 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_howto_1.png"
    );
    this.img_howto2 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_howto_2.png"
    );
    this.img_howto3 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_howto_3.png"
    );
    this.img_point = this.p5.loadImage(
      "assets_game/mlxNoseArtist/img_pointer_w.png"
    );
    this.img_win = this.p5.loadImage("assets_game/mlxNoseArtist/img_win.png");
    this.img_lose = this.p5.loadImage("assets_game/mlxNoseArtist/img_lose.png");
    this.img_doctor = this.p5.loadImage("assets_game/mlxNoseArtist/doctor.png");
    this.img_waiting = this.p5.loadImage(
      "assets_game/mlxNoseArtist/waiting_mobile.png"
    );
    this.font = this.p5.loadFont(
      "assets_game/mlxNoseArtist/JSJindara-Bold.otf"
    );
    this.sound_button_activated = this.p5.loadSound(
      "assets_game/mlxNoseArtist/button_activated.mp3"
    );
    this.sound_button_touch = this.p5.loadSound(
      "assets_game/mlxNoseArtist/button_touch.mp3"
    );
    this.sound_button_discontact = this.p5.loadSound(
      "assets_game/mlxNoseArtist/button_discontact.mp3"
    );
    this.sound_contact_point = this.p5.loadSound(
      "assets_game/mlxNoseArtist/contact_point.mp3"
    );
    //this.sound_opening = this.p5.loadSound('assets_game/mlxNoseArtist/opening.mp3');
    this.sound_levelcomplete = this.p5.loadSound(
      "assets_game/mlxNoseArtist/levelcomplete.mp3"
    );
    this.sound_sneeze = this.p5.loadSound(
      "assets_game/mlxNoseArtist/sneeze.mp3"
    );
    this.sound_virus_hit = this.p5.loadSound(
      "assets_game/mlxNoseArtist/contact.mp3"
    );
    this.sound_virus = this.p5.loadSound("assets_game/mlxNoseArtist/virus.mp3");
    this.img_virus_1 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/virus5.png"
    );
    this.img_virus_2 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/virus6.png"
    );
    this.img_virus_3 = this.p5.loadImage(
      "assets_game/mlxNoseArtist/virus7.png"
    );
  }

  setup() {
    //frameRate(30);
    //createCanvas(CV_SIZE_W, CV_SIZE_H);
    // maximizeCanvas();
    //this.video = createCapture(VIDEO);
    //this.video.size(width, height);
    //pixelDensity(1);
    this.pg = this.p5.createGraphics(this.CV_SIZE_W, this.CV_SIZE_H);
    // Create a new poseNet method with a single detection
    /*poseNet = ml5.poseNet(video, modelReady);
	  poseNet.on('pose', function(results) {
		poses = results;
	  });*/
    // Hide the video element, and just show the canvas
    //video.hide();

    //Game Setup
    this.ui = new noseArtistMobileUI(this);
    this.pointer = new noseArtistMobilePointer(this);
    //if( this.sound_opening)this.sound_opening.play();

    this.img_virus = [this.img_virus_1, this.img_virus_2, this.img_virus_3];
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
    //console.log("p5:"+this.p5.width+"||"+this.p5.height);
    if (
      this.inElement != null &&
      this.inElement.inElement != null &&
      this.inElement.inElement.videoCapture != null
    ) {
      if (!this.gameConnected) {
        //reset game
        this.gameMode = "WELCOME";
        this.gameConnected = true;
      }
      this.precanvas.push();
      if (this.inElement.inElement.flip) {
        this.precanvas.scale(-1, 1); //flip video
        this.precanvas.translate(0 - this.CV_SIZE_W, 0);
      }
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.inElement.inElement.videoCapture,
        0,
        0,
        this.CV_SIZE_W,
        this.CV_SIZE_H
      );
      this.precanvas.image(this.pg, 0, 0, this.CV_SIZE_W, this.CV_SIZE_H);
      this.precanvas.pop();
      //Game draw
      this.precanvas.push();

      this.posNose = this.p5.createVector(
        this.CV_SIZE_W - this.noseX,
        this.noseY
      ); //current nose position Vector(flipped video)
      this.ui.draw(); //draw
      this.pointer.draw();
      this.precanvas.pop();
    } else {
      //no video input
      this.precanvas.push();
      this.precanvas.imageMode(this.p5.CORNER);
      this.precanvas.image(
        this.img_waiting,
        0,
        0,
        this.CV_SIZE_W,
        this.CV_SIZE_H
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
    this.canvas.resizeCanvas(this.CV_SIZE_W, this.CV_SIZE_W);
    this.fullscreen = false;
  }

  enterFullScreen() {
    super.enterFullScreen();
    this.fullscreen = true;
    this.fullscreen_scale = this.contentW / this.CV_SIZE_W;
    var scale_h = (this.h - 110) / this.CV_SIZE_H;
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h;
    this.canvas.resizeCanvas(
      this.CV_SIZE_W * this.fullscreen_scale,
      this.CV_SIZE_H * this.fullscreen_scale
    );
    //console.log("this.CV_SIZE_W:"+this.CV_SIZE_W+"||CV_SIZE_H:"+this.CV_SIZE_H+"||fullscreen_scale:"+this.fullscreen_scale+"||fullscreen_scale:"+this.fullscreen_scale)
  }

  //===============================
  // Action
  //===============================
  gameButtonAction(_actionindex) {
    switch (_actionindex) {
      case 1:
        //go to Level selector
        this.pointer.currentActivatedButton = null; //clear button in pointer
        this.gameMode = "LEVEL";
        break;
      case 21:
        //go to Level 1
        this.pointer.currentActivatedButton = null; //clear button in pointer
        this.gameMode = "PLAY";
        this.gameLevel = 1;
        this.hp = 100;
        //create point from prototype
        this.levelPos = [];
        this.levelPointCount = this.level1PointCount;
        this.levelNotDrawLint = this.level1NotDrawLint;
        this.levelNotDrawLintCount = this.level1NotDrawLintCount;
        for (var i = 0; i < this.levelPointCount; i++) {
          this.levelPos[i] = new noseArtistMobileDotPoint(
            this.p5.createVector(
              this.level1Sequence[i * 2],
              this.level1Sequence[i * 2 + 1]
            ),
            i,
            this
          );
        }
        this.currentPoint = 0;
        this.levelFinish = false;
        this.levelOver = false;
        this.clearnVirusBall();
        break;
      case 22:
        //go to Level 2
        this.pointer.currentActivatedButton = null; //clear button in pointer
        this.gameMode = "PLAY";
        this.gameLevel = 2;
        this.hp = 100;
        //create point from prototype
        this.levelPos = [];
        this.levelPointCount = this.level2PointCount;
        this.levelNotDrawLint = this.level2NotDrawLint;
        this.levelNotDrawLintCount = this.level2NotDrawLintCount;
        for (var i = 0; i < this.levelPointCount; i++) {
          this.levelPos[i] = new noseArtistMobileDotPoint(
            this.p5.createVector(
              this.level2Sequence[i * 2],
              this.level2Sequence[i * 2 + 1]
            ),
            i,
            this
          );
        }
        this.currentPoint = 0;
        this.levelFinish = false;
        this.levelOver = false;
        this.clearnVirusBall();
        break;
      case 23:
        //go to Level 3
        this.pointer.currentActivatedButton = null; //clear button in pointer
        this.gameMode = "PLAY";
        this.gameLevel = 3;
        this.hp = 100;
        //create point from prototype
        this.levelPos = [];
        this.levelPointCount = this.level3PointCount;
        this.levelNotDrawLint = this.level3NotDrawLint;
        this.levelNotDrawLintCount = this.level3NotDrawLintCount;
        for (var i = 0; i < this.levelPointCount; i++) {
          this.levelPos[i] = new noseArtistMobileDotPoint(
            this.p5.createVector(
              this.level3Sequence[i * 2],
              this.level3Sequence[i * 2 + 1]
            ),
            i,
            this
          );
        }
        this.currentPoint = 0;
        this.levelFinish = false;
        this.levelOver = false;
        this.clearnVirusBall();
        break;
      case 3:
        //go to Level selector
        this.pointer.currentActivatedButton = null; //clear button in pointer
        this.gameMode = "LEVEL";
        //popup(OPEN_WEB_ON_FINISH, width, height);
        break;
      case 4:
        this.pointer.currentActivatedButton = null; //clear button in pointer
        //switch Camera
        if (
          this.inElement != null &&
          this.inElement.inElement != null &&
          this.inElement.inElement.cameraMenu != null
        ) {
          this.cameraMode = !this.cameraMode;
          this.inElement.inElement.switchCamera(this.cameraMode);
        }
        break;
      default:
        break;
    }
  }
  /*
	function popup(url, w, h) {
	  n = window.open(url, '_blank', 'toolbar=0,location=0,directories=0,status=1,menubar=0,titlebar=0,scrollbars=1,resizable=1,width=' + w + ',height=' + h);
	  if (n == null) {
		return true;
	  }
	  return false;
	}
	*/
  //===============================
  // Draw Postnet function
  //===============================
  // A function to draw ellipses over the detected keypoints
  getKeypoints() {
    if (this.poses == null) return;
    var nScore = 0;
    // Loop through all the poses detected
    for (let i = 0; i < this.poses.length; i++) {
      if (this.poses[i].pose == null) return;
      let keypoint = this.poses[i].pose.keypoints[0]; //nose
      if (keypoint.score > 0.2 && nScore < keypoint.score) {
        nScore = keypoint.score;
        var xpos = keypoint.position.x;
        if (!this.inElement.inElement.flip)
          xpos = this.inElement.inElement.videoWidth - keypoint.position.x;
        var ratio_w = this.CV_SIZE_W / this.inElement.inElement.videoWidth;
        var ratio_h = this.CV_SIZE_H / this.inElement.inElement.videoHeight;
        this.noseX = xpos * ratio_w;
        this.noseY = keypoint.position.y * ratio_h;
        if (this.isDraw) {
          this.pg.push();
          //ellipse(keypoint.position.x, keypoint.position.y, 20, 20);
          this.pg.stroke(230, 234, 0, 200);
          this.pg.strokeWeight(7);
          this.pg.line(this.noseX, this.noseY, this.pNoseX, this.pNoseY);
          this.pg.pop();
        }

        this.pNoseX = this.noseX;
        this.pNoseY = this.noseY;
      }
    }
  }

  setupVirusBall() {
    this.virusBalls = [];
    for (let i = 0; i < this.numBalls; i++) {
      this.virusBalls[i] = new noseArtistMobileBall(
        this,
        this.p5.random(this.CV_SIZE_W),
        this.p5.random(this.CV_SIZE_H),
        this.p5.random(30, 70),
        i,
        this.virusBalls
      );
    }
  }

  clearnVirusBall() {
    for (let i = 0; i < this.numBalls; i++) {
      this.virusBalls[i] = null;
    }
    this.virusBalls = null;
  }
}
//===============================
// UI
//===============================
class noseArtistMobileUI {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.b_welcome = new noseArtistMobileButton(
      this.parent,
      this.parent.img_btbbig_n,
      this.parent.img_btbbig_d,
      this.parent.p5.createVector(
        this.parent.CV_SIZE_W / 2 + 150,
        this.parent.CV_SIZE_H / 2 + 150
      ),
      this.parent.p5.createVector(80, 80),
      0,
      1,
      "เริ่ม"
    ); //actionIndex = 1
    this.b_flipcamera = new noseArtistMobileButton(
      this.parent,
      this.parent.img_btflip_n,
      this.parent.img_btflip_d,
      this.parent.p5.createVector(this.parent.CV_SIZE_W - 50, 50),
      this.parent.p5.createVector(80, 80),
      0,
      4,
      ""
    ); //actionIndex = 4 flip camera
    this.b_level1 = new noseArtistMobileButton(
      this.parent,
      this.parent.img_round_n,
      this.parent.img_round_d,
      this.parent.p5.createVector(
        this.parent.CV_SIZE_W / 2 - 150 - 20,
        this.parent.CV_SIZE_H / 2 + 150
      ),
      this.parent.p5.createVector(80, 80),
      40,
      21,
      "1"
    ); //actionIndex = 21
    this.b_level2 = new noseArtistMobileButton(
      this.parent,
      this.parent.img_round_n,
      this.parent.img_round_d,
      this.parent.p5.createVector(
        this.parent.CV_SIZE_W / 2 - 75 - 10,
        this.parent.CV_SIZE_H / 2 + 150
      ),
      this.parent.p5.createVector(80, 80),
      40,
      22,
      "2"
    ); //actionIndex = 22
    this.b_level3 = new noseArtistMobileButton(
      this.parent,
      this.parent.img_round_n,
      this.parent.img_round_d,
      this.parent.p5.createVector(
        this.parent.CV_SIZE_W / 2 - 0,
        this.parent.CV_SIZE_H / 2 + 150
      ),
      this.parent.p5.createVector(80, 80),
      40,
      23,
      "3"
    ); //actionIndex = 23
    this.b_win = new noseArtistMobileButton(
      this.parent,
      this.parent.img_btbbig_n,
      this.parent.img_btbbig_d,
      this.parent.p5.createVector(
        this.parent.CV_SIZE_W / 2 + 150,
        this.parent.CV_SIZE_H / 2 + 150
      ),
      this.parent.p5.createVector(80, 80),
      0,
      3,
      "ตกลง"
    ); //actionIndex = 1
    //other display value
    this.alpha_1 = 0;
    this.alpha_2 = 0;
    this.flashScreen = false;
    this.countdown = 7000;
  }

  draw() {
    var width = this.parent.CV_SIZE_W;
    var height = this.parent.CV_SIZE_H;
    /*
     this.parent.precanvas.push();
     this.parent.precanvas.textFont( this.parent.font);
    //corner text
    this.setTextSizeStrokeWeight(22, 0, 3);
     this.parent.precanvas.fill(255);
     this.parent.precanvas.textAlign( this.parent.p5.LEFT,  this.parent.p5.CENTER);
     this.parent.precanvas.text(this.cornerText, 5, height - 15);
     this.parent.precanvas.pop();
	 */
    this.parent.precanvas.push();
    if (this.parent.gameMode == "WELCOME") {
      //draw welcome Screen
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_bg,
        width / 2,
        height / 2,
        this.parent.BG_SIZE_W,
        this.parent.BG_SIZE_H
      );
      this.parent.precanvas.image(
        this.parent.img_logo,
        width / 2,
        height / 2 - 50,
        250,
        250
      );
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(38, 0, 3);
      this.parent.precanvas.fill(255, 234, 0);
      this.parent.precanvas.text(
        this.parent.GAMENAME,
        width / 2,
        height / 2 + 80
      );
      this.parent.precanvas.textAlign(
        this.parent.p5.LEFT,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(20, 0, 0);
      this.parent.precanvas.fill(0);
      this.parent.precanvas.text(
        "เกมนี้ใช้จมูกในการเล่น",
        width / 2 - this.parent.BG_SIZE_W / 2 + 10,
        height / 2 + 125
      );
      this.parent.precanvas.text(
        "ขยับมาที่ปุ่มและค้างไว้เพื่อเริ่มเล่น",
        width / 2 - this.parent.BG_SIZE_W / 2 + 10,
        height / 2 + 150
      );
      this.b_welcome.draw();
      /*
	  //Show switch camera if on mobileOS
	  if (isMobileMlxNoseArtist()) {
		this.b_flipcamera.draw();
       }
	   */
    } else if (this.parent.gameMode == "LEVEL") {
      //-----------------------------
      //Level Selector
      //clear dislay value from 'PLAY' state
      this.flashScreen = false;
      this.alpha_2 = 0;
      this.countdown = 7000;
      this.parent.isDraw = false;
      this.parent.pg.clear();
      //draw Level Selector Screen
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.image(
        this.parent.img_bg,
        width / 2,
        height / 2,
        this.parent.BG_SIZE_W,
        this.parent.BG_SIZE_H
      );
      this.parent.precanvas.image(
        this.parent.img_howto1,
        width / 2 - this.parent.BG_SIZE_W / 2 + 60,
        height / 2 - this.parent.BG_SIZE_W / 2 + 60,
        100,
        100
      );
      this.parent.precanvas.image(
        this.parent.img_howto2,
        width / 2 - this.parent.BG_SIZE_W / 2 + 60,
        height / 2 - this.parent.BG_SIZE_W / 2 + 160,
        100,
        100
      );
      this.parent.precanvas.image(
        this.parent.img_howto3,
        width / 2 - this.parent.BG_SIZE_W / 2 + 60,
        height / 2 - this.parent.BG_SIZE_W / 2 + 260,
        100,
        100
      );
      this.setTextSizeStrokeWeight(20, 0, 3);
      this.parent.precanvas.fill(255);
      this.parent.precanvas.rectMode(this.parent.p5.CORNER);
      this.parent.precanvas.text(
        "1.ลากเส้นผ่านจุดที่กำหนด ตามลำดับจนหมด",
        width / 2 - this.parent.BG_SIZE_W / 2 + 120,
        height / 2 - this.parent.BG_SIZE_W / 2 + 50,
        this.parent.BG_SIZE_W - 150,
        300
      );
      this.parent.precanvas.textAlign(
        this.parent.p5.LEFT,
        this.parent.p5.CENTER
      );
      this.parent.precanvas.text(
        "2.หลบไวรัสที่จะลอยเข้าจมูก",
        width / 2 - this.parent.BG_SIZE_W / 2 + 120,
        height / 2 - this.parent.BG_SIZE_W / 2 + 150
      );
      this.parent.precanvas.text(
        "3.ถ้าโดนไวรัสจนพลังหมดจะแพ้",
        width / 2 - this.parent.BG_SIZE_W / 2 + 120,
        height / 2 - this.parent.BG_SIZE_W / 2 + 250
      );
      this.setTextSizeStrokeWeight(30, 0, 3);
      this.parent.precanvas.fill(255, 234, 0);
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.parent.precanvas.text(
        "เลือกด่าน",
        width / 2,
        height / 2 - this.parent.BG_SIZE_W / 2 + 310
      );
      this.b_level1.draw();
      this.b_level2.draw();
      this.b_level3.draw();
    } else if (this.parent.gameMode == "PLAY") {
      //----------------------------
      //Play State
      //----------------------------
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      //draw background tint
      this.parent.precanvas.push();
      var hpBarColor = this.parent.p5.createVector(79, 96, 88);
      hpBarColor = hpBarColor.lerp(268, 100, 79, 1 - this.parent.hp / 100.0);
      //green 79/96/88 to red 0,96,88
      this.parent.precanvas.colorMode(this.parent.p5.HSB, 339, 100, 100, 100);
      this.parent.precanvas.fill(hpBarColor.x, hpBarColor.y, hpBarColor.z, 25);
      this.parent.precanvas.rect(0, 0, width, height);
      this.parent.precanvas.pop();
      //----------------
      //draw line
      this.parent.precanvas.push();
      if (this.parent.levelFinish) {
        //draw black outline
        for (var i = 0; i < this.parent.currentPoint - 1; i++) {
          //check prevent drawing list
          var drawMe = true;
          for (var j = 0; j < this.parent.levelNotDrawLintCount; j++) {
            if (this.parent.levelNotDrawLint[j] - 1 == i) {
              drawMe = false;
              break;
            }
          }
          if (drawMe) {
            this.parent.precanvas.push();
            this.parent.precanvas.stroke(0, 255);
            this.parent.precanvas.strokeWeight(25);
            this.parent.precanvas.line(
              this.parent.levelPos[i].position.x,
              this.parent.levelPos[i].position.y,
              this.parent.levelPos[i + 1].position.x,
              this.parent.levelPos[i + 1].position.y
            );
            this.parent.precanvas.pop();
          }
        }
      }
      for (var i = 0; i < this.parent.currentPoint - 1; i++) {
        //check prevent drawing list
        var drawMe = true;
        for (var j = 0; j < this.parent.levelNotDrawLintCount; j++) {
          if (this.parent.levelNotDrawLint[j] - 1 == i) {
            drawMe = false;
            break;
          }
        }
        if (drawMe) {
          this.parent.precanvas.stroke(
            255,
            234,
            0,
            this.parent.levelFinish ? 255 : 220
          );
          this.parent.precanvas.strokeWeight(this.parent.levelFinish ? 15 : 10);
          this.parent.precanvas.line(
            this.parent.levelPos[i].position.x,
            this.parent.levelPos[i].position.y,
            this.parent.levelPos[i + 1].position.x,
            this.parent.levelPos[i + 1].position.y
          );
        }
      }
      this.parent.precanvas.pop();
      if (this.parent.levelFinish) {
        this.countdown -= this.parent.p5.deltaTime;
        if (this.countdown < 0) {
          //show finish screen
          this.parent.precanvas.push();
          this.parent.precanvas.imageMode(this.parent.p5.CENTER);
          this.parent.precanvas.image(
            this.parent.img_bg,
            width / 2,
            height / 2,
            this.parent.BG_SIZE_W,
            this.parent.BG_SIZE_H
          );
          this.parent.precanvas.image(
            this.parent.img_win,
            width / 2,
            height / 2 - 50,
            250,
            170
          );
          this.parent.precanvas.textAlign(
            this.parent.p5.LEFT,
            this.parent.p5.CENTER
          );
          this.setTextSizeStrokeWeight(20, 0, 3);
          this.parent.precanvas.fill(255, 234, 0);
          this.parent.precanvas.text(
            this.parent.FINISH_MESSAGE,
            width / 2 - this.parent.BG_SIZE_W / 2 + 15,
            height / 2 + 125
          );
          this.b_win.draw();
          this.parent.precanvas.pop();
        }
      } else {
        //level not finish
        //draw point on top
        for (var i = 0; i < this.parent.levelPointCount; i++) {
          this.parent.levelPos[i].draw();
        }
        //draw virus ball
        if (this.parent.virusBalls != null) {
          this.parent.virusBalls.forEach((ball) => {
            ball.collide();
            ball.move();
            ball.display();
          });
        }
        //draw HP bar
        this.parent.precanvas.push();
        this.parent.precanvas.fill(0);
        this.parent.precanvas.rect(5, 5, 150, 40);
        var hpBarColor = this.parent.p5.createVector(79, 96, 88);
        hpBarColor = hpBarColor.lerp(0, 96, 88, 1 - this.parent.hp / 100.0);
        //green 79/96/88 to red 0,96,88
        this.parent.precanvas.colorMode(this.parent.p5.HSB, 339, 100, 100);
        this.parent.precanvas.fill(hpBarColor.x, hpBarColor.y, hpBarColor.z);
        this.parent.precanvas.rect(8, 8, 144 * (this.parent.hp / 100.0), 34);
        this.parent.precanvas.pop();
        //draw point left text
        this.parent.precanvas.push();
        this.setTextSizeStrokeWeight(25, 0, 3);
        this.parent.precanvas.fill(255);
        this.parent.precanvas.textAlign(
          this.parent.p5.RIGHT,
          this.parent.p5.CENTER
        );
        var topText =
          "เหลืออีก " +
          (this.parent.levelPointCount - this.parent.currentPoint) +
          "จุด";
        if (this.parent.currentPoint == 0)
          topText = "ไปที่จุดกระพริบเพื่อเริ่มต้น";
        this.parent.precanvas.text(topText, width - 40, 25);
        //----------------------------------
        //DoctorAdvise
        if (
          this.parent.currentPoint > 0 &&
          this.parent.currentPoint <= this.parent.displayText.length
        ) {
          this.setTextSizeStrokeWeight(25, 0, 3);
          this.parent.precanvas.fill(255, 230);
          this.parent.precanvas.rect(0, height - 60, 450, 50, 10);
          this.parent.precanvas.imageMode(this.parent.p5.CORNER);
          this.parent.precanvas.image(
            this.parent.img_doctor,
            width - 50,
            height - 98,
            50,
            98
          );
          this.parent.precanvas.textAlign(
            this.parent.p5.LEFT,
            this.parent.p5.CENTER
          );
          this.setTextSizeStrokeWeight(20, 0, 3);
          this.parent.precanvas.text(
            this.parent.displayText[this.parent.currentPoint - 1],
            10,
            height - 60,
            440,
            50
          );
        }
        //----------------------------------
        this.parent.precanvas.pop();
        //----------------------
        if (this.parent.levelOver) {
          //game over
          //show lose dialog
          this.parent.precanvas.push();
          this.parent.precanvas.imageMode(this.parent.CENTER);
          this.parent.precanvas.image(
            this.parent.img_bg,
            width / 2,
            height / 2,
            this.parent.BG_SIZE_W,
            this.parent.BG_SIZE_H
          );
          this.parent.precanvas.image(
            this.parent.img_lose,
            width / 2,
            height / 2 - 50,
            220,
            250
          );
          this.parent.precanvas.textAlign(
            this.parent.p5.LEFT,
            this.parent.p5.CENTER
          );
          this.setTextSizeStrokeWeight(20, 0, 3);
          this.parent.precanvas.fill(161, 9, 225);
          this.parent.precanvas.text(
            "เสียใจด้วย คุณป่วยซะแล้ว!!",
            width / 2 - this.parent.BG_SIZE_W / 2 + 15,
            height / 2 + 125
          );
          this.b_win.draw();
          this.parent.precanvas.pop();
        }
        //----------------------
      }
      //----------------------------
    }
    this.parent.precanvas.pop();
  }

  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.parent.precanvas.textSize(_size);
    this.parent.precanvas.stroke(_stroke);
    this.parent.precanvas.strokeWeight(_weight);
  }
}
//===============================
// POINTER
//===============================
class noseArtistMobilePointer {
  constructor(mlxParent) {
    this.parent = mlxParent;
    this.position;
    this.radius = 5;
    this.timer = 1000;
    this.buttonActivated = false;
    this.currentActivatedButton = null; // button that pointer currently on
    //DotPoint Timer
    this.timerDotPoint = 1000;
    this.currentDotPoint = null; // button that pointer currently on
  }
  draw() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    this.position = this.parent.p5.createVector(
      this.parent.posNose.x,
      this.parent.posNose.y
    ); //for virus checking
    this.parent.precanvas.image(
      this.parent.img_pointer,
      this.parent.posNose.x,
      this.parent.posNose.y
    ); //pointer on top
    this.parent.precanvas.pop();
    //-------------------------
    //For Button Action
    if (this.currentActivatedButton != null && !this.buttonActivated) {
      this.showTimer();
    } else if (this.currentActivatedButton != null && this.buttonActivated) {
      //button is already activated
      //do nothing here(this ensure that button can only be activaed only once)
    } else {
      //no button
      //reset timer
      this.timer = 0;
      this.buttonActivated = false;
    }
    //--------------------------
    //For DotPoint Action
    if (
      this.currentDotPoint != null &&
      this.currentDotPoint.pointCount == this.parent.currentPoint
    ) {
      this.showTimerForDotPoint();
    } else {
      //reset timer
      this.timerDotPoint = 0;
    }
    //--------------------------
  }

  showTimerForDotPoint() {
    if (this.timerDotPoint == 0) this.parent.sound_button_touch.play(); //touch first time
    this.timerDotPoint += this.parent.p5.deltaTime;
    if (this.timerDotPoint > this.parent.DOTPOINT_ACTIVATED_TIME) {
      this.timerDotPoint = this.parent.DOTPOINT_ACTIVATED_TIME;
      this.currentDotPoint.doAction();
    } else {
      //display timer progress
      this.parent.precanvas.push();
      this.parent.precanvas.fill(0);
      this.parent.precanvas.rect(
        this.parent.posNose.x - 25,
        this.parent.posNose.y - 33,
        50,
        15
      );
      this.parent.precanvas.fill(255, 234, 0);
      this.parent.precanvas.rect(
        this.parent.posNose.x - 25,
        this.parent.posNose.y - 33,
        50 * (this.timerDotPoint / this.parent.DOTPOINT_ACTIVATED_TIME),
        15
      );
      this.parent.precanvas.pop();
    }
  }

  showTimer() {
    if (!this.buttonActivated) {
      if (this.timer == 0) this.parent.sound_button_touch.play(); //touch first time
      this.timer += this.parent.p5.deltaTime;
      if (this.timer > this.parent.BUTTON_ACTIVATED_TIME) {
        this.timer = this.parent.BUTTON_ACTIVATED_TIME;
        this.currentActivatedButton.doAction();
        this.buttonActivated = true;
        this.parent.sound_button_activated.play();
      } else {
        //display timer progress
        this.parent.precanvas.push();
        this.parent.precanvas.fill(0);
        this.parent.precanvas.rect(
          this.parent.posNose.x - 25,
          this.parent.posNose.y - 33,
          50,
          15
        );
        this.parent.precanvas.fill(255, 0, 0);
        this.parent.precanvas.rect(
          this.parent.posNose.x - 25,
          this.parent.posNose.y - 33,
          50 * (this.timer / this.parent.BUTTON_ACTIVATED_TIME),
          15
        );
        this.parent.precanvas.pop();
      }
    }
  }
}
//===============================
// DOT POINT
//===============================
class noseArtistMobileDotPoint {
  constructor(_posVector, _pointCount, mlxParent) {
    this.parent = mlxParent;
    this.position = _posVector;
    this.pointCount = _pointCount;
    this.alpha_1 = 0;
    this.radius = 25;
  }

  draw() {
    this.parent.precanvas.push();
    if (this.pointCount == this.parent.currentPoint) {
      //pointer is on dotPoint and this dotPoint is target
      this.alpha_1 += (this.parent.p5.deltaTime / 50.0) % 50;
      this.parent.precanvas.imageMode(this.parent.p5.CENTER);
      this.parent.precanvas.tint(
        255,
        0,
        0,
        this.parent.p5.abs(
          this.parent.p5.sin((this.parent.p5.TWO_PI / 50.0) * this.alpha_1)
        ) * 255
      );
      this.parent.precanvas.image(
        this.parent.img_point,
        this.position.x,
        this.position.y,
        50,
        50
      );
      if (this.collideRound(this.parent.posNose)) {
        //---------------------------
        //set current dot to pointer
        this.parent.pointer.currentDotPoint = this;
        //---------------------------
      } else {
        //------------------------------
        //unassigned button to pointer
        if (this.parent.pointer.currentDotPoint == this) {
          this.parent.pointer.currentDotPoint = null;
        }
        //------------------------------
      }
    } else {
      if (this.pointCount < this.parent.currentPoint) {
        //Pass point
        this.parent.precanvas.tint(80, 100);
      } else if (
        this.pointCount > this.parent.currentPoint &&
        this.pointCount < this.parent.currentPoint + 5
      ) {
        //Neat Future point
        this.parent.precanvas.tint(
          255,
          234,
          0,
          150 * ((5 - (this.pointCount - this.parent.currentPoint)) / 5.0)
        );
      } else {
        this.parent.precanvas.tint(80, 24);
      }
      this.parent.precanvas.image(
        this.parent.img_point,
        this.position.x,
        this.position.y,
        25,
        25
      );
    }
    this.parent.precanvas.pop();
  }

  collideRound(pointerPos) {
    var dist = this.parent.p5.sqrt(
      this.parent.p5.pow(this.position.x - pointerPos.x, 2) +
        this.parent.p5.pow(this.position.y - pointerPos.y, 2)
    );
    if (dist <= this.radius) return true;
    return false;
  }
  doAction() {
    //console.log('doActionDotPoint:' + this.actionIndex);
    if (this.parent.levelOver) return; //ignore action after lose
    //if first point then release virus ball
    if (this.parent.currentPoint == 0) {
      this.parent.setupVirusBall();
      this.parent.sound_virus.play();
    }
    //set target to next dotpoint
    this.parent.sound_contact_point.play();
    this.parent.currentPoint++;
    this.parent.pointer.currentDotPoint = null;
    this.parent.pointer.timerDotPoint = 0;
    this.parent.pg.clear(); //clear draw line
    if (this.parent.currentPoint == this.parent.levelPointCount) {
      //Level Clear
      this.parent.sound_levelcomplete.play();
      this.parent.levelFinish = true;
      this.parent.isDraw = false;
    } else {
      //level not clear yet
      this.parent.isDraw = true;
      //check prevent drawing list
      for (var j = 0; j < this.parent.levelNotDrawLintCount; j++) {
        if (this.parent.levelNotDrawLint[j] == this.parent.currentPoint) {
          this.parent.isDraw = false;
          break;
        }
      }
    }
  }
}
//===============================
// Button
//===============================
class noseArtistMobileButton {
  constructor(
    mlxParent,
    _img_button,
    _img_button_down,
    _posVector,
    _sizeVector,
    _radius,
    _actionIndex,
    _text
  ) {
    this.parent = mlxParent;
    this.img = _img_button;
    this.img_down = _img_button_down;
    this.position = _posVector;
    this.size = _sizeVector;
    this.isDown = false;
    this.radius = _radius;
    this.actionIndex = _actionIndex;
    this.VectorOne = this.parent.p5.createVector(1, 1);
    this.text = _text;
  }

  draw() {
    this.parent.precanvas.push();
    if (
      (this.radius != 0 && this.collideRound(this.parent.posNose)) ||
      (this.radius == 0 &&
        this.collideRect(this.parent.posNose, this.VectorOne))
    ) {
      //pointer is on button
      this.parent.precanvas.image(
        this.img_down,
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );
      //------------------------------
      //set current button to pointer
      this.parent.pointer.currentActivatedButton = this;
      //------------------------------
    } else {
      this.parent.precanvas.image(
        this.img,
        this.position.x,
        this.position.y,
        this.size.x,
        this.size.y
      );
      //------------------------------
      //unassigned button to pointer
      if (this.parent.pointer.currentActivatedButton == this) {
        if (!this.parent.pointer.buttonActivated)
          this.parent.sound_button_discontact.play(); //play discontact sound only when button is not activated
        this.parent.pointer.currentActivatedButton = null;
      }
      //------------------------------
    }
    //draw text
    if (this.text != null) {
      this.parent.precanvas.textAlign(
        this.parent.p5.CENTER,
        this.parent.p5.CENTER
      );
      this.setTextSizeStrokeWeight(20, 0, 3);
      this.parent.precanvas.fill(255);
      this.parent.precanvas.text(this.text, this.position.x, this.position.y);
    }
    this.parent.precanvas.pop();
  }

  collideRound(pointerPos) {
    var dist = this.parent.p5.sqrt(
      this.parent.p5.pow(this.position.x - pointerPos.x, 2) +
        this.parent.p5.pow(this.position.y - pointerPos.y, 2)
    );
    if (dist <= this.radius) return true;
    return false;
  }
  collideRect(pointerPos, pointerSize) {
    if (
      this.position.x - this.size.x / 2 < pointerPos.x + pointerSize.x &&
      this.position.x - this.size.x / 2 + this.size.x > pointerPos.x &&
      this.position.y - this.size.y / 2 < pointerPos.y + pointerSize.y &&
      this.position.y - this.size.y / 2 + this.size.y > pointerPos.y
    ) {
      return true;
    }
    return false;
  }
  doAction() {
    //console.log('doAction:' + this.actionIndex);
    this.parent.gameButtonAction(this.actionIndex); //do in global function
  }
  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.parent.precanvas.textSize(_size);
    this.parent.precanvas.stroke(_stroke);
    this.parent.precanvas.strokeWeight(_weight);
  }
}

//===============================
// Virus Ball
//===============================
//applied from https://p5js.org/examples/motion-bouncy-bubbles.html
class noseArtistMobileBall {
  constructor(mlxParent, xin, yin, din, idin, oin) {
    this.parent = mlxParent;
    this.x = xin;
    this.y = yin;
    this.vx = this.parent.p5.random(0, 5);
    this.vy = this.parent.p5.random(0, 5);
    this.diameter = din;
    this.id = idin;
    this.others = oin;
    this.image =
      this.parent.img_virus[this.parent.p5.int(this.parent.p5.random(100) % 3)];
  }

  collide() {
    for (let i = this.id + 1; i < this.parent.numBalls; i++) {
      // console.log(others[i]);
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = this.parent.p5.sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
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
    //------------------------
    //Game Logic
    //check for
    //1.currentPoint
    //2.currentPoint-1
    //these 2 is a safe area for player
    //virus will not enter this 2 point
    var safeArea, count;
    if (this.parent.currentPoint == 0) {
      safeArea = [this.parent.levelPos[this.parent.currentPoint]];
      count = 1;
    } else {
      safeArea = [
        this.parent.levelPos[this.parent.currentPoint],
        this.parent.levelPos[this.parent.currentPoint - 1],
      ];
      count = 2;
    }
    for (let i = 0; i < count; i++) {
      // console.log(others[i]);
      let dx = safeArea[i].position.x - this.x;
      let dy = safeArea[i].position.y - this.y;
      let distance = this.parent.p5.sqrt(dx * dx + dy * dy);
      let minDist = safeArea[i].radius + this.diameter / 2;
      if (distance < minDist) {
        let angle = this.parent.p5.atan2(dy, dx);
        let targetX = this.x + this.parent.p5.cos(angle) * minDist;
        let targetY = this.y + this.parent.p5.sin(angle) * minDist;
        let ax = (targetX - safeArea[i].position.x) * this.parent.spring;
        let ay = (targetY - safeArea[i].position.y) * this.parent.spring;
        this.vx -= ax;
        this.vy -= ay;
      }
    }
    //3.current pointer position
    //if collide with pointer then hp-=2
    let dx = this.parent.pointer.position.x - this.x;
    let dy = this.parent.pointer.position.y - this.y;
    let distance = this.parent.p5.sqrt(dx * dx + dy * dy);
    let minDist = this.parent.pointer.radius + this.diameter / 2;
    if (distance < minDist) {
      //Hit Pointer
      //decrease health
      this.parent.hp -= 1;
      if (this.parent.hp <= 0 && !this.parent.levelOver) {
        this.parent.hp = 0;
        this.parent.levelOver = true;
        if (!this.parent.sound_sneeze.isPlaying())
          this.parent.sound_sneeze.play();
      } else {
        //play hit sound
        if (!this.parent.levelOver && !this.parent.sound_virus_hit.isPlaying())
          this.parent.sound_virus_hit.play();
      }
      let angle = this.parent.p5.atan2(dy, dx);
      let targetX = this.x + this.parent.p5.cos(angle) * minDist;
      let targetY = this.y + this.parent.p5.sin(angle) * minDist;
      let ax = (targetX - this.parent.pointer.position.x) * this.parent.spring;
      let ay = (targetY - this.parent.pointer.position.y) * this.parent.spring;
      this.vx -= ax;
      this.vy -= ay;
    }
  }

  move() {
    this.vy += this.parent.gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x + this.diameter / 2 > this.parent.CV_SIZE_W) {
      this.x = this.parent.CV_SIZE_W - this.diameter / 2;
      this.vx *= this.parent.friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= this.parent.friction;
    }
    if (this.y + this.diameter / 2 > this.parent.CV_SIZE_H) {
      this.y = this.parent.CV_SIZE_H - this.diameter / 2;
      this.vy *= this.parent.friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= this.parent.friction;
    }
  }

  display() {
    this.parent.precanvas.push();
    this.parent.precanvas.imageMode(this.parent.p5.CENTER);
    this.parent.precanvas.image(
      this.image,
      this.x,
      this.y,
      this.diameter + 3,
      this.diameter + 3
    );
    this.parent.precanvas.fill(255, 150);
    //ellipse(this.x, this.y, this.diameter, this.diameter);
    this.parent.precanvas.pop();
  }
}

module.exports = {
  mlxNoseArtistMobile,
};
