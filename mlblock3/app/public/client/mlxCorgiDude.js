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
const { mlxFeatureExtractor } = require('./mlxFeatureExtractor')
const { mlxImageClassifier } = require('./mlxClassifier')
const { mlxVideoCapture } = require('./mlxVideoCanvasInput')
class mlxLicensePlateDetector extends mlxElementModel {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'LicensePlateDetection'
    this.title = 'License Plate Detection'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.showKeypoints = true
    this.showSkeleton = true
    this.showNames = false
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, 'assets/iconYOLO.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)
    this.model = ml5.objectDetector(
      'corgi_yolo',
      {
        modelUrl: '/models/license_plate_detection/model.json',
        inputSize: [320, 240],
      },
      () => {
        console.log('Model is ready')

        this.ready = true
        this.label.setText('Ready')
      }
    )
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
  }

  doProcess() {
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        this.model.detect(this.inElement.output, (error, results) => {
          if (error) {
            console.error(error)
          } else {
            this.numResults = results.length
            this.output = results
            this.busy = false
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            if (this.inElement) {
              this.inElement.extraDraw = this
            }
            this.label.setText(`${this.numResults} results found`)
          }
        })
      }
    }
    return true
  }

  doExtraDraw(p5, that) {
    if (that.output && that.inElement) {
      p5.push()

      if (that.inElement.flip) {
        p5.translate((that.inElement.x + that.inElement.contentX) * 2 + that.inElement.contentW, 0)
        p5.scale(-1, 1)
      } else {
        //p5.translate((that.inElement.x), that.inElement.y);
      }

      let objects = that.output

      let width = that.inElement.contentW
      let height = that.inElement.contentH

      for (let i = 0; i < objects.length; i++) {
        //console.log(objects[i]);
        let obj = objects[i].normalized
        let x = obj.x * width + that.inElement.x + that.inElement.contentX
        let y = obj.y * height + that.inElement.y + that.inElement.contentY
        let w = obj.width * width
        let h = obj.height * height
        //console.log(x, y, w, h);

        p5.noStroke()
        p5.fill(0, 255, 0)
        p5.push()

        if (that.inElement.flip) {
          p5.translate(x, 0)
          p5.scale(-1, 1)
          p5.translate(0 - x - w, 0)
        }
        let s = this.inElement.contentW / 40
        if (s > 30 / that.inElement.contentScale) s = 30 / that.inElement.contentScale
        if (s < 5 / that.inElement.contentScale) s = 5 / that.inElement.contentScale
        p5.textSize(s)
        p5.text(objects[i].label, x + 5, y - 0)
        p5.pop()
        p5.noFill()
        p5.strokeWeight(4)
        p5.stroke(0, 255, 0)
        //rect(objects[i].x * width, objects[i].y * height, objects[i].width * width, objects[i].height * height);
        p5.push()
        //p5.translate(that.inElement.contentX, that.inElement.contentY);
        //p5.scale(that.inElement.contentScale);
        p5.rect(x, y, w, h)
        p5.pop()
      }

      p5.pop()
    }
  }
}

class mlxFaceMaskDetector extends mlxElementModel {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'FaceMask'
    this.title = 'Face Mask Detection'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.showKeypoints = true
    this.showSkeleton = true
    this.showNames = false
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, 'assets/iconFaceMask.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)
    this.model = ml5.objectDetector(
      'yolo',
      {
        modelUrl: '/models/facemask_detection_320x320/model.json',
        imageSize: [320, 320],
        labels: ['Face', 'FaceMask'],
        filterBoxesThreshold: 0.3,
        IOUThreshold: 0.3,
        classProbThreshold: 0.7,
        anchors: [
          // [0.212104, 0.261834],
          // [0.630488, 0.706821],
          // [1.264643, 1.396262],
          // [2.360058, 2.507915],
          // [4.34846, 4.007944],
          [0.261834, 0.212104],
          [0.706821, 0.630488],
          [1.396262, 1.264643],
          [2.507915, 2.360058],
          [4.007944, 4.34846],
        ],
      },
      () => {
        console.log('Model is ready')

        this.ready = true
        this.label.setText('Ready')
      }
    )
    return this
  }
  createElementMenu() {
    let menu = this._createMenu()
    this.downloadMenu = menu.addCheckedMenu('Download Model', this.flip, (ui, value) => {
      console.log('download model')
      this.hideMenu()
    })
    menu.addSeparator()

    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }
  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
  }

  doProcess() {
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        this.model.detect(this.inElement.output, (error, results) => {
          if (error) {
            console.error(error)
          } else {
            this.numResults = results.length
            this.output = results
            this.busy = false
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            if (this.inElement) {
              this.inElement.extraDraw = this
            }
            this.label.setText(`${this.numResults} results found`)
          }
        })
      }
    }
    return true
  }

  doExtraDraw(p5, that) {
    if (that.output && that.inElement) {
      p5.push()

      if (that.inElement.flip) {
        p5.translate((that.inElement.x + that.inElement.contentX) * 2 + that.inElement.contentW, 0)
        p5.scale(-1, 1)
      } else {
        //p5.translate((that.inElement.x), that.inElement.y);
      }

      let objects = that.output

      let width = that.inElement.contentW
      let height = that.inElement.contentH

      for (let i = 0; i < objects.length; i++) {
        //console.log(objects[i]);
        let obj = objects[i].normalized
        let x = obj.x * width + that.inElement.x + that.inElement.contentX
        let y = obj.y * height + that.inElement.y + that.inElement.contentY
        let w = obj.width * width
        let h = obj.height * height
        //console.log(x, y, w, h);
        p5.rect(x, y, 5, 5)
        p5.noStroke()
        p5.fill(0, 255, 0)
        p5.push()

        if (that.inElement.flip) {
          p5.translate(x, 0)
          p5.scale(-1, 1)
          p5.translate(0 - x - w, 0)
        }
        let s = this.inElement.contentW / 40
        if (s > 30 / that.inElement.contentScale) s = 30 / that.inElement.contentScale
        if (s < 5 / that.inElement.contentScale) s = 5 / that.inElement.contentScale
        p5.textSize(s)
        p5.text(objects[i].label, x + 5, y - 0)
        p5.pop()
        p5.noFill()
        p5.strokeWeight(4)
        if (objects[i].classId == 0) {
          p5.stroke(255, 0, 0)
        } else {
          p5.stroke(0, 255, 0)
        }
        //rect(objects[i].x * width, objects[i].y * height, objects[i].width * width, objects[i].height * height);
        p5.push()
        //p5.translate(that.inElement.contentX, that.inElement.contentY);
        //p5.scale(that.inElement.contentScale);
        p5.rect(x, y, w, h)
        p5.pop()
      }

      p5.pop()
    }
  }
}

class mlxCorgiDudeCamera2 extends mlxElementInput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Input'
    this.type = 'CorgiDudeCamera'
    this.title = 'CorgiDude Camera'

    this.inType = 'none'
    this.outType = 'image'

    this.replaceImage = null

    this.contentAspectRatio = 16 / 9
    this.contentX = this.mlx.mlxPadding
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.contentW = 320
    this.contentH = 240
    this.contentScale = 1.0

    this.setElementSizeByContentSize()

    this.resizable = false //<<<<<<<<<
    this.flip = false
    this.needMouse = true
    this.autoMaximize = false

    this.serialObject = null

    this.createElementMenu()

    this.isVideoCaptureReady = false

    this.doCaptureScreen = false //do capture screen after all draw
    this.corgihub = window.CorgiHub.getInstance()

    // this.messageLabel = this.mlx.createLabel(
    //     this,
    //     'click here to download MLBlock CorgiDude bridge',
    //     this.mlx.mlxPadding,
    //     this.mlx.mlxCaptionHeight,
    //     this.w - this.mlx.mlxPadding,
    //     this.h - this.mlx.mlxCaptionHeight - 5
    // );

    this.doCreateVideoCapture()
    this.corgihub.register('video', this.constructor.name, this.setVideo.bind(this))
    setTimeout(() => {
      this.corgihub.send({ cmd: 'start_camera' })
    }, 500)
    console.log('video capture ready')

    this.outputIsReady = true
    this.busy = false
    this.beepSound = this.p5.loadSound('assets/shutterbeep.mp3')
    this.shutterSound = this.p5.loadSound('assets/shuttersound.mp3')
    this.ready = true
  }
  opened() {
    this.ready = true
  }
  setVideo(e) {
    this.videoCapture.loadPixels()
    let buf = new Uint8ClampedArray(e.data)
    this.videoCapture.pixels.set(buf.slice(2))
    this.videoCapture.updatePixels()
  }
  doCreateVideoCapture() {
    if (this.ready) {
      this.videoCapture.remove()
    }

    try {
      this.ready = false
      this.isVideoCaptureReady = false
      this.videoRawWidth = 320
      this.videoRawHeight = 240
      this.videoCapture = this.mlx.p5.createImage(this.videoRawWidth, this.videoRawHeight)
      this.contentAspectRatio = this.videoRawWidth / this.videoRawHeight
      this.videoWidth = this.w - this.mlx.mlxPadding * 2
      this.videoHeight = this.videoWidth / this.contentAspectRatio
      //this.videoCapture.size(this.videoWidth, this.videoHeight);
      //this.videoCapture.hide();
      this.contentW = this.videoWidth
      this.contentH = this.videoHeight
      this.setElementSizeByContentSize()
      if (this.isMaximize) {
        this.scaleContentToFillSize(false)
      }
      if (this.autoMaximize) {
        this.enterMaximize()
      }
      this.output = this.videoCapture
    } catch (err) {
      console.log('ERROR', err)
      //this.loading.html('ERROR: ' + err);
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
    this.videoCapture.resize(this.videoWidth, this.videoHeight)
    console.log(this.videoWidth, this.videoHeight)
  }

  resizeByMouse() {
    super.resizeByMouse()
    this.setVideoCaptureSize()
  }

  endFullScreen() {
    super.endFullScreen()
    this.setVideoCaptureSize()
  }

  enterMaximize() {
    super.enterMaximize()
  }

  exitMaximize() {
    super.exitMaximize()
    this.isMaximize = false
    this.maxMenu.value = false
  }

  captureScreen() {
    this.captureCountdown = 2999
    this.captureBeepCountdown = 0
    this.doCaptureScreen = true
  }

  createElementMenu() {
    let menu = this._createMenu()

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
      // this.videoCapture.stop();
      // if (this.isVideoCaptureReady) {
      //     this.videoCapture.remove();
      // }
      this.videoCapture = null
    }
    this.corgihub.send({ cmd: 'stop_camera' })
    this.corgihub.remove('video', this.constructor.name)
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
class mlxCorgiDudeMobileNet extends mlxImageClassifier {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'MobileNet'
    this.title = 'MobileNet'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, 'assets/iconMobileNet.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)
    this.model = ml5.imageClassifier('http://localhost:8089/models/transfer_mb25_224/model.json', () => {
      console.log('Model MobileNet is ready')

      this.ready = true
      this.label.setText('Ready')
    })
  }

  doProcess() {
    //this.outputIsReady = false;
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        ml5.tf.tidy(() => {
          let img = this.inElement.output.elt
          if (!(img instanceof ml5.tf.Tensor)) {
            img = ml5.tf.browser.fromPixels(img)
          }
          let normalizationOffset = ml5.tf.scalar(127.5)
          let IMAGE_SIZE = 224
          const normalized = img.toFloat().sub(normalizationOffset).div(normalizationOffset)

          // Resize the image to
          let resized = normalized
          if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
            const alignCorners = true
            resized = ml5.tf.image.resizeBilinear(normalized, [224, 224], alignCorners)
          }
          const batched = resized.reshape([-1, IMAGE_SIZE, IMAGE_SIZE, 3])
          let logits = this.model.model.execute(batched, 'conv_preds')
          let data = logits.dataSync()
          console.log(logits)
          console.log(data)
        })
        // this.model.classify(this.inElement.output, (error, results) => {
        //     if (error) {
        //         console.error(error);
        //     } else {
        //         this.numResults = results.length;
        //         this.output = results;
        //         this.busy = false;
        //         this.outputIsReady = true;
        //         this.alreadyRunInLoop = true;
        //         //if (this.inElement) this.inElement.outputIsReady = false;
        //         this.label.setText(`${this.numResults} results found`);
        //     }
        // });
      }
    }
    return true
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
  }
}
class mlxCorgiDudeMobileNetClassifier extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'CorgiDudeMobileNetClassifier'
    this.title = 'CorgiDude MobileNet Classifier'

    this.inType = 'image'
    this.outType = 'results'
    this.w = 400
    this.h = 100
    this.createElementMenu()
    this.mode = 'classify'
    this.needMouse = true
    this.classNames = ['A', 'B', 'C', 'D', 'E']
    this.currentClass = 'A'
    this.classes = []
    this.counts = [0, 0, 0, 0, 0]
    this.currentClassIndex = 0
    this.classifier = null
    this.trained = false
    this.losses = []
    this.highestLoss = 0

    this.icon = this.mlx.createImage(
      this,
      'assets/iconMobileNetClassifier.jpg',
      1,
      this.mlx.mlxCaptionHeight + 1,
      398,
      44
    )
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.categoryMenu = this.mlx.createMenu(this, 10, this.mlx.mlxCaptionHeight + 44 + 10)
    this.select = this.categoryMenu.addSelectMenu(['A', 'B', 'C', 'D', 'E'], -1, (ui, value) => {
      if (this.inElement && this.inElement.output) {
        if (value >= 0) {
          this.currentClass = this.classNames[value]
          this.currentClassIndex = value
          ///console.log('class:', this.currentClass);
        }
      }
    })
    this.categoryMenu.w = 75
    this.trainLogX = 95
    this.trainLogY = this.mlx.mlxCaptionHeight + 44 + 10
    this.trainLogW = this.w - 105
    this.trainLogH = this.categoryMenu.h
    console.log(this.categoryMenu.h)

    this.labelTrain = this.mlx.createLabel(
      this,
      'No training data',
      this.trainLogX,
      this.trainLogY + this.trainLogH + 4,
      this.trainLogW,
      24
    )

    this.getButton = this.mlx.createButton(
      this,
      'add',
      () => {
        if (this.inElement && this.inElement.output) {
          console.log('add', this.currentClass)
          this.counts[this.currentClassIndex] += 1
          this.select.setTitle(this.currentClassIndex, `${this.currentClass} (${this.counts[this.currentClassIndex]})`)
          this.classifier.addImage(this.inElement.output, this.currentClass)
          if (this.classes.indexOf(this.currentClass) == -1) {
            this.classes.push(this.currentClass)
          }
        }
      },
      10,
      205,
      75,
      24
    )
    this.getButton.border = true
    this.getButton.hidden = true

    this.trainButton = this.mlx.createButton(
      this,
      'train',
      () => {
        console.log('train')
        if (this.inElement && this.inElement.output && this.classifier) {
          let logits = this.features.infer(this.inElement.output, 'logis')
          let data = logits.dataSync()
          console.log(ml5.tf.argMax(data).dataSync())
          console.log(ml5.tf.max(data).dataSync())
          // this.losses = [];
          // this.highestLoss = 0;
          // this.classifier.train(lossValue => {
          //     if (lossValue) {
          //         this.loss = lossValue;
          //         console.log('Loss: ' + this.loss);
          //         this.labelTrain.setText('Loss: ' + this.loss);
          //         this.losses.push(lossValue);
          //         if (lossValue > this.highestLoss) this.highestLoss = lossValue;
          //         this.drawed = false;
          //     } else {
          //         console.log('Done Training! Final Loss: ' + this.loss);
          //         this.labelTrain.setText('Done Training! Final Loss: ' + this.loss);
          //         this.trained = true;
          //         this.drawed = false;
          //     }
          // });
        }
      },
      this.w - 72,
      this.h - 28,
      68,
      24
    )
    this.trainButton.border = true

    const options = {
      numLabels: 5,
      mobilenetURL: 'http://localhost:8089/models/transfer_mb25_224/layers/model.json',
      graphModelURL: 'http://localhost:8089/models/transfer_mb25_224/graph/model.json',
      embeddingLayer: 'StatefulPartitionedCall/mobilenet_0.25_224/reshape_2/Reshape',
    }
    try {
      this.features = ml5.featureExtractor('MobileNet', options, () => {
        console.log('MobileNet Feature Extractor is ready')
        this.ready = true
        this.label.setText('Ready (No trained data)')

        console.log(this.features)
        this.getButton.hidden = false
      })
    } catch (e) {
      console.log(e)
    }

    this.h += 160
    this.label.yy += 160
    this.trainButton.yy += 160

    this.classifier = this.features.classification(() => {})
  }

  doProcess() {
    if (!this.trained) return false
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        this.classifier.classify(this.inElement.output, (error, results) => {
          if (error) {
            console.error(error)
          } else {
            this.numResults = results.length
            this.output = results
            this.busy = false
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            this.label.setText(`${this.numResults} results found`)
          }
        })
      }
    }
    return true
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready (No input)')
    } else {
      if (this.trained) {
        if (!this.numResults) this.label.setText('Ready (Trained)')
      } else {
        this.label.setText('Ready (No trained data)')
      }
    }
  }

  draw(p5) {
    super.draw(p5)

    p5.fill(255)
    p5.stroke(0)
    p5.rect(this.x + this.trainLogX, this.y + this.trainLogY, this.trainLogW, this.trainLogH)
    if (!this.drawed) {
      let r = (this.trainLogH * 0.9) / this.highestLoss
      let yy = this.y + this.trainLogY + this.trainLogH
      let xx = this.x + this.trainLogX
      let step = this.trainLogW / this.losses.length
      if (step > 10) step = 10
      p5.beginShape()
      for (var i = 0; i < this.losses.length; i++) {
        let cr = yy - r * this.losses[i]
        p5.vertex(xx + i * step, cr)
      }
      p5.endShape()
      //this.drawed = true;
    }
  }
}

class mlxCorgiDudeMobileNetRegressor extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'CorgiDudeMobileNetRegressor'
    this.title = 'MobileNet Regressor'

    this.inType = 'image'
    this.outType = 'results'

    this.w = 400
    this.h = 100
    this.createElementMenu()
    this.mode = 'regression'
    this.needMouse = true
    this.currentClassIndex = 0
    this.trained = false
    this.losses = []
    this.highestLoss = 0
    this.regressor = null
    this.currentValue = 0
    this.counts = 0

    this.icon = this.mlx.createImage(
      this,
      'assets/iconMobileNetRegressor.jpg',
      1,
      this.mlx.mlxCaptionHeight + 1,
      398,
      44
    )
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.slider = this.mlx.createVerticalSlider(
      this,
      (value) => {
        this.currentValue = value
      },
      this.currentValue,
      0,
      1,
      20,
      this.mlx.mlxCaptionHeight + 44 + 10,
      15,
      122
    )

    this.trainLogX = 95
    this.trainLogY = this.mlx.mlxCaptionHeight + 44 + 10
    this.trainLogW = this.w - 105
    this.trainLogH = 122

    this.labelTrain = this.mlx.createLabel(
      this,
      'No training data',
      this.trainLogX,
      this.trainLogY + this.trainLogH + 4,
      this.trainLogW,
      24
    )

    this.getButton = this.mlx.createButton(
      this,
      'add',
      () => {
        if (this.inElement && this.inElement.output) {
          console.log('add', this.currentValue)
          this.counts += 1
          //this.select.setTitle(this.currentClassIndex, `${this.currentClass} (${this.counts[this.currentClassIndex]})`)
          this.regressor.addImage(this.inElement.output, this.currentValue)
          this.labelTrain.setText(`${this.counts} data was added.`)
        }
      },
      10,
      205,
      75,
      24
    )
    this.getButton.border = true
    //this.getButton.hidden = true;

    this.trainButton = this.mlx.createButton(
      this,
      'train',
      () => {
        console.log('train')

        if (this.inElement && this.inElement.output && this.regressor) {
          this.losses = []
          this.highestLoss = 0
          this.regressor.train((lossValue) => {
            if (lossValue) {
              this.loss = lossValue
              console.log('Loss: ' + this.loss)
              this.labelTrain.setText('Loss: ' + this.loss)
              this.losses.push(lossValue)
              if (lossValue > this.highestLoss) this.highestLoss = lossValue
              this.drawed = false
            } else {
              console.log('Done Training! Final Loss: ' + this.loss)
              this.labelTrain.setText('Done Training! Final Loss: ' + this.loss)
              this.trained = true
              this.drawed = false
            }
          })
        }
      },
      this.w - 72,
      this.h - 28,
      68,
      24
    )
    this.trainButton.border = true

    this.features = ml5.featureExtractor('MobileNet', () => {
      console.log('MobileNet Feature Extractor is ready')
      this.ready = true
      this.label.setText('Ready (No trained data)')

      console.log(this.features)
    })

    this.h += 160
    this.label.yy += 160
    this.trainButton.yy += 160

    this.regressor = this.features.regression(() => {
      console.log('Regression Ready')
      this.getButton.hidden = false
    })
  }

  doProcess() {
    if (!this.trained) return false
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        this.regressor.predict(this.inElement.output, (error, results) => {
          if (error) {
            console.error(error)
          } else {
            this.numResults = 1
            this.output = results
            this.busy = false
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            this.label.setText(`${this.numResults} results found`)
          }
        })
      }
    }
    return true
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready (No input)')
    } else {
      if (this.trained) {
        if (!this.numResults) this.label.setText('Ready (Trained)')
      } else {
        this.label.setText('Ready (No trained data)')
      }
    }
  }

  draw(p5) {
    super.draw(p5)

    p5.fill(255)
    p5.stroke(0)
    p5.rect(this.x + this.trainLogX, this.y + this.trainLogY, this.trainLogW, this.trainLogH)
    if (!this.drawed) {
      let r = (this.trainLogH * 0.9) / this.highestLoss
      let yy = this.y + this.trainLogY + this.trainLogH
      let xx = this.x + this.trainLogX
      let step = this.trainLogW / this.losses.length
      if (step > 10) step = 10
      p5.beginShape()
      for (var i = 0; i < this.losses.length; i++) {
        let cr = yy - r * this.losses[i]
        p5.vertex(xx + i * step, cr)
      }
      p5.endShape()
      //this.drawed = true;
    }
  }
}

//=========== editor =========//
class mlxCorgiDudeIDE extends mlxElementOutput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Output'
    this.type = 'CorgiDudeIDE'
    this.title = 'CorgiDude Micropython IDE'

    this.inType = 'all'
    this.outType = 'none'

    this.createElementMenu()
    this.needMouse = true

    this.resizable = true
    this.contentX = 0 // this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight // + this.mlx.mlxPadding;
    this.w = 700
    this.h = 600
    this.contentW = this.w - 1
    this.contentH = this.h - this.mlx.mlxPadding
    this.contentAspectRatio = 3.0

    this.divX = this.contentX
    this.divY = this.contentY
    this.divW = this.contentW
    this.divH = this.contentH

    this.h += 45

    this.div = mlx.p5.createDiv()
    this.div.size(this.divW, this.divH)
    this.div.position(this.x + this.divX, this.y + this.divY + this.mlx.mlxNavBarHeight)
    this.div.style('background-color', '#FFFFFF')
    this.div.style('text-align', 'left')

    //this.div.style("font-size", "x-small");
    this.div.addClass('js-editor')

    this.label = this.mlx.createLabel(
      this,
      'Ready',
      this.mlx.mlxPadding,
      this.h - 26,
      this.w - this.mlx.mlxPadding * 2 - 5,
      24
    )

    this.outputIsReady = false
    this.ready = true
    this.busy = false
    this.editor = window.monaco.editor.create(this.div.elt, {
      value: `import sensor, image, time, lcd
lcd.init(type=2)
sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)
while(True):
    img = sensor.snapshot()
    lcd.display(img)`,
      language: 'python',
      theme: 'vs-dark',
    })
    // this.editor = CodeMirror(this.div.elt, {
    //   lineNumbers: true,
    //   extraKeys: { "Ctrl-Space": "autocomplete" },
    //   mode: { name: "javascript", globalVars: true },
    // });
    this.corgihub = window.CorgiHub.getInstance()
  }
  save() {
    let data = super.save()
    let code = this.editor.getValue()
    data.code = code
    return data
  }

  load(data) {
    super.load(data)
    let code = data.code
    this.editor.getModel().setValue(code)
  }

  inactivateUI() {
    this.div.style('display', 'none')
  }

  activateUI() {
    this.div.style('display', 'block')
  }

  createElementMenu() {
    let menu = this._createMenu()

    // menu.addSelectMenu(
    //     ['Euclidean distance', 'Cosine similarity'],
    //     this.method,
    //     (ui, value) => {
    //         console.log('method', value);
    //         this.method = value;
    //         this.hideMenu();
    //         if (this.inElement) {
    //             this.inElement.refresh();
    //         }
    //     }
    // );
    menu.addCommand('Run', (ui) => {
      this.hideMenu()
      let code = this.editor.getValue()
      this.corgihub.send({ cmd: 'run', code: code })
      this.activateUI()
    })
    menu.addCommand('Upload File', (ui) => {
      this.hideMenu()
      var input = $(document.createElement('input'))
      input.attr('type', 'file')
      input.trigger('click') // opening dialog
      f = files[0]

      var reader = new FileReader()
      //this.corgihub.send({ cmd: 'run', code: code });
      this.activateUI()
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  resizeByMouse() {
    super.resizeByMouse()
  }

  setContentSizeByElementWidth() {
    this.label.yy = this.h - 26
    this.label.resize(this.w - this.mlx.mlxPadding * 2 - 5, this.label.h)
    this.div.size(this.w * this.mlx.userScale - 1, this.h * this.mlx.userScale - 45 - this.mlx.mlxPadding)
    this.editor.layout()
  }

  doProcess() {
    this.outputIsReady = false
    this.busy = false
    this.inElement.outputIsReady = false
    this.alreadyRunInLoop = true
    return true
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
    this.setPosition(this.x, this.y)
  }
  draw(p5) {
    super.draw(p5)
  }
}

module.exports = {
  mlxCorgiDudeCamera2,
  mlxCorgiDudeMobileNetRegressor,
  mlxCorgiDudeMobileNetClassifier,
  mlxLicensePlateDetector,
  mlxFaceMaskDetector,
  mlxCorgiDudeMobileNet,
  mlxCorgiDudeIDE,
}
