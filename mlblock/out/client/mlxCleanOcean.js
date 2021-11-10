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

class mlxCleanOceanGame extends mlxElementLocakableOutput {
  constructor(mlx) {
    super(mlx)
    this.title = 'Clean the Ocean'
    this.category = 'Output'
    this.type = 'CleanTheOceanGame'
    this.inType = 'posenet'
    this.outType = 'results'
    this.needMouse = false
    this.score = 0
    this.canvasSize = 786
    this.canvas_w = 786 //internal usage
    this.canvas_h = 500 //internal usage
    this.fullscreen = false //internal usage
    this.fullscreen_scale = 1 //internal usage
    this.w = this.canvas_w / 2 + this.mlx.mlxPadding * 2 //size including frame
    this.h = this.canvas_h / 2 + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 //size including frame
    this.fps = 15
    this.createElementMenu()
    this.offScreenX = this.mlx.mlxPadding
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.offScreen = this.mlx.createCanvas(this, this.offScreenX, this.offScreenY, this.canvas_w / 2, this.canvas_h / 2)
    this.canvas = this.offScreen.offScreen
    this.canvas.imageMode(this.p5.CORNER)
    this.precanvas = this.p5.createGraphics(this.canvas_w, this.canvas_h)

    this.trashImage = []
    //Global setting
    this.DEBUG = false //draw hand bounding
    this.TICKLING_TIME = 800 //wait time for box to open(ms.)
    this.BOX_SCALE = 1 //NormalBoxSize = distance from nosenode to eyenode,change this scale factor to increase/decrease size
    this.BOX_OPEN_TIME = 2500
    //detection factor
    this.PIXEL_NOSE_MOVE_BETWEEN_FRAME_ALLOWED = 100 //allowed distance of nose travel between frame
    this.SCALE_DIFF_ALLOW_FOR_FACE_SPACE = 1.7 //allowed facespace(nose-> lefteye) range between frame
    this.NOT_PRESENCE_FRAME_COUNT = 30 //allowed frame for user to not presence before delete user
    //-----------------------
    //Game Value
    this.video
    this.labelDiv
    this.poseNet
    this.poses = []
    this.results = []
    this.usersOnScreen = []
    this.userHistoryCount = 0

    //internal setup
    this.preload()
    this.setup()

    //Output(required)
    this.output = this.canvas
    this.ready = true
  }

  preload() {
    this.img_top = this.p5.loadImage('assets_game/mlxCleanOceanGame/top.png')
    this.img_base = this.p5.loadImage('assets_game/mlxCleanOceanGame/baselayer.png')
    this.img_boat = this.p5.loadImage('assets_game/mlxCleanOceanGame/boat.png')
    this.img_bin = this.p5.loadImage('assets_game/mlxCleanOceanGame/bin.png')
    this.img_logo = this.p5.loadImage('assets_game/mlxCleanOceanGame/whalelogo.png')
    this.img_waiting = this.p5.loadImage('assets_game/mlxCleanOceanGame/waiting.png')
    this.s_pickup = this.p5.loadSound('assets_game/mlxCleanOceanGame/pickup.mp3')
    this.s_collect = this.p5.loadSound('assets_game/mlxCleanOceanGame/collect.mp3')
    this.s_music = this.p5.loadSound('assets_game/mlxCleanOceanGame/music.mp3')
    for (var i = 0; i < 10; i++) {
      this.trashImage[i] = this.p5.loadImage('assets_game/mlxCleanOceanGame/trash' + (i + 1) + '.png')
    }
  }

  setup() {
    //createCanvas(786, 500);
    this.gp = this.p5.createGraphics(786, 500)
    /*
    this.video = createCapture(VIDEO);
    this.video.hide();
    this.poseNet = ml5.poseNet(this.video, this.modelReady);
    this.poseNet.on('pose', (results) => {
      //console.log(results)
      this.poses.length = 0;
      for (var i = 0; i < results.length; i++) {
        if (results[i].pose.score >= 0.15) //only pose with score > 0.15 is calculate
        {
          this.poses.push(results[i]);
          for (var j = 0; j < this.poses[this.poses.length - 1].pose.keypoints.length; j++) {
            this.poses[this.poses.length - 1].pose.keypoints[j].position.x *= (this.gp.width / this.video.width);
            this.poses[this.poses.length - 1].pose.keypoints[j].position.y *= (this.gp.height / this.video.height);
          }
        }
      }
      this.MatchUserFromNosePose();
    });
	*/
    this.wave = new mlxCleanOceanGameWave(this)
    this.wave2 = new mlxCleanOceanGameWave(this)
    this.boat = new mlxCleanOceanGameBoat(this)
    this.showLogoTime = 8000

    //copyright notice
    console.log('Some Game Graphics usage under Premium Freepik License(Commercial License) from Freepik.com')
  }

  doProcess() {
    this.results = this.inElement.output
    this.getKeypoints() //process data

    this.busy = false
    this.outputIsReady = true
    this.output = this.inElement.output
    this.inElement.outputIsReady = false
    this.alreadyRunInLoop = true
    return true
  }

  getKeypoints() {
    this.poses.length = 0
    for (var i = 0; i < this.results.length; i++) {
      if (this.results[i].pose.score >= 0.15) {
        //only pose with score > 0.15 is calculate
        this.poses.push(this.results[i])
        for (var j = 0; j < this.poses[this.poses.length - 1].pose.keypoints.length; j++) {
          this.poses[this.poses.length - 1].pose.keypoints[j].position.x *=
            this.gp.width / this.inElement.inElement.videoCapture.width
          this.poses[this.poses.length - 1].pose.keypoints[j].position.y *=
            this.gp.height / this.inElement.inElement.videoCapture.height
        }
      }
    }
    this.MatchUserFromNosePose()
  }

  draw(p5) {
    if (!this.lockCanvasToThisElement) super.draw(p5)
    //check if has video input
    //if has then play game
    if (this.inElement != null && this.inElement.inElement != null && this.inElement.inElement.videoCapture != null) {
      //Video&Skeleton
      if (!this.gameConnected) {
        //reset game
        this.showLogoTime = 8000
        this.gameConnected = true
      }
      this.gp.push()
      if (this.inElement.inElement.flip) {
        this.gp.scale(-1, 1) //flip video
        this.gp.translate(0 - this.canvas_w, 0)
      }
      this.gp.imageMode(this.p5.CORNER)
      this.gp.image(this.inElement.inElement.videoCapture, 0, 0, this.canvas_w, this.canvas_h)
      this.gp.pop()

      //Game Draw
      this.drawGame()
    } else {
      //no video input
      this.precanvas.push()
      this.precanvas.imageMode(this.p5.CORNER)
      this.precanvas.image(this.img_waiting, 0, 0, this.canvas_w, this.canvas_h)
      this.precanvas.pop()
      this.gameConnected = false
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

  drawGame() {
    //Draw Video
    var width = this.gp.width
    var height = this.gp.height
    this.gp.push()
    /*
    this.gp.scale(-1, 1)
    this.gp.translate(0 - width, 0);
    this.gp.image(this.video, 0, 0, width, height);
	*/
    if (this.DEBUG) {
      this.drawKeypoints()
      //this.drawSkeleton();
    }
    this.gp.pop()
    //Draw UI
    this.gp.push()
    this.gp.image(this.img_top, 0, 0)
    this.gp.image(this.img_base, 0, this.img_top.height)
    this.gp.pop()
    this.gp.push()
    //Draw Wave
    this.wave.draw(this.gp, true)
    this.wave2.draw(this.gp, false)
    this.boat.draw(this.gp)
    //verify user
    //any redundant user on the same pos will be deleted
    for (var j = this.usersOnScreen.length - 1; j >= 0; j--) {
      for (var i = 0; i < this.usersOnScreen.length; i++) {
        if (j != i && this.usersOnScreen[j].currentpose == this.usersOnScreen[i].currentpose) {
          this.usersOnScreen.splice(j, 1)
          break
        }
      }
    }
    //remove user that left scene
    for (var j = this.usersOnScreen.length - 1; j >= 0; j--) {
      if (this.usersOnScreen[j].waitForRemoved) {
        this.usersOnScreen.splice(j, 1)
      }
    }
    //now draw user
    for (var i = 0; i < this.usersOnScreen.length; i++) {
      this.usersOnScreen[i].draw(this.gp)
    }
    this.gp.pop()
    //show logo for 8 sec
    if (this.showLogoTime > 0) {
      this.gp.push()
      this.showLogoTime -= this.p5.deltaTime
      this.gp.imageMode(this.p5.CENTER)
      this.gp.image(this.img_logo, width / 2, height / 2)
      this.gp.pop()
      if (this.showLogoTime - this.p5.deltaTime < 0) {
        this.s_music.play()
      }
    }
    this.precanvas.push()
    this.precanvas.imageMode(this.p5.CORNER)
    this.precanvas.image(this.gp, 0, 0, this.canvas_w, this.canvas_h)
    this.precanvas.pop()
  }

  MatchUserFromNosePose() {
    //compare pose to current user
    var avilablePos = this.poses.map((x) => x)
    for (var i = 0; i < this.usersOnScreen.length; i++) {
      var index = this.usersOnScreen[i].matchUserWithPose()
      if (index != -1) {
        for (var j = 0; j < avilablePos.length; j++) {
          if (avilablePos[j] == this.poses[index]) {
            avilablePos.splice(j, 1)
            break
          }
        }
      }
    }
    for (var i = 0; i < avilablePos.length; i++) {
      //recheck if pose is not assign to other
      //create new user
      this.usersOnScreen[this.usersOnScreen.length] = new mlxCleanOceanGameUser(
        this,
        this.userHistoryCount,
        avilablePos[i]
      )
      this.userHistoryCount++
    }
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
    this.canvas.resizeCanvas(this.canvas_w, this.canvas_h)
    this.fullscreen = false
  }

  enterFullScreen() {
    super.enterFullScreen()
    this.fullscreen = true
    this.fullscreen_scale = this.contentW / this.canvas_w
    var scale_h = (this.h - 110) / this.canvas_h
    if (this.fullscreen_scale > scale_h) this.fullscreen_scale = scale_h
    this.canvas.resizeCanvas(this.canvas_w * this.fullscreen_scale, this.canvas_h * this.fullscreen_scale)
  }

  //==============================
  // Delegate
  //==============================

  // A function to draw ellipses over the detected keypoints
  drawKeypoints() {
    // Loop through all the poses
    //console.log(poses);
    for (let i = 0; i < this.poses.length; i++) {
      // For each pose detected, loop through all the keypoints
      let pose = this.poses[i].pose
      for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j]
        // Only draw an ellipse is the pose probability is bigger than 0.15
        if (keypoint.score > 0.05) {
          this.gp.fill(255, 0, 0)
          this.gp.noStroke()
          this.gp.ellipse(keypoint.position.x, keypoint.position.y, 10, 10)
        }
      }
    }
  }

  // A function to draw the skeletons
  drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < this.poses.length; i++) {
      let skeleton = this.poses[i].skeleton
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0]
        let partB = skeleton[j][1]
        this.gp.stroke(255, 0, 0)
        this.gp.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y)
      }
    }
  }
}
//==============================
// Boat
//==============================
class mlxCleanOceanGameBoat {
  constructor(mlxParent) {
    this.parent = mlxParent
    this.p5 = this.parent.p5
    this.v1 = this.p5.createVector(0, 103 - this.parent.img_boat.height / 2)
    this.v2 = this.p5.createVector(514, 103 - this.parent.img_boat.height / 2)
    this.totalTime = 0
    this.reverse = false
  }

  draw(gp) {
    this.totalTime += this.p5.deltaTime
    if (this.totalTime > 100000) {
      this.reverse = !this.reverse
      this.totalTime = 0
    }
    gp.push()
    gp.imageMode(this.p5.CENTER)
    if (this.reverse) {
      var v = (this.v1.x - this.v2.x) * (this.totalTime / 100000) + this.v2.x
      gp.scale(-1.0, 1.0)
      gp.image(this.parent.img_boat, -v, 103 - this.parent.img_boat.height / 2)
    } else {
      var v = (this.v2.x - this.v1.x) * (this.totalTime / 100000) + this.v1.x
      gp.image(this.parent.img_boat, v, 103 - this.parent.img_boat.height / 2)
    }
    gp.pop()
  }
}
//==============================
// Wave
//==============================
class mlxCleanOceanGameWave {
  constructor(mlxParent) {
    this.parent = mlxParent
    this.p5 = this.parent.p5
    this.amplitude = 20
    this.totalTime = this.p5.random(50)
  }

  draw(gp, useSin) {
    //create wave object
    this.totalTime += this.p5.deltaTime
    gp.push()
    gp.noStroke()
    gp.fill(0, 60, 93, 80)
    gp.beginShape()
    for (var i = 0; i < 15; i++) {
      var h = useSin
        ? this.p5.sin((this.totalTime / 2000) * (i + 1)) * 15
        : this.p5.cos((this.totalTime / 2000) * (i + 1)) * 15
      if (i == 0 || i == 14) {
        gp.vertex((786 / 14) * i, 103 + this.amplitude + h)
      } else {
        gp.curveVertex((786 / 14) * i, 103 + this.amplitude + h)
      }
    }
    gp.vertex(900, 103 + this.amplitude)
    gp.vertex(786, 103 + 398)
    gp.vertex(0, 103 + 398)
    gp.endShape(this.p5.CLOSE)
    gp.pop()
  }
}
//==============================
// User
//==============================
class mlxCleanOceanGameUser {
  constructor(mlxParent, ucount, pose) {
    this.parent = mlxParent
    this.p5 = this.parent.p5
    this.userCount = ucount
    this.ticklingTime = this.parent.TICKLING_TIME
    this.number = ('000' + ucount).substr(-3)
    this.currentState = 'NOTRECEIVED' //"NOTRECEIVED" , "ANIMATED" , "RECEIVED"
    this.currentpose = pose
    this.waitForRemoved = false
    this.notPresentFrameCount = this.parent.NOT_PRESENCE_FRAME_COUNT
    this.nosepos = null
    this.facespace = null
    this.color = this.p5.color(this.p5.random(100), this.p5.random(100), this.p5.random(100))
    this.trashRandom = this.p5.floor(this.p5.random(10))
  }

  draw(gp) {
    if (this.waitForRemoved) return
    if (this.currentState == 'NOTRECEIVED') {
      //not yet received
      //draw box on head
      gp.push()
      if (this.facespace != null) {
        //console.log(this.facespace);
        gp.translate(this.nosepos.x, this.nosepos.y - this.facespace * 3.5)
        gp.imageMode(this.p5.CENTER)
        var bdimension = this.facespace * 6 * this.parent.BOX_SCALE
        gp.image(this.parent.trashImage[this.trashRandom], 0, -bdimension / 2)
        //gp.tint(this.color);
        // gp.image(this.parent.trashImage[0], -(bdimension / 2), -bdimension, bdimension, bdimension);
      }
      gp.pop()
      //check collide
      var isCollide = this.handCollideWithBox(gp)
      if (this.ticklingTime > 0 && isCollide) {
        this.ticklingTime -= this.p5.deltaTime
        //draw timebar on box
        this.parent.s_collect.play()
        gp.push()
        gp.translate(this.nosepos.x, this.nosepos.y - this.facespace * 3.5)
        gp.rectMode(this.p5.CORNER)
        gp.noStroke()
        gp.fill(0, 0, 0)
        gp.rect(-30, -15, 60, 15)
        gp.fill(0, 255, 0)
        gp.rect(-26, -12, 54 * (this.ticklingTime / this.parent.TICKLING_TIME), 9)
        gp.pop()
        if (this.ticklingTime < 0) {
          this.ticklingTime = this.parent.BOX_OPEN_TIME //show box open time
          this.currentState = 'ANIMATED' //change state to animated
          this.parent.s_pickup.play()
        }
      }
    } else if (this.currentState == 'ANIMATED') {
      //show animation effect
      this.ticklingTime -= this.p5.deltaTime
      gp.push()
      if (this.facespace != null) {
        //console.log(this.facespace);
        gp.translate(this.nosepos.x, this.nosepos.y - this.facespace * 3.5)
        gp.imageMode(this.p5.CENTER)
        var bdimension = this.facespace * 6 * this.parent.BOX_SCALE
        gp.image(this.parent.img_bin, 0, -bdimension / 2)
      }
      gp.pop()
      if (this.ticklingTime < 0) {
        this.currentState = 'RECEIVED'
      }
    } else if (this.currentState == 'RECEIVED') {
      //draw code on head
      gp.push()
      if (this.facespace != null) {
        //console.log(this.facespace);
        gp.translate(this.nosepos.x, this.nosepos.y - this.facespace * 5)
        gp.stroke(255)
        gp.strokeWeight(4)
        gp.textFont('Georgia')
        gp.textAlign(this.p5.CENTER)
        gp.textSize(25)
        gp.fill(this.color)
        gp.text('thanks for keep our Ocean Clean', -100, -35, 200, 70)
      }
      gp.pop()
    }
  }

  matchUserWithPose() {
    //compare nose position & face triangle size
    //if size is not much different then assume that it is a same person
    var width = this.parent.gp.width
    var height = this.parent.gp.height
    this.nosepos = this.p5.createVector(
      width - this.currentpose.pose.keypoints[0].position.x,
      this.currentpose.pose.keypoints[0].position.y
    ) //nose = 0
    var eyepos = this.p5.createVector(
      width - this.currentpose.pose.keypoints[1].position.x,
      this.currentpose.pose.keypoints[1].position.y
    ) //leftEye = 1
    //create distance array
    var dists = []
    for (var i = 0; i < this.parent.poses.length; i++) {
      //console.log(typeof nosepos);
      //console.log(typeof poses[i].pose.keypoints[0].position);
      dists.push(
        this.dist(
          this.p5.createVector(this.nosepos.x, this.nosepos.y),
          this.p5.createVector(
            width - this.parent.poses[i].pose.keypoints[0].position.x,
            this.parent.poses[i].pose.keypoints[0].position.y
          )
        )
      )
    }
    var indexOfMaxValue = dists.reduce((iMin, x, m, arr) => (x < arr[iMin] ? m : iMin), 0) //find min value index
    if (dists[indexOfMaxValue] < this.parent.PIXEL_NOSE_MOVE_BETWEEN_FRAME_ALLOWED) {
      //within allow bound
      //check if nose/eye position is within range
      this.facespace = this.dist(
        this.p5.createVector(eyepos.x, eyepos.y),
        this.p5.createVector(this.nosepos.x, this.nosepos.y)
      ) //distance between nose and eye
      var posFacespace = this.dist(
        this.p5.createVector(
          width - this.parent.poses[indexOfMaxValue].pose.keypoints[0].position.x,
          this.parent.poses[indexOfMaxValue].pose.keypoints[0].position.y
        ),
        this.p5.createVector(
          width - this.parent.poses[indexOfMaxValue].pose.keypoints[1].position.x,
          this.parent.poses[indexOfMaxValue].pose.keypoints[1].position.y
        )
      )
      if (this.p5.abs(posFacespace / this.facespace) <= this.parent.SCALE_DIFF_ALLOW_FOR_FACE_SPACE) {
        //set new pose
        this.currentpose = this.parent.poses[indexOfMaxValue]
        this.notPresentFrameCount = this.parent.NOT_PRESENCE_FRAME_COUNT
        return indexOfMaxValue //return index
      }
    }
    this.notPresentFrameCount--
    if (this.notPresentFrameCount <= 0) this.waitForRemoved = true
    return -1 //no match found;
  }

  dist(v1, v2) {
    return this.p5.sqrt(this.p5.pow(v2.x - v1.x, 2) + this.p5.pow(v2.y - v1.y, 2))
  }

  handCollideWithBox(gp) {
    var width = this.parent.gp.width
    var height = this.parent.gp.height
    //create L&R wrist position
    var posL = null
    var posR = null
    if (this.currentpose.pose.keypoints[9].score > 0.2) {
      posL = this.p5.createVector(
        width - this.currentpose.pose.keypoints[9].position.x,
        this.currentpose.pose.keypoints[9].position.y
      )
      if (this.parent.DEBUG) {
        gp.push()
        gp.ellipseMode(this.p5.CENTER)
        gp.ellipse(posL.x, posL.y, this.facespace * 5, this.facespace * 5)
        gp.pop()
      }
    }
    if (this.currentpose.pose.keypoints[10].score > 0.2) {
      posR = this.p5.createVector(
        width - this.currentpose.pose.keypoints[10].position.x,
        this.currentpose.pose.keypoints[10].position.y
      )
      if (this.parent.DEBUG) {
        gp.push()
        gp.ellipseMode(this.p5.CENTER)
        gp.ellipse(posR.x, posR.y, this.facespace * 5, this.facespace * 5)
        gp.pop()
      }
    }
    //now check collide
    var bdimension = this.facespace * 6 * this.parent.BOX_SCALE
    var radius = this.facespace * 5
    if (this.parent.DEBUG) {
      gp.push()
      gp.rectMode(this.p5.CORNERS)
      gp.fill(0, 0, 255, 50)
      if (this.nosepos != null) {
        gp.rect(
          this.nosepos.x - bdimension / 2,
          this.nosepos.y - this.facespace * 3.5 - bdimension,
          this.nosepos.x + bdimension / 2,
          this.nosepos.y - this.facespace * 3.5
        )
      }
      gp.pop()
    }
    if (
      (posL != null &&
        this.nosepos != null &&
        this.intersects(
          posL.x,
          posL.y,
          radius,
          this.nosepos.x - bdimension / 2,
          this.nosepos.y - this.facespace * 3.5 - bdimension,
          this.nosepos.x + bdimension / 2,
          this.nosepos.y - this.facespace * 3.5
        )) ||
      (posR != null &&
        this.nosepos != null &&
        this.intersects(
          posR.x,
          posR.y,
          radius,
          this.nosepos.x - bdimension / 2,
          this.nosepos.y - this.facespace * 3.5 - bdimension,
          this.nosepos.x + bdimension / 2,
          this.nosepos.y - this.facespace * 3.5
        ))
    ) {
      return true
    }

    return false
  }

  intersects(cx, cy, radius, left, top, right, bottom) {
    var closestX = cx < left ? left : cx > right ? right : cx
    var closestY = cy < top ? top : cy > bottom ? bottom : cy
    var dx = closestX - cx
    var dy = closestY - cy

    return dx * dx + dy * dy <= radius * radius
  }
}

module.exports = {
  mlxCleanOceanGame,
}
