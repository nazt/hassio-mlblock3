// window.p5 = p5
// import 'p5/lib/addons/p5.sound'

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

const csv = require('csvtojson')
//import 'p5/lib/addons/p5.sound.js';

class mlxVideoCapture extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'VideoCapture'
    this.title = 'Video Capture'

    this.inType = 'none'
    this.outType = 'image'

    this.replaceImage = null

    this.contentAspectRatio = 16 / 9
    this.contentX = this.mlx.mlxPadding
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.contentW = 320
    this.contentH = this.contentW / this.contentAspectRatio
    this.contentScale = 1.0

    this.setElementSizeByContentSize()

    this.resizable = true
    this.flip = true
    this.cameraMode = 0
    this.facingMode = 'user'
    this.needMouse = true
    this.autoMaximize = false

    this.createElementMenu()

    this.isVideoCaptureReady = false

    this.doCaptureScreen = false //do capture screen after all draw

    this.constraints = {
      audio: false,
      video: {
        facingMode: this.facingMode,
      },
    }
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.constraints.video.aspectRatio = 16.0 / 9.0
    }

    this.doCreateVideoCapture()
    console.log('video capture ready')

    this.flipButton = this.mlx.createButton(
      this,
      'Camera',
      () => {
        //alert(!this.cameraMode);
        this.switchCamera(!this.cameraMode)
      },
      10 + this.mlx.mlxPadding,
      this.h - 10 - 22 - this.mlx.mlxPadding,
      80,
      22
    )
    this.flipButton.border = true
    this.flipButton.hidden = true

    this.outputIsReady = true
    this.busy = false

    //shutter sound for screen capture
    console.log('>>', this.p5.loadSound)
    console.log('>>', this.p5.loadSound)
    console.log('>>', this.p5.soundFormats)
    // this.beepSound = this.p5.loadSound('/assets/shutterbeep.mp3')
    // this.shutterSound = this.p5.loadSound('/assets/shuttersound.mp3')
    // debugger
  }

  doCreateVideoCapture() {
    if (this.ready) {
      this.videoCapture.remove()
    }
    try {
      this.ready = false
      this.videoCapture = this.mlx.p5.createCapture(this.constraints, () => {
        this.isVideoCaptureReady = true

        this.videoRawWidth = this.videoCapture._pixelsState.width
        this.videoRawHeight = this.videoCapture._pixelsState.height
        this.contentAspectRatio = this.videoRawWidth / this.videoRawHeight
        this.videoWidth = this.w - this.mlx.mlxPadding * 2
        this.videoHeight = this.videoWidth / this.contentAspectRatio

        this.videoCapture.size(this.videoWidth, this.videoHeight)
        this.videoCapture.hide()

        this.contentW = this.videoWidth
        this.contentH = this.videoHeight

        this.setElementSizeByContentSize()

        if (this.isMaximize) {
          this.scaleContentToFillSize(false)
        }
        if (this.isFullScreen) {
          this.flipButton.yy = this.p5.height - 10 - 22 - this.mlx.mlxPadding
          this.flipButton.hidden = false
        } else {
          this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
        }
        if (this.autoMaximize) {
          this.enterMaximize()
        }
        this.output = this.videoCapture
        this.ready = true
      })
    } catch (err) {
      console.log('ERROR', err)
      this.loading.html('ERROR: ' + err)
      this.ready = false
    }
  }

  save() {
    let data = super.save()
    data.flip = this.flip
    data.autoMaximize = this.autoMaximize
    return data
  }

  load(data) {
    super.load(data)
    this.flip = data.flip
    this.flipMenu.value = this.flip
    if (!data.autoMaximize) {
      this.autoMaximize = false
    } else {
      this.autoMaximize = data.autoMaximize
    }
    this.autoMaxMenu.value = this.autoMaximize
    if (this.autoMaximize) {
      this.lockMaximize = true
      this.enterMaximize()
    }
  }

  setVideoCaptureSize() {
    this.videoWidth = this.contentW
    this.videoHeight = this.contentH
    this.videoCapture.size(this.videoWidth, this.videoHeight)
    console.log(this.videoWidth, this.videoHeight)
  }

  resizeByMouse() {
    super.resizeByMouse()
    this.setVideoCaptureSize()
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
  }

  endFullScreen() {
    super.endFullScreen()
    this.setVideoCaptureSize()
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
    this.flipButton.hidden = true
  }

  enterFullScreen() {
    super.enterFullScreen()
    this.setVideoCaptureSize()
    if (this.isFullScreen) {
      this.flipButton.yy = this.p5.height - 10 - 22 - this.mlx.mlxPadding
    } else {
      this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
    }

    this.doCreateVideoCapture()
  }

  enterMaximize() {
    super.enterMaximize()
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
    this.flipButton.hidden = false
  }

  exitMaximize() {
    super.exitMaximize()
    this.isMaximize = false
    this.maxMenu.value = false
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding
    this.flipButton.hidden = true
  }

  captureScreen() {
    this.captureCountdown = 2999
    this.captureBeepCountdown = 0
    this.doCaptureScreen = true
  }

  switchCamera(value) {
    this.cameraMode = value
    if (value == 0) {
      this.face = 'user'
      this.constraints = {
        audio: false,
        video: {
          facingMode: this.face,
        },
      }
      this.flip = true
    } else {
      this.face = 'environment'
      this.constraints = {
        audio: false,
        video: {
          facingMode: {
            exact: this.face,
          },
        },
      }
      this.flip = false
    }
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.constraints.video.aspectRatio = 16.0 / 9.0
    }
    this.doCreateVideoCapture()
  }

  createElementMenu() {
    let menu = this._createMenu()

    menu.addCommand('Full screen', (ui) => {
      this.hideMenu()
      this.enterFullScreen()
    })
    this.maxMenu = menu.addCheckedMenu('Maximize', this.isMaximize, (ui, value) => {
      this.hideMenu()
      this.isMaximize = value
      if (this.isMaximize) {
        this.enterMaximize()
      } else {
        this.exitMaximize()
      }
    })
    this.autoMaxMenu = menu.addCheckedMenu('Auto Maximize', this.autoMaximize, (ui, value) => {
      this.hideMenu()
      this.autoMaximize = value
    })
    menu.addSeparator()

    menu.addCommand('Capture Canvas', (ui) => {
      this.hideMenu()
      this.captureScreen()
    })
    menu.addSeparator()
    //if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
      this.cameraMenu = menu.addSelectMenu(['Front camera', 'Back camera'], this.cameraMode, (ui, value) => {
        //console.log('selected', value);
        this.hideMenu()
        this.switchCamera(value)
      })
      menu.addSeparator()
    }

    this.flipMenu = menu.addCheckedMenu('Flip', this.flip, (ui, value) => {
      //console.log('filp command');
      this.hideMenu()
      this.flip = value
    })
    menu.addSeparator()

    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  remove() {
    //console.log("RemoveVideo");
    if (this.videoCapture) {
      this.videoCapture.stop()
      if (this.isVideoCaptureReady) {
        this.videoCapture.remove()
      }
      this.videoCapture = null
    }
    super.remove()
  }

  doProcess() {
    this.busy = false
    this.outputIsReady = true
    this.alreadyRunInLoop = true
    return true
  }

  doDraw(p5) {
    if (this.backgroundImage) {
      p5.image(this.backgroundImage, this.x + this.contentX, this.y + this.contentY, this.contentW, this.contentH)
    }
    if (this.replaceImage) {
      p5.image(this.replaceImage, this.x + this.contentX, this.y + this.contentY, this.contentW, this.contentH)
    } else {
      p5.image(this.videoCapture, this.x + this.contentX, this.y + this.contentY, this.contentW, this.contentH)
    }
  }

  draw(p5) {
    super.draw(p5)

    if (this.ready) {
      if (!this.noDraw) {
        p5.push()
        if (this.flip) {
          p5.translate((this.x + this.contentX) * 2 + this.contentW, 0)
          p5.scale(-1, 1)
        }
        this.doDraw(p5)
        p5.pop()
      }
      if (this.extraDraw) {
        this.extraDraw.doExtraDraw(p5, this.extraDraw)
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
          p5.push()
          p5.fill(255)
          p5.textSize(40)
          p5.text(
            p5.floor(this.captureCountdown / 1000) + 1,
            this.x + this.contentX + this.contentW - 50,
            this.y + this.contentY,
            50,
            50
          )
          p5.pop()
        } else {
          //since p5 is already manipulated by user scale/transition
          //we create new graphic with same p5's size and redraw this frame all over again
          if (this.shutterSound != null && this.shutterSound.isLoaded()) this.shutterSound.play()
          p5.push()
          p5.resetMatrix()
          p5.translate(0, 0)
          p5.scale(1)
          var capCanvas = p5.createGraphics(p5.width, p5.height)
          if (!this.noDraw) {
            capCanvas.push()
            if (this.flip) {
              capCanvas.translate((this.x + this.contentX) * 2 + this.contentW, 0)
              capCanvas.scale(-1, 1)
            }
            this.doDraw(capCanvas)
            capCanvas.pop()
          }
          if (this.extraDraw) {
            this.extraDraw.doExtraDraw(capCanvas, this.extraDraw)
          }
          var capImage = capCanvas.get(this.x + this.contentX, this.y + this.contentY, this.contentW, this.contentH)
          capImage.save('myVideoCanvas.jpg')
          p5.pop()
          this.doCaptureScreen = false
        }
      }
    }
  }

  mousePressed() {
    super.mousePressed()
    if (this.p5.touches.length == 3) {
      this.exitMaximize()
    }
  }
}

class mlxDrawCanvas extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'DrawCanvas'
    this.title = 'Draw Canvas'

    this.inType = 'none'
    this.outType = 'image'

    this.createElementMenu()
    this.needMouse = true

    this.canvasSize = 280

    this.offScreenX = this.mlx.mlxPadding
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.offScreen = this.mlx.createCanvas(this, this.offScreenX, this.offScreenY, this.canvasSize, this.canvasSize)
    this.canvas = this.offScreen.offScreen
    this.canvas.strokeWeight(10)
    this.canvas.stroke(0)

    this.w = this.canvasSize + this.mlx.mlxPadding * 2
    this.h = this.canvasSize + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2

    this.output = this.canvas
    this.ready = true

    this.currentData = false
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Clear', (ui) => {
      this.hideMenu()
      this.canvas.background(255)
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  doProcess() {
    this.alreadyRunInLoop = true
    this.outputIsReady = true
    return true
  }

  draw(p5) {
    super.draw(p5)
  }

  mousePressed() {
    this.busy = true
    console.log('Mouse Pressed')
    this.pmouseX = this.mlx.mouseX - this.offScreenX - this.x
    this.pmouseY = this.mlx.mouseY - this.offScreenY - this.y
    this.canvas.line(this.pmouseX - 1, this.pmouseY, this.pmouseX, this.pmouseY)
    return false
  }

  mouseReleased() {
    this.busy = false
  }

  mouseMoved() {}

  mouseDragged() {
    let x = this.mlx.mouseX - this.offScreenX - this.x
    let y = this.mlx.mouseY - this.offScreenY - this.y

    this.canvas.line(this.pmouseX, this.pmouseY, x, y)
    this.pmouseX = x
    this.pmouseY = y
  }
}

class mlxMouseInput extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = '2DCoord'

    this.inType = 'none'
    this.outType = 'tensor'

    console.log('2D Coord')
    this.title = '2D Point Generator'
    this.createElementMenu()
    this.needMouse = true

    this.canvasSize = 280
    this.isTraining = false
    this.needMouse = true
    this.needResults = this.getResults

    this.trainingData = []
    this.activeData = null

    this.currentLabel = 'A'

    this.w = this.canvasSize + this.mlx.mlxPadding * 2
    this.h = this.canvasSize + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 + 32

    this.trainCheckbox = this.mlx.createCheckBox(
      this,
      'train',
      (ui, value) => {
        this.isTraining = value
        if (!this.isTraining) {
          this.createBackgroundMap()
        }
      },
      this.isTraining,
      this.mlx.mlxPadding,
      this.mlx.mlxCaptionHeight + 10,
      100,
      20
    )
    this.trainCheckbox.showBox = true

    this.dropdownLabel = this.mlx.createDropdownButton(
      this,
      'A',
      ['A', 'B', 'C', 'D', 'E'],
      (ui, value) => {
        this.currentLabel = value
      },
      this.w - this.mlx.mlxPadding - 60,
      this.mlx.mlxCaptionHeight + 10,
      60,
      20
    )

    this.offScreenX = this.mlx.mlxPadding
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding + 32
    this.offScreen = this.mlx.createCanvas(this, this.offScreenX, this.offScreenY, this.canvasSize, this.canvasSize)
    this.canvas = this.offScreen.offScreen
    this.canvas.strokeWeight(1)
    this.canvas.stroke(0)
    this.canvas.fill(0)

    this.color = {
      A: this.p5.color(255, 192, 192),
      B: this.p5.color(192, 255, 192),
      C: this.p5.color(192, 192, 255),
      D: this.p5.color(192, 255, 255),
      E: this.p5.color(255, 255, 192),
    }

    this.resenndTrainingData = false
    this.sendingTrainingDataIndex = -1

    this.data = []
    this.output = []
    this.ready = true
    this.backgroundMap = this.p5.createGraphics(this.canvasSize, this.canvasSize)
    this.backgroundMap.background(255)
  }

  getResults(results) {
    //console.log(results, this.activeData);
    if (this.activeData && results.data[0] === this.activeData.data[0] && results.data[1] === this.activeData.data[1]) {
      this.activeData.label = results.label
      if (results.distances) {
        this.activeData.distances = results.distances
        //console.log(this.activeData.distances);
      }
      //console.log(this.activeData);
    }
  }

  save() {
    let data = super.save()
    data.trainingData = this.trainingData
    return data
  }

  load(data) {
    super.load(data)
    this.trainingData = data.trainingData
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Clear', (ui) => {
      this.hideMenu()
      this.trainingData = []
    })
    menu.addSeparator()
    menu.addCommand('Load data...', (ui) => {
      this.hideMenu()
      showOpenDialog(this.type, 'data', (data) => {
        console.log('Open', data)
        if (data && data.data) {
          this.trainingData = JSON.parse(data.data)
        }
      })
    })
    menu.addCommand('Save data...', (ui) => {
      this.hideMenu()
      showSaveDialog(this.type, 'data', this.trainingData, false, () => {
        console.log('Saved')
      })
    })
    menu.addSeparator()
    menu.addCommand('Resend Training Data', (ui) => {
      this.hideMenu()
      this.resendTrainingData = true
      this.sendingTrainingDataIndex = 0
    })
    menu.addCommand('Update Inference Map', (ui) => {
      this.hideMenu()
      this.createBackgroundMap()
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  refresh() {
    this.createBackgroundMap()
  }

  createBackgroundMap() {
    if (!this.isTraining && this.outElement && this.outElement.classify) {
      let step = 10
      this.backgroundMap.noStroke()
      this.backgroundMap.background(255)
      //this.backgroundMap.translate(this.canvasSize / 2, this.canvasSize / 2);
      let datas = []
      for (var y = 0; y < this.canvasSize; y += 10) {
        for (var x = 0; x < this.canvasSize; x += 10) {
          datas.push([x + step / 2 - this.canvasSize / 2, y + step / 2 - this.canvasSize / 2])
        }
      }
      if (this.outElement.classifyMultiple) {
        this.outElement.classifyMultiple(datas, (results) => {
          this.backgroundMap.push()
          let i = 0
          for (var y = 0; y < this.canvasSize; y += 10) {
            for (var x = 0; x < this.canvasSize; x += 10) {
              this.backgroundMap.fill(this.color[results[i][0].label])
              this.backgroundMap.rect(x, y, step, step)
              i++
            }
          }
          this.backgroundMap.pop()
        })
      } else {
        for (let i in datas) {
          let data = datas[i]
          this.outElement.classify(data, (results) => {
            //console.log(results);
            let x = results.data[0] + this.canvasSize / 2 - step / 2
            let y = results.data[1] + this.canvasSize / 2 - step / 2
            this.backgroundMap.fill(this.color[results.label])
            this.backgroundMap.rect(x, y, step, step)
          })
        }
      }
    }
  }

  doProcess() {
    if (this.resenndTrainingData) {
      if (this.sendingTrainingDataIndex >= this.trainingData.length) {
        this.resenndTrainingData = false
      } else {
        let data = this.trainingData[this.sendingTrainingDataIndex++]
        this.output = data
        this.outputIsReady = true
      }
    }
    this.busy = false
    this.alreadyRunInLoop = true
    return true
  }

  draw(p5) {
    super.draw(p5)
    this.canvas.background(255)
    this.canvas.textSize(10)

    if (!this.isTraining) {
      this.canvas.image(this.backgroundMap, 0, 0)
    }

    this.canvas.push()
    this.canvas.translate(this.canvasSize / 2, this.canvasSize / 2)
    if (this.activeData) {
      let t = this.activeData
      let x = t.data[0]
      let y = t.data[1]
      if (t.distances) {
        for (let di in t.distances) {
          let d = t.distances[di]
          this.canvas.strokeWeight(5)
          this.canvas.stroke(this.color[d.label])
          this.canvas.line(x, y, d.rdata[0], d.rdata[1])
          this.canvas.strokeWeight(1)
          this.canvas.stroke(0)
          this.canvas.line(x, y, d.rdata[0], d.rdata[1])
        }
      }
    }

    for (var i in this.trainingData) {
      let t = this.trainingData[i]
      let x = t.data[0]
      let y = t.data[1]
      this.canvas.fill(this.color[t.label])
      this.canvas.stroke(0)
      this.canvas.ellipse(x, y, 16, 16)
      this.canvas.noStroke()
      this.canvas.fill(0)
      this.canvas.textAlign(this.p5.CENTER, this.p5.CENTER)
      this.canvas.text(t.label, x, y)
    }
    if (this.activeData) {
      let t = this.activeData
      let x = t.data[0]
      let y = t.data[1]
      if (t.label) {
        this.canvas.fill(this.color[t.label])
        this.canvas.stroke(0)
        this.canvas.ellipse(x, y, 16, 16)
        this.canvas.noStroke()
        this.canvas.fill(0)
        this.canvas.textAlign(this.p5.CENTER, this.p5.CENTER)
        this.canvas.text(t.label, x, y)
      }
    }
    this.canvas.pop()

    /*
        if (!this.isTraining) {
            this.canvas.fill(255, 255, 255, 192);
            this.canvas.rect(0, 0, this.canvasSize, this.canvasSize);
            this.canvas.fill(0);
            for (var i in this.data) {
                let t = this.data[i];
                let x = t.data[0];
                let y = t.data[1];

                if (t.label) {
                    this.canvas.fill(this.color[t.label]);
                    this.canvas.stroke(0);
                    this.canvas.ellipse(x, y, 16, 16);
                    this.canvas.noStroke();
                    this.canvas.fill(0);
                    this.canvas.textAlign(this.p5.CENTER, this.p5.CENTER);
                    this.canvas.text(t.label, x, y);
                }
                else {
                    this.canvas.rect(x - 3, y - 3, 4, 4);
                }
            }

        }
        */
  }

  mousePressed() {
    if (!super.mousePressed()) return false

    if (
      this.mlx.mouseX >= this.x + this.offScreenX &&
      this.mlx.mouseX <= this.x + this.offScreenX + this.canvasSize &&
      this.mlx.mouseY >= this.y + this.offScreenY &&
      this.mlx.mouseY <= this.y + this.offScreenY + this.canvasSize
    ) {
      this.pmouseX = this.mlx.mouseX - this.offScreenX - this.x
      this.pmouseY = this.mlx.mouseY - this.offScreenY - this.y
      let x = this.mlx.mouseX - this.offScreenX - this.x - this.canvasSize / 2
      let y = this.mlx.mouseY - this.offScreenY - this.y - this.canvasSize / 2
      //
      if (this.isTraining) {
        this.output = { label: this.currentLabel, data: [x, y] }
        this.trainingData.push(this.output)
        //console.log(this.trainingData);
      } else {
        this.output = [x, y]
        this.activeData = { label: null, data: [x, y] }
        this.data.push(this.activeData)
      }
      if (this.outElement) {
        this.outputIsReady = true
      }
      return false
    }
    return true
  }

  mouseReleased() {
    if (this.activeData) {
      this.activeData = null
    }
  }

  mouseMoved() {}

  mouseDragged() {
    if (!super.mousePressed()) return false

    if (
      this.mlx.mouseX >= this.x + this.offScreenX &&
      this.mlx.mouseX <= this.x + this.offScreenX + this.canvasSize &&
      this.mlx.mouseY >= this.y + this.offScreenY &&
      this.mlx.mouseY <= this.y + this.offScreenY + this.canvasSize
    ) {
      this.pmouseX = this.mlx.mouseX - this.offScreenX - this.x
      this.pmouseY = this.mlx.mouseY - this.offScreenY - this.y
      let x = this.mlx.mouseX - this.offScreenX - this.x - this.canvasSize / 2
      let y = this.mlx.mouseY - this.offScreenY - this.y - this.canvasSize / 2
      //
      if (this.isTraining) {
        //this.output = { label: this.currentLabel, data: [x, y] };
        //this.trainingData.push(this.output);
        //console.log(this.trainingData);
      } else {
        //this.output = [x, y];
        if (this.activeData) {
          this.activeData.data[0] = x
          this.activeData.data[1] = y
          this.output = [x, y]
          this.outputIsReady = true
        }
        //this.data.push(this.activeData);
      }
      //this.outputIsReady = true;
      return false
    }
    return true
  }
}

class mlxCSVFileInput extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'CSVFile'

    this.inType = 'none'
    this.outType = 'tensor'

    this.title = 'CSV File Input'
    this.createElementMenu()
    this.needMouse = true
    this.h = 110
    this.w = 200
    this.isTraining = true
    this.resendTrainingData = true
    this.trainingData = []
    this.activeRow = null

    this.contentX = 0 // this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight // + this.mlx.mlxPadding;
    this.contentW = this.w - 1
    this.contentH = this.h - this.mlx.mlxCaptionHeight //this.mlx.mlxPadding
    this.divX = this.contentX + 1
    this.divY = this.contentY
    this.divW = this.contentW - 1
    this.divH = this.contentH - 28
    this.div = mlx.p5.createDiv('Drop CSV here!')
    this.div.size(this.divW, this.divH)
    this.div.position(this.x + this.divX, this.y + this.divY + this.mlx.mlxNavBarHeight)
    this.div.style('background-color', '#CCC')
    this.div.style('text-align', 'center')
    this.div.style('padding', '5px')
    this.div.style('user-select', 'none')

    this.div.elt.addEventListener('dragover', this.dragHover.bind(this))
    this.div.elt.addEventListener('dragleave', this.dragOut.bind(this))
    this.div.elt.addEventListener('drop', this.drop.bind(this))

    this.label = this.mlx.createLabel(this, 'waiting file ...', 10, this.h - 24 - 3, this.w - 20, 24)
    this.trainCheckbox = this.mlx.createCheckBox(
      this,
      'train',
      (ui, value) => {
        this.isTraining = value
      },
      this.isTraining,
      this.w - 60,
      this.h - 20 - 6,
      50,
      20
    )
    this.trainCheckbox.showBox = true
    this.data = []
    this.output = []
    this.ready = false
  }

  save() {
    let data = super.save()
    data.trainingData = this.trainingData
    return data
  }

  load(data) {
    super.load(data)
    this.trainingData = data.trainingData
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Clear', (ui) => {
      this.hideMenu()
      this.trainingData = []
      this.activateUI()
    })
    menu.addSeparator()
    menu.addCommand('Load data...', (ui) => {
      this.hideMenu()
      showOpenDialog(this.type, 'data', (data) => {
        console.log('Open', data)
        if (data && data.data) {
          this.trainingData = JSON.parse(data.data)
        }
      })
      this.activateUI()
    })
    menu.addCommand('Save data...', (ui) => {
      this.hideMenu()
      showSaveDialog(this.type, 'data', this.trainingData, false, () => {
        console.log('Saved')
      })
      this.activateUI()
    })
    menu.addSeparator()
    menu.addCommand('Resend Data', (ui) => {
      this.hideMenu()
      this.resendTrainingData = true
      this.activateUI()
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }
  inactivateUI() {
    this.div.style('display', 'none')
  }
  activateUI() {
    this.div.style('display', 'block')
  }
  dragHover(e) {
    this.div.style('border', '3px solid darkseagreen')
    e.stopPropagation()
    e.preventDefault()
  }
  dragOut(e) {
    this.div.style('border', 'none')
    e.stopPropagation()
    e.preventDefault()
  }

  readFile(fileEntry) {
    return new Promise(function (resolve, reject) {
      fileEntry.file(
        (file) => {
          let reader = new FileReader()
          reader.onload = (evt) => {
            resolve(evt.target.result)
          }
          reader.onerror = function (evt) {
            reject(evt)
          }
          reader.readAsText(file, 'UTF-8')
        },
        (err) => {
          return reject(err)
        }
      )
    })
  }

  drop(e) {
    this.div.style('border', 'none')
    this.data = []
    this.output = []
    this.trainingData = []
    e.stopPropagation()
    e.preventDefault()
    let that = this
    var items = e.dataTransfer.items
    if (items.length == 1) {
      var item = items[0].webkitGetAsEntry()
      if (item && item.isFile) {
        this.readFile(item)
          .then((data) => {
            this.label.setText('Loaded file : ' + item.name)
            return csv({
              //noheader: true,
              trim: true,
              checkType: true,
              //output: 'csv',
            }).fromString(data)
          })
          .then((csvData) => {
            //console.log(csvData);
            let colName = Object.keys(csvData[0])
            let targetColName = colName[colName.length - 1]
            let actualData = csvData.map((row) => ({
              label: row[targetColName],
              data: Object.values(row).slice(0, -1),
            }))
            this.trainingData = actualData
            this.div.style('text-align', 'left')
            this.div.html(
              `Total Cols : ${colName.length}<br>
                            Target Col : ${targetColName}`
            )
            this.ready = true
          })
          .catch((err) => {
            this.div.html('Wrong format CSV')
            that.label.setText('Err:' + err.message)
          })
      }
    }
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
    let xx = this.x + this.divX
    let yy = this.y + this.divY + this.mlx.mlxNavBarHeight / this.mlx.userScale
    xx = xx + this.mlx.userTranslateX + this.mlx.userScaleX / this.mlx.userScale - this.mlx.userScaleX
    yy = yy + this.mlx.userTranslateY + this.mlx.userScaleY / this.mlx.userScale - this.mlx.userScaleY
    this.div.position(xx * this.mlx.userScale, yy * this.mlx.userScale)
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
    this.setPosition(this.x, this.y)
  }

  doProcess() {
    if (this.resendTrainingData && this.outElement) {
      if (this.isTraining) {
        this.output = this.trainingData
      } else {
        this.output = this.trainingData.map((el) => el.data)
      }
      this.outputIsReady = true
      this.resendTrainingData = false
    }
    this.busy = false
    this.alreadyRunInLoop = true
    return true
  }

  draw(p5) {
    super.draw(p5)
  }
}

class mlxImage extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'Image'
    this.title = 'Image'

    this.inType = 'none'
    this.outType = 'image'

    this.imageName = ''

    this.autoResize = true

    this.resizable = true
    this.createElementMenu()
    this.replaceImage = null
    this.backgroundImage = null

    this.contentX = this.mlx.mlxPadding
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.contentW = 200
    this.contentH = 200
    this.contentAspectRatio = 1.0

    this.divX = this.contentX
    this.divY = this.contentY
    this.divW = this.contentW
    this.divH = this.contentH

    this.setElementSizeByContentSize()
    this.h += 18

    this.div = mlx.p5.createDiv()
    this.div.size(this.divW, this.divH)
    this.div.position(this.x + this.divX, this.y + this.divY + this.mlx.mlxNavBarHeight)
    this.div.style('background-color', '#FF000000')
    this.div.style('text-align', 'center')
    this.div.style('font-size', 'x-small')
    this.div.style('display', 'flex')
    this.div.style('vertical-align', 'text-bottom')
    this.div.style('align-items', 'center')
    this.div.html(
      "<p style='margin-top:auto; margin-left:auto; margin-right:auto; margin-bottom:10px;'>Drop file here...</p>"
    )
    this.div.drop((file) => {
      console.log('Got file')
      // If it's an image file
      if (file.type === 'image') {
        this.output = null
        this.outputIsReady = false
        this.img = null
        this.div.html('')
        this.imageName = file.name
        this.labelName.setText(this.imageName)
        // Create an image DOM element but don't show it
        this.img = this.p5.createImg(file.data, 'test').hide()

        this.divW = 0
        this.divH = 0
        this.imgAspectRatio = 1

        if (this.outElement) {
          this.outElement.clearResults()
        }

        //console.log(this.img);
        // Draw the image onto the canvas
        //this.outputIsReady = true;
      } else {
        console.log('Not an image file!')
      }
    })
    this.labelName = this.mlx.createLabel(
      this,
      this.imageName,
      this.mlx.mlxPadding,
      this.divY + this.divH,
      this.w - this.mlx.mlxPadding * 2,
      24
    )

    //this.output = this.canvas;
    this.ready = true
    this.busy = false
  }

  save() {
    let data = super.save()
    data.autoResize = this.autoResize
    return data
  }

  load(data) {
    super.load(data)
    this.autoResize = data.autoResize
    this.autoResizeMenu.value = this.autoResize
    this.setContentSizeByElementWidth()
    this.adjustDivSize()
  }

  createElementMenu() {
    let menu = this._createMenu()

    this.autoResizeMenu = menu.addCheckedMenu('Auto resize', this.autoResize, (ui, value) => {
      this.hideMenu()
      this.autoResize = value
      this.divW = 0
      this.divH = 0
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  doProcess() {
    if (this.img) {
      this.busy = false
      this.output = this.img
      this.outputIsReady = true
      this.alreadyRunInLoop = true
      return true
    }
    return false
  }

  update() {
    super.update()
    this.setPosition(this.x, this.y)

    if (this.divW == 0 && this.img && this.img.width && this.img.height) {
      this.imgAspectRatio = this.img.width / this.img.height
      if (this.autoResize) {
        this.contentAspectRatio = this.imgAspectRatio
      } else {
        this.contentAspectRatio = 1.0
      }
      this.contentH = this.contentW / this.contentAspectRatio
      this.contentScale = 0

      this.divW = this.contentW
      this.divH = this.contentH
      this.div.size(this.divW, this.divH)
      this.div.position(this.x + this.contentX, this.y + this.contentY + this.mlx.mlxNavBarHeight)

      this.labelName.yy = this.divY + this.divH

      this.setElementSizeByContentSize()
      this.h += 18
    }

    if (this.img) {
      //this.outputIsReady = true;
    }
  }

  setPosition(x, y) {
    this.x = x
    this.y = y

    let xx = this.x + this.divX
    let yy = this.y + this.divY + this.mlx.mlxNavBarHeight / this.mlx.userScale

    //xx = xx / this.userScale - this.userScaleX / this.userScale + this.userScaleX - this.userTranslateX;
    //yy = yy / this.userScale - this.userScaleY / this.userScale + this.userScaleY - this.userTranslateY;\

    xx = xx + this.mlx.userTranslateX + this.mlx.userScaleX / this.mlx.userScale - this.mlx.userScaleX
    yy = yy + this.mlx.userTranslateY + this.mlx.userScaleY / this.mlx.userScale - this.mlx.userScaleY

    this.div.position(xx * this.mlx.userScale, yy * this.mlx.userScale)
    this.div.size(this.divW * this.mlx.userScale, this.divH * this.mlx.userScale)
  }

  resizeByMouse() {
    super.resizeByMouse()
    this.h += 18

    this.adjustDivSize()
  }
  adjustDivSize() {
    this.divW = this.contentW
    this.divH = this.contentH
    this.labelName.yy = this.divY + this.divH
    this.labelName.resize(this.w - this.mlx.mlxPadding * 2, this.labelName.h)

    this.div.size(this.divW, this.divH)
    this.div.position(this.x + this.contentX, this.y + this.contentY)
  }

  draw(p5) {
    super.draw(p5)
    p5.fill(211)
    p5.noStroke()

    if (this.backgroundImage) {
      p5.image(this.backgroundImage, this.x + this.divX, this.y + this.divY, this.divW, this.divH)
    } else {
      p5.rect(this.x + this.divX, this.y + this.divY, this.divW, this.divH)
    }

    let img = this.img
    if (this.replaceImage) img = this.replaceImage
    if (img) {
      let shiftX = 0
      let shiftY = 0
      //let imgAspectRatio = img.width / img.height;
      if (!this.noDraw) {
        p5.push()

        if (img.width / this.divW > img.height / this.divH) {
          const h = this.divW / this.imgAspectRatio
          const s = this.divW / img.width
          shiftY = (this.divH - h) / 2
          p5.translate(0, 0 + shiftY)
          p5.scale(s)
          this.contentScale = s
          p5.image(img, (this.x + this.contentX) / this.contentScale, (this.y + this.contentY) / this.contentScale)
        } else {
          const w = this.imgAspectRatio * this.divH
          const s = this.divH / img.height
          shiftX = (this.divW - w) / 2
          p5.translate(0 + shiftX, 0)
          p5.scale(s)
          this.contentScale = s
          p5.image(img, (this.x + this.contentX) / this.contentScale, (this.y + this.contentY) / this.contentScale)
        }
        p5.pop()
      }

      if (this.extraDraw && this.divW && this.contentScale) {
        p5.push()
        //p5.translate(shiftX, shiftY);
        this.extraDraw.doExtraDraw(p5, this.extraDraw)
        p5.pop()
      }
    }
  }
}

class mlxVideoPixels extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'VideoPixels'
    this.needMouse = true

    this.inType = 'none'
    this.outType = 'tensor'

    this.title = 'Video Pixels'

    this.videoSize = 10

    this.contentAspectRatio = 1
    this.contentX = this.mlx.mlxPadding
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.contentW = 280
    this.contentH = this.contentW / this.contentAspectRatio
    this.contentScale = 1.0

    this.setElementSizeByContentSize()
    this.h += 45

    this.slider = this.mlx.createHorizontalSlider(
      this,
      (value) => {
        this.videoSize = this.p5.floor(value)
        console.log(this.videoSize)
      },
      this.videoSize,
      5,
      64,
      this.contentX,
      this.mlx.mlxCaptionHeight + this.contentH + this.mlx.mlxPadding * 2,
      this.contentW,
      32
    )

    this.resizable = false
    this.flip = true

    this.createElementMenu()

    this.constraints = {
      audio: false,
      video: {
        facingMode: 'user',
      },
    }

    window.peer = new Peer()
    // this.canShareScreen = navigator.mediaDevices.getDisplayMedia;
    window.conn = undefined

    peer.on('open', async (id) => {
      this.peerId = id
      console.log('ready peer Id', id)
      conn = peer.connect('c351eb39-1ca1-45d2-93d5-77e9c7993c68', {
        reliable: true,
      })

      conn.on('open', function () {
        console.log('Connected to: ' + conn.peer)
        window.conn = conn

        // Check URL params for comamnds that should be sent immediately
        // var command = getUrlParam('command');
        // if (command) conn.send(command);
      })
      // this.mode = 'sender';
    })

    this.videoCapture = mlx.p5.createCapture(this.constraints, () => {
      console.log('video capture ready')

      this.videoRawWidth = this.videoCapture._pixelsState.width
      this.videoRawHeight = this.videoCapture._pixelsState.height
      this.contentAspectRatio = this.videoRawWidth / this.videoRawHeight
      this.videoWidth = this.w - this.mlx.mlxPadding * 2
      this.videoHeight = this.videoWidth / this.contentAspectRatio

      this.videoCapture.size(this.videoSize, this.videoSize)
      this.videoCapture.hide()

      this.contentW = this.videoWidth
      this.contentH = this.videoHeight

      //this.setElementSizeByContentSize();

      this.output = this.videoCapture
      this.outputIsReady = true
      this.ready = true
      this.busy = false
    })
  }

  save() {
    let data = super.save()
    data.flip = this.flip
    data.videoSize = this.videoSize
    return data
  }

  load(data) {
    super.load(data)
    this.flip = data.flip
    this.videoSize = data.videoSize
    this.flipMenu.value = this.flip
  }

  createElementMenu() {
    let menu = this._createMenu()
    /*
        menu.addSelectMenu(["Front camera", "Back camera"], 0, (ui, value) => {
            //console.log('selected', value);
            this.hideMenu();
        });
        menu.addSeparator();
        */
    this.flipMenu = menu.addCheckedMenu('Flip', this.flip, (ui, value) => {
      //console.log('filp command');
      this.hideMenu()
      this.flip = value
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  remove() {
    if (this.videoCapture) {
      this.videoCapture.remove()
      this.videoCapture = null
    }
    super.remove()
  }

  doProcess() {
    this.busy = true
    this.outputIsReady = false

    this.videoData = []
    for (let y = 0; y < this.videoCapture.height; y++) {
      let videoRow = []
      for (let x = 0; x < this.videoCapture.width; x++) {
        let index = (x + y * this.videoCapture.width) * 4
        let r = this.videoCapture.pixels[index + 0]
        let g = this.videoCapture.pixels[index + 1]
        let b = this.videoCapture.pixels[index + 2]

        let videoPixel = []
        videoPixel.push(r / 255)
        videoPixel.push(g / 255)
        videoPixel.push(b / 255)
        videoRow.push(videoPixel)

        //this.videoData.push(r / 255);
        //this.videoData.push(g / 255);
        //this.videoData.push(b / 255);
      }
      this.videoData.push(videoRow)
      // console.log(JSON.stringify(this.videoData, null, 2));
    }
    this.output = this.videoData
    this.busy = false
    this.outputIsReady = true
    this.alreadyRunInLoop = true
    // console.log('video pixels processed', this.output);
    // console.log(this.videoCapture.width, this.videoCapture.height);
    // coso
    console.log(this.videoCapture.width, this.videoCapture.height, this.videoCapture.pixels)
    // if (window.conn) window.conn.send(JSON.stringify(this.videoCapture.pixels));
    if (window.conn) window.conn.send(JSON.stringify({ pixels: Array.from(this.videoCapture.pixels) }))
    return true
  }

  draw(p5) {
    super.draw(p5)

    if (this.ready) {
      p5.push()
      if (this.flip) {
        p5.translate((this.x + this.contentX) * 2 + this.contentW, 0)
        p5.scale(-1, 1)
      }
      let w = this.contentW / this.videoSize
      if (this.videoCapture.width != this.videoSize || this.videoCapture.height != this.videoSize) {
        this.videoCapture.size(this.videoSize, this.videoSize)
      }
      this.videoCapture.loadPixels()
      //this.videoData = [];
      for (let x = 0; x < this.videoCapture.width; x++) {
        for (let y = 0; y < this.videoCapture.height; y++) {
          let index = (x + y * this.videoCapture.width) * 4
          let r = this.videoCapture.pixels[index + 0]
          let g = this.videoCapture.pixels[index + 1]
          let b = this.videoCapture.pixels[index + 2]
          this.p5.noStroke()
          this.p5.fill(r, g, b)
          this.p5.rect(this.x + this.contentX + x * w, this.y + this.contentY + y * w, w, w)
          //this.videoData.push(r / 255);
          //this.videoData.push(g / 255);
          //this.videoData.push(b / 255);
        }
      }
      p5.pop()
      if (this.extraDraw) {
        this.extraDraw.doExtraDraw(p5, this.extraDraw)
      }
    }
  }
}

module.exports = {
  mlxVideoCapture,
  mlxDrawCanvas,
  mlxMouseInput,
  mlxImage,
  mlxVideoPixels,
  mlxCSVFileInput,
}
