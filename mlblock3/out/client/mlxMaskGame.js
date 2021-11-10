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
} = require('./mlxElement')

function isMobileMlxMaskGame() {
  try {
    document.createEvent('TouchEvent')
    return true
  } catch (e) {
    return false
  }
}

class mlxMaskGame extends mlxElementLocakableOutput {
  constructor(mlx) {
    //mlx element
    super(mlx)
    this.title = 'Mask'
    this.category = 'Output'
    this.type = 'MaskGame'
    this.inType = 'posenet'
    this.outType = 'results'
    this.needMouse = true
    this.score = 0
    this.canvasSize = 650
    this.poses = []
    this.noseX = 0
    this.noseY = 0
    this.eyeLX = 0
    this.eyeLY = 0
    this.eyeRX = 0
    this.eyeRY = 0
    this.CV_SIZE_W = 450
    ;(this.CV_SIZE_H = 650), this.cNose
    this.cEL
    this.cER
    //this.CV_SIZE_H = 320;
    this.fullscreen = false //internal usage
    this.fullscreen_scale = 1 //internal usage
    this.w = this.CV_SIZE_W / 2 + this.mlx.mlxPadding * 2 //size including frame
    this.h = this.CV_SIZE_H / 2 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 //size including frame
    this.fps = 15
    this.createElementMenu()
    this.offScreenX = this.mlx.mlxPadding
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.offScreen = this.mlx.createCanvas(
      this,
      this.offScreenX,
      this.offScreenY,
      this.CV_SIZE_W / 2,
      this.CV_SIZE_H / 2
    )
    this.canvas = this.offScreen.offScreen
    this.precanvas = this.p5.createGraphics(this.CV_SIZE_W, this.CV_SIZE_H)

    this.buttonNose = this.mlx.createButton(
      this,
      'Nose',
      () => {
        if (this.buttonNose.lock < 500) return
        this.buttonNose.lock = 0
        //change node image
        this.cNose += 1
        if (this.cNose >= 5) this.cNose = 0
      },
      65 + 15,
      this.h - 32,
      65,
      24
    )

    this.buttonEL = this.mlx.createButton(
      this,
      'LeftEye',
      () => {
        if (this.buttonEL.lock < 500) return
        this.buttonEL.lock = 0
        //change node image
        this.cEL += 1
        if (this.cEL >= 5) this.cEL = 0
      },
      10,
      this.h - 32,
      65,
      24
    )
    this.buttonER = this.mlx.createButton(
      this,
      'RightEye',
      () => {
        if (this.buttonER.lock < 500) return
        this.buttonER.lock = 0
        //change node image
        this.cER += 1
        if (this.cER >= 5) this.cER = 0
      },
      130 + 20,
      this.h - 32,
      65,
      24
    )

    this.captureCountdown = 2999
    this.captureBeepCountdown = 0
    this.doCaptureScreen = false
    this.takePhoto = this.mlx.createButton(
      this,
      'Save',
      () => {
        //capture image
        this.captureCountdown = 2999
        this.captureBeepCountdown = 0
        this.doCaptureScreen = true
      },
      65 + 15,
      this.h - 32 - 24 - 3,
      65,
      24
    )
    /*
		if(isMobileMlxMaskGame()){
			this.cameraMode = false;
			this.buttonSwitchCamera = this.mlx.createButton(
				this,
				"switch cam",
				() => {
					if(this.buttonSwitchCamera.lock < 500)return;
					this.buttonSwitchCamera.lock = 0
					//switchCamera
					  if(this.inElement != null
						&& this.inElement.inElement != null
						&& this.inElement.inElement.cameraMenu != null){
						  this.cameraMode = !this.cameraMode;
						  this.inElement.inElement.switchCamera(this.cameraMode);
			  }
				},
				15,
				this.offScreenY+15,
				80,
				24
			);
			this.buttonSwitchCamera.border = true;
		}
		*/
    this.buttonNose.border = true
    this.buttonEL.border = true
    this.buttonER.border = true
    this.takePhoto.border = true
    //image
    this.img_n1
    this.img_n2
    this.img_n3
    this.img_n4
    this.img_n5
    this.img_el1
    this.img_el2
    this.img_el3
    this.img_el4
    this.img_el5
    this.img_er1
    this.img_er2
    this.img_er3
    this.img_er4
    this.img_er5
    this.img_n, this.img_el, this.img_er
    //internal setup
    this.preload()
    this.setup()

    //Output(required)
    this.output = this.canvas
    this.ready = true
  }

  preload() {
    this.img_n1 = this.p5.loadImage('assets_game/mlxMask/nose1.png')
    this.img_n2 = this.p5.loadImage('assets_game/mlxMask/nose2.png')
    this.img_n3 = this.p5.loadImage('assets_game/mlxMask/nose3.png')
    this.img_n4 = this.p5.loadImage('assets_game/mlxMask/nose4.png')
    this.img_n5 = this.p5.loadImage('assets_game/mlxMask/nose5.png')

    this.img_el1 = this.p5.loadImage('assets_game/mlxMask/leftEye1.png')
    this.img_el2 = this.p5.loadImage('assets_game/mlxMask/leftEye2.png')
    this.img_el3 = this.p5.loadImage('assets_game/mlxMask/leftEye3.png')
    this.img_el4 = this.p5.loadImage('assets_game/mlxMask/leftEye4.png')
    this.img_el5 = this.p5.loadImage('assets_game/mlxMask/leftEye5.png')

    this.img_er1 = this.p5.loadImage('assets_game/mlxMask/rightEye1.png')
    this.img_er2 = this.p5.loadImage('assets_game/mlxMask/rightEye2.png')
    this.img_er3 = this.p5.loadImage('assets_game/mlxMask/rightEye3.png')
    this.img_er4 = this.p5.loadImage('assets_game/mlxMask/rightEye4.png')
    this.img_er5 = this.p5.loadImage('assets_game/mlxMask/rightEye5.png')

    this.img_waiting = this.p5.loadImage('assets_game/mlxMask/waiting_mobile.png')

    //shutter sound for screen capture
    this.beepSound = this.p5.loadSound('/assets/shutterbeep.mp3')
    this.shutterSound = this.p5.loadSound('/assets/shuttersound.mp3')
  }

  setup() {
    this.img_n = [this.img_n1, this.img_n2, this.img_n3, this.img_n4, this.img_n5]
    this.img_el = [this.img_el1, this.img_el2, this.img_el3, this.img_el4, this.img_el5]
    this.img_er = [this.img_er1, this.img_er2, this.img_er3, this.img_er4, this.img_er5]
    this.cNose = 0
    this.cEL = 0
    this.cER = 0
  }

  doProcess() {
    this.poses = this.inElement.output
    this.getKeypoints() //process data

    this.busy = false
    this.outputIsReady = true
    this.output = this.inElement.output
    this.inElement.outputIsReady = false
    this.alreadyRunInLoop = true
    return true
  }

  draw(p5) {
    if (!this.lockCanvasToThisElement) super.draw(p5)
    if (this.buttonNose.lock < 500) this.buttonNose.lock += p5.deltaTime
    if (this.buttonEL.lock < 500) this.buttonEL.lock += p5.deltaTime
    if (this.buttonER.lock < 500) this.buttonER.lock += p5.deltaTime
    //if(this.buttonSwitchCamera && this.buttonSwitchCamera.lock < 500)this.buttonSwitchCamera.lock += p5.deltaTime;
    if (this.inElement != null && this.inElement.inElement != null && this.inElement.inElement.videoCapture != null) {
      if (!this.gameConnected) {
        this.gameConnected = true
      }
      //draw video
      this.precanvas.push()
      if (this.inElement.inElement.flip) {
        this.precanvas.scale(-1, 1) //flip video
        this.precanvas.translate(0 - this.CV_SIZE_W, 0)
      }
      this.precanvas.imageMode(p5.CORNER)
      this.precanvas.image(this.inElement.inElement.videoCapture, 0, 0, this.CV_SIZE_W, this.CV_SIZE_H)
      this.precanvas.pop()
      //draw mask
      let eyeDist = p5.dist(this.eyeLX, this.eyeLY, this.eyeRX, this.eyeRY)
      //console.log(eyeDist);
      this.precanvas.push()
      this.precanvas.imageMode(p5.CENTER)
      //let is = (eyeDist * 0.85) / this.img_n[0].width;
      //this.precanvas.scale(is);
      this.precanvas.image(
        this.img_n[this.cNose],
        this.noseX,
        this.noseY - eyeDist / 72,
        (eyeDist / 72) * (this.img_n[0].width / 8.5),
        (eyeDist / 72) * (this.img_n[0].height / 8.5)
      )
      this.precanvas.image(
        this.img_el[this.cEL],
        this.eyeLX,
        this.eyeLY,
        (eyeDist / 72) * (this.img_el[0].width / 7),
        (eyeDist / 72) * (this.img_el[0].height / 7)
      )
      this.precanvas.image(
        this.img_er[this.cER],
        this.eyeRX,
        this.eyeRY,
        (eyeDist / 72) * (this.img_er[0].width / 7),
        (eyeDist / 72) * (this.img_er[0].height / 7)
      )
      this.precanvas.pop()
    } else {
      //no video input
      this.precanvas.push()
      this.precanvas.imageMode(this.p5.CORNER)
      this.precanvas.image(this.img_waiting, 0, 0, this.CV_SIZE_W, this.CV_SIZE_H)
      this.precanvas.pop()
      this.gameConnected = false
    }

    if (this.doCaptureScreen) {
      //Art do capture screen action
      //add countdown 3 sec.before takeing photo
      this.captureCountdown -= p5.deltaTime
      if (this.captureCountdown > 0) {
        this.captureBeepCountdown -= p5.deltaTime
        if (this.captureBeepCountdown < 0) {
          //play beep sound
          if (this.beepSound != null && this.beepSound.isLoaded()) this.beepSound.play()
          this.captureBeepCountdown = 1000
        }
        this.precanvas.push()
        this.precanvas.fill(255)
        this.precanvas.textSize(40)
        this.precanvas.text(p5.floor(this.captureCountdown / 1000) + 1, this.CV_SIZE_W - 55, 5, 50, 50)
        this.precanvas.pop()
      } else {
        //since p5 is already manipulated by user scale/transition
        //we create new graphic with same p5's size and redraw this frame all over again
        if (this.shutterSound != null && this.shutterSound.isLoaded()) this.shutterSound.play()
        this.precanvas.save('myVideoCanvas.jpg')
        this.doCaptureScreen = false
      }
    }

    //Fullscreen
    this.canvas.push()
    if (this.fullscreen) {
      //resize & draw
      this.canvas.scale(this.fullscreen_scale)
    } else {
      this.canvas.scale(0.5)
    }
    this.canvas.image(this.precanvas, 0, 0)
    this.canvas.pop()

    //LockableCanvas
    this.adjustThisElementToLockCanvas()
  }

  //--------------------
  //Fullscreen
  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Full screen', (ui) => {
      this.hideMenu()
      this.enterFullScreen()
    })
    menu.addCommand('Focus', (ui) => {
      this.hideMenu()
      this.mlx.hideNavBar()
      window.dispatchEvent(new Event('resize'))
      this.mlx.focusedElement = this
      this.lockCanvasToThisElement = true
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  endFullScreen() {
    super.endFullScreen()
    this.canvas.resizeCanvas(this.CV_SIZE_W, this.CV_SIZE_W)
    this.fullscreen = false
  }

  enterFullScreen() {
    super.enterFullScreen()
    this.fullscreen = true
    this.fullscreen_scale = this.contentW / this.CV_SIZE_W
    var scale_h = (this.h - 110) / this.CV_SIZE_H
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h
    this.canvas.resizeCanvas(this.CV_SIZE_W * this.fullscreen_scale, this.CV_SIZE_H * this.fullscreen_scale)
    //console.log("this.CV_SIZE_W:"+this.CV_SIZE_W+"||CV_SIZE_H:"+this.CV_SIZE_H+"||fullscreen_scale:"+this.fullscreen_scale+"||fullscreen_scale:"+this.fullscreen_scale)
  }

  //===============================
  // Draw Postnet function
  //===============================
  // A function to draw ellipses over the detected keypoints
  getKeypoints() {
    if (this.poses == null) return
    var nScore = 0
    var elScore = 0
    var erScore = 0
    // Loop through all the poses detected
    for (let i = 0; i < this.poses.length; i++) {
      if (this.poses[i].pose == null) return
      let keypoint = this.poses[i].pose.keypoints[0] //nose
      if (keypoint.score > 0.2 && nScore < keypoint.score) {
        nScore = keypoint.score
        var xpos = keypoint.position.x
        if (this.inElement.inElement.flip) xpos = this.inElement.inElement.videoWidth - keypoint.position.x
        var ratio_w = this.CV_SIZE_W / this.inElement.inElement.videoWidth
        var ratio_h = this.CV_SIZE_H / this.inElement.inElement.videoHeight
        this.noseX = xpos * ratio_w
        this.noseY = keypoint.position.y * ratio_h
      }
      keypoint = this.poses[i].pose.keypoints[1] //lefteye
      if (keypoint.score > 0.2 && elScore < keypoint.score) {
        elScore = keypoint.score
        var xpos = keypoint.position.x
        if (this.inElement.inElement.flip) xpos = this.inElement.inElement.videoWidth - keypoint.position.x
        var ratio_w = this.CV_SIZE_W / this.inElement.inElement.videoWidth
        var ratio_h = this.CV_SIZE_H / this.inElement.inElement.videoHeight
        this.eyeLX = xpos * ratio_w
        this.eyeLY = keypoint.position.y * ratio_h
      }
      keypoint = this.poses[i].pose.keypoints[2] //righteye
      if (keypoint.score > 0.2 && erScore < keypoint.score) {
        erScore = keypoint.score
        var xpos = keypoint.position.x
        if (this.inElement.inElement.flip) xpos = this.inElement.inElement.videoWidth - keypoint.position.x
        var ratio_w = this.CV_SIZE_W / this.inElement.inElement.videoWidth
        var ratio_h = this.CV_SIZE_H / this.inElement.inElement.videoHeight
        this.eyeRX = xpos * ratio_w
        this.eyeRY = keypoint.position.y * ratio_h
      }
    }
  }
}

module.exports = {
  mlxMaskGame,
}
