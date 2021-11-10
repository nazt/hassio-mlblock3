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

class mlxImageClassifier extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.numResults = 0
  }
}

class mlxMobileNet extends mlxImageClassifier {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'MobileNet'
    this.title = 'MobileNet'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconMobileNet.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.model = ml5.imageClassifier('MobileNet', () => {
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
        this.model.classify(this.inElement.output, (error, results) => {
          if (error) {
            console.error(error)
          } else {
            this.numResults = results.length
            this.output = results
            this.busy = false
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            //if (this.inElement) this.inElement.outputIsReady = false;
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
      if (this.ready) this.label.setText('Ready')
    }
  }
}

class mlxSoundCommand18w extends mlxElementInput {
  constructor(mlx) {
    super(mlx)
    this.category = 'Input'
    this.type = 'SpeechCommand'

    this.inType = 'none'
    this.outType = 'results'

    this.title = 'Speech Command'
    this.h = 100
    this.createElementMenu()
    this.numResults = 0

    this.icon = this.mlx.createImage(this, '/assets/iconSoundCommand.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)

    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)
    this.outputIsReady = false

    const options = { probabilityThreshold: 0.8 }

    this.model = ml5.soundClassifier('SpeechCommands18w', options, () => {
      console.log('SpeechCommand18w is ready')

      this.ready = true
      this.label.setText('Ready')
    })

    this.model.classify((error, results) => {
      if (error) {
        console.error(error)
      } else {
        this.numResults = results.length
        this.output = results

        if (this.inElement) this.inElement.outputIsReady = false
        this.label.setText(`${this.numResults} results found`)
      }
    })
  }

  doProcess() {
    this.alreadyRunInLoop = true
    this.busy = false
    this.outputIsReady = true
    return true
  }

  update() {
    super.update()
  }
}

class mlxDoodleNet extends mlxImageClassifier {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'DoodleNet'
    this.title = 'DoodleNet'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconDoodleNet.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.model = ml5.imageClassifier('DoodleNet', () => {
      console.log('Model DoodleNet is ready')

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
        this.model.classify(this.inElement.output, (error, results) => {
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
      if (this.ready) this.label.setText('Ready')
    }
  }
}

class mlxPoseNet extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'PoseNet'
    this.title = 'PoseNet'

    this.inType = 'image'
    this.outType = 'tensor'

    this.h = 100
    this.showKeypoints = true
    this.showSkeleton = true
    this.showNames = false
    this.allowExtraInElement = true
    this.startPose = false
    this.overlayImage = {}
    this.outputType = 2
    this.createElementMenu()
    this.rawData = []

    this.icon = this.mlx.createImage(this, '/assets/iconPoseNet.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.model = ml5.poseNet(() => {
      console.log('Model PoseNet is ready')

      this.ready = true
      this.label.setText('Ready')
    })

    this.model.on('pose', (results) => {
      if (!this.startPose) {
        this.busy = false
        return false
      }
      //console.log(results);
      this.numResults = results.length
      if (this.outputType == 1) {
        this.output = results[0].pose.keypoints.map((p) => [p.score, p.position.x, p.position.y])
      } else if (this.outputType == 2) {
        this.output = []
        if (results.length) {
          results[0].pose.keypoints.map((p) => {
            this.output.push(p.score)
            this.output.push(p.position.x)
            this.output.push(p.position.y)
          })
        } else {
          this.rawData = []
          this.busy = false
          return false
        }
      } else {
        this.output = results
      }
      this.rawData = results
      this.busy = false
      this.outputIsReady = true
      this.alreadyRunInLoop = true
      if (this.inElement) {
        this.inElement.extraDraw = this
      }

      this.label.setText(`${this.numResults} results found`)
    })
  }

  createElementMenu() {
    let menu = this._createMenu()
    this.showKeypointsMenu = menu.addCheckedMenu('Show Keypoints', this.showKeypoints, (ui, value) => {
      this.hideMenu()
      this.showKeypoints = value
    })
    this.showSkeletonMenu = menu.addCheckedMenu('Show Skeleton', this.showSkeleton, (ui, value) => {
      this.hideMenu()
      this.showSkeleton = value
    })
    this.showNamesMenu = menu.addCheckedMenu('Show Names', this.showNames, (ui, value) => {
      this.hideMenu()
      this.showNames = value
    })
    this.showOverlayMenu = menu.addCheckedMenu('Show Overlay', this.showOverlay, (ui, value) => {
      this.hideMenu()
      this.showOverlay = value
    })
    menu.addSeparator()
    this.outputTypeMenu = menu.addSelectMenu(
      ['Output Raw Data', 'Output Keypoints Array', 'Output Flatten Array'],
      this.outputType,
      (ui, value) => {
        //console.log('selected', value);
        this.hideMenu()
        this.outputType = value
        if (this.outputType == 0) {
          this.outType = 'posenet'
        } else if (this.outputType == 1) {
          this.outType = 'tensor'
        } else if (this.outputType == 2) {
          this.outType = 'tensor'
        }
      }
    )
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  doProcess() {
    //this.busy = true;
    //this.outputIsReady = false;
    if (this.inElement.output && this.inElement.outputIsReady) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) this.inElement.outputIsReady = false
        this.model.multiPose(this.inElement.output)
        this.startPose = true
      }
    }
    for (let i in this.extraInElement) {
      let elx = this.extraInElement[i]
      if (elx.type === 'Image') {
        if (elx.output && elx.outputIsReady) {
          let name = elx.imageName.split('.')[0]
          this.overlayImage[name] = elx.output
        }
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

  clearResults() {
    this.output = null
    this.startPose = false
  }

  doExtraDraw(p5, that) {
    if (that.output && that.inElement) {
      let output = []
      Object.assign(output, that.rawData)
      p5.push()

      if (that.inElement.flip) {
        p5.translate((that.inElement.x + that.inElement.contentX) * 2 + that.inElement.contentW, 0)
        p5.scale(-1, 1)
      } else {
        //p5.translate((that.inElement.x), that.inElement.y);
      }

      if (that.showKeypoints) that.drawKeypoints(that, p5, output, false)
      if (that.showSkeleton) that.drawSkeletons(that, p5, output)
      if (that.showNames) that.drawNames(that, p5, output)
      if (that.showOverlay) that.drawKeypoints(that, p5, output, true)
      p5.pop()
    }
  }

  draw(p5) {
    super.draw(p5)
  }

  fixPoseNet(that) {
    // Bug in PoseNet
    /*
        let ycomp = that.inElement.videoHeight - 360;
        if (ycomp > 0) ycomp *= 0.1;
        else ycomp *= 0.045;
        return ycomp;
        */
    return 0
  }

  drawKeypoints(that, p5, poses, isOverlay) {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
      // For each pose detected, loop through all the keypoints
      let pose = poses[i].pose
      let eyeDist = p5.dist(
        pose.keypoints[1].position.x,
        pose.keypoints[1].position.y,
        pose.keypoints[2].position.x,
        pose.keypoints[2].position.y
      )
      for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j]
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
          p5.fill(0, 255, 0)
          p5.noStroke()
          let s = eyeDist / 15
          if (s > 30) s = 30
          if (s < 8) s = 8
          //s = that.inElement.contentScale;
          if (that.inElement.videoHeight > 360) {
            s *= that.inElement.videoHeight / 360
          }
          if (!isOverlay) {
            p5.push()
            //console.log(that.inElement.contentScale);
            let ycomp = this.fixPoseNet(that)
            ycomp = 0
            p5.translate(that.inElement.x + that.inElement.contentX, that.inElement.y + that.inElement.contentY - ycomp)
            p5.scale(that.inElement.contentScale)
            p5.ellipse(keypoint.position.x, keypoint.position.y, s, s)
            p5.pop()
          } else {
            p5.push()
            p5.imageMode(p5.CENTER)
            if (this.overlayImage[keypoint.part]) {
              let is = (eyeDist * 0.85) / this.overlayImage[keypoint.part].width
              p5.scale(is)
              p5.translate(
                (that.inElement.x + that.inElement.contentX) / is,
                (that.inElement.y + that.inElement.contentY) / is
              )

              p5.scale(that.inElement.contentScale)
              p5.image(this.overlayImage[keypoint.part], keypoint.position.x / is, keypoint.position.y / is)
            }

            p5.pop()
          }

          //console.log(keypoint.part, keypoint.position.x, keypoint.position.y);
        }
      }
    }
  }

  drawSkeletons(that, p5, poses) {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
      let skeleton = poses[i].skeleton
      // For every skeleton, loop through all body connections
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0]
        let partB = skeleton[j][1]
        p5.stroke(255, 0, 0)
        p5.push()
        let ycomp = this.fixPoseNet(that)
        p5.translate(that.inElement.x + that.inElement.contentX, that.inElement.y + that.inElement.contentY - ycomp)
        p5.scale(that.inElement.contentScale)
        p5.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y)
        p5.pop()
      }
    }
  }

  drawNames(that, p5, poses) {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
      // For each pose detected, loop through all the keypoints
      let pose = poses[i].pose
      for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j]
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
          p5.fill(255, 255, 255)
          p5.noStroke()
          //ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          //console.log(keypoint.part, keypoint.position.x, keypoint.position.y);
          let s = this.inElement.contentW / 50
          if (s > 30) s = 30
          if (s < 5) s = 5
          s /= that.inElement.contentScale
          p5.push()
          let ycomp = this.fixPoseNet(that)
          p5.translate(that.inElement.x + that.inElement.contentX, that.inElement.y + that.inElement.contentY - ycomp)
          p5.scale(that.inElement.contentScale)
          p5.push()
          if (that.inElement.flip) {
            p5.translate(keypoint.position.x, 0)
            p5.scale(-1, 1)
            p5.translate(0 - keypoint.position.x, 0)
          }

          p5.textSize(s)
          p5.text(keypoint.part, keypoint.position.x - p5.textWidth(keypoint.part) / 2, keypoint.position.y - s * 2)
          p5.pop()
          p5.pop()
        }
      }
    }
  }

  //override parent
  save() {
    var data = super.save()
    data.outputType = parseInt(this.outputType)
    data.showKeypoints = this.showKeypoints
    data.showSkeleton = this.showSkeleton
    data.showNames = this.showNames
    data.showOverlay = this.showOverlay
    return data
  }

  load(data) {
    super.load(data)
    if (data.type == this.type) {
      if (data.outputType != null) {
        this.outputType = data.outputType
        this.outputTypeMenu.setValue(this.outputType)
      }
      if (data.showKeypoints != null) {
        this.showKeypoints = data.showKeypoints
        this.showKeypointsMenu.value = this.showKeypoints
      }
      if (data.showSkeleton != null) {
        this.showSkeleton = data.showSkeleton
        this.showSkeletonMenu.value = this.showSkeleton
      }
      if (data.showNames != null) {
        this.showNames = data.showNames
        this.showNamesMenu.value = this.showNames
      }
      if (data.showOverlay != null) {
        this.showOverlay = data.showOverlay
        this.showOverlayMenu.value = this.showOverlay
      }
    }
  }
}

class mlxHandPose extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'HandPose'
    this.title = 'HandPose'

    this.inType = 'image'
    this.outType = 'tensor'

    this.h = 100
    this.outputType = 2
    this.outputActualWidth = 640
    this.rawData = []
    this.showKeypoints = true
    this.showSkeleton = true
    this.showBoundingBox = false
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconHandPose.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.model = ml5.handpose(() => {
      console.log('Model HandPose is ready')
      this.ready = true
      this.label.setText('Ready')
    })
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
  }

  doProcess() {
    //this.outputIsReady = false;
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        this.busy = true
        if (this.inElement) {
          this.inElement.outputIsReady = false
        }
        this.model.predict(this.inElement.output, (results) => {
          this.numResults = results.length
          if (this.numResults > 0) {
            if (this.outputType == 0) {
              //raw
              this.output = results
            } else if (this.outputType == 1) {
              //Array of pose finger
              this.output = results.landmarks
            } else {
              //flatten array
              this.output = []
              if (results.length) {
                results[0].landmarks.map((p) => {
                  this.output.push(p[0])
                  this.output.push(p[1])
                })
              } else {
                this.outputIsReady = false
              }
            }
            this.rawData = results
            this.outputIsReady = true
          } else {
            this.rawData = results
            this.output = null
            this.outputIsReady = false
          }
          this.busy = false
          this.alreadyRunInLoop = true
          if (this.inElement) {
            this.inElement.extraDraw = this
          }
          this.label.setText(`${this.numResults} results found`)
        })
      }
    }
    return true
  }

  doExtraDraw(p5, that) {
    if (that.output && that.inElement && that.output.length > 0) {
      let output = []
      Object.assign(output, that.rawData)
      p5.push()
      if (that.inElement.flip) {
        p5.translate((that.inElement.x + that.inElement.contentX) * 2 + that.inElement.contentW, 0)
        p5.scale(-1, 1)
      } else {
        //p5.translate((that.inElement.x), that.inElement.y);
      }

      let detections = output
      p5.noFill()
      p5.stroke(161, 95, 251)
      p5.strokeWeight(2 / that.inElement.contentScale)
      p5.push()
      p5.translate(that.inElement.x + that.inElement.contentX, that.inElement.y + that.inElement.contentY)
      p5.scale(that.inElement.contentW / this.outputActualWidth) // TODO : check this ... this may be a bug with 0.5 scale
      for (let i = 0; i < detections.length; i++) {
        let hand = detections[i]
        if (that.showBoundingBox) {
          let bb = hand.boundingBox
          p5.rect(bb.topLeft[0], bb.topLeft[1], bb.bottomRight[0] - bb.topLeft[0], bb.bottomRight[1] - bb.topLeft[1])
        }
        if (that.showKeypoints) {
          for (let j = 0; j < hand.landmarks.length; j += 1) {
            const keypoint = hand.landmarks[j]
            p5.fill(0, 255, 0)
            p5.noStroke()
            p5.ellipse(keypoint[0], keypoint[1], 10, 10)
          }
        }
        if (that.showSkeleton) {
          const fingerLookupIndices = {
            thumb: [0, 1, 2, 3, 4],
            indexFinger: [0, 5, 6, 7, 8],
            middleFinger: [0, 9, 10, 11, 12],
            ringFinger: [0, 13, 14, 15, 16],
            pinky: [0, 17, 18, 19, 20],
          }
          const fingers = Object.keys(fingerLookupIndices)
          for (let i = 0; i < fingers.length; i++) {
            const finger = fingers[i]
            const points = fingerLookupIndices[finger].map((idx) => hand.landmarks[idx])
            this.drawPart(p5, points, false)
          }
        }
      }
      p5.pop()
      p5.pop()
    }
  }
  drawPart(p5, feature, closed) {
    p5.noFill()
    p5.stroke(255, 0, 0)
    p5.beginShape()
    for (let i = 0; i < feature.length; i++) {
      const x = feature[i][0]
      const y = feature[i][1]
      p5.vertex(x, y)
    }

    if (closed === true) {
      p5.endShape(p5.CLOSE)
    } else {
      p5.endShape()
    }
  }
  createElementMenu() {
    let menu = this._createMenu()
    this.showKeypointsMenu = menu.addCheckedMenu('Show Keypoints', this.showKeypoints, (ui, value) => {
      this.hideMenu()
      this.showKeypoints = value
    })
    this.showSkeletonMenu = menu.addCheckedMenu('Show Skeleton', this.showSkeleton, (ui, value) => {
      this.hideMenu()
      this.showSkeleton = value
    })
    menu.addSeparator()
    this.outputTypeMenu = menu.addSelectMenu(
      ['Output Raw Data', 'Output Keypoints Array', 'Output Flatten Array'],
      this.outputType,
      (ui, value) => {
        //console.log('selected', value);
        this.hideMenu()
        this.outputType = value
        if (this.outputType == 0) {
          this.outType = '้handpose'
        } else if (this.outputType == 1) {
          this.outType = 'tensor'
        } else if (this.outputType == 2) {
          this.outType = 'tensor'
        }
      }
    )
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }
}

class mlxFaceAPI extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'FaceAPI'
    this.title = 'FaceAPI'

    this.inType = 'image'
    this.outType = 'tensor'

    this.h = 100
    this.showKeypoints = true
    this.showSkeleton = true
    this.showNames = false
    this.showOverlay = false
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconFaceAPI.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    const detection_options = {
      withLandmarks: true,
      withDescriptors: false,
    }

    this.model = ml5.faceApi(detection_options, () => {
      console.log('Model FaceAPI is ready')

      this.ready = true
      this.label.setText('Ready')
    })
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    }
  }

  doProcess() {
    //this.outputIsReady = false;
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

      p5.noFill()
      p5.stroke(161, 95, 251)
      p5.strokeWeight(2 / that.inElement.contentScale)

      let detections = that.output

      p5.push()
      p5.translate(that.inElement.x + that.inElement.contentX, that.inElement.y + that.inElement.contentY)
      p5.scale(that.inElement.contentScale)

      for (let i = 0; i < detections.length; i++) {
        const mouth = detections[i].parts.mouth
        const nose = detections[i].parts.nose
        const leftEye = detections[i].parts.leftEye
        const rightEye = detections[i].parts.rightEye
        const rightEyeBrow = detections[i].parts.rightEyeBrow
        const leftEyeBrow = detections[i].parts.leftEyeBrow

        that.drawPart(p5, mouth, true)
        that.drawPart(p5, nose, false)
        that.drawPart(p5, leftEye, true)
        that.drawPart(p5, leftEyeBrow, false)
        that.drawPart(p5, rightEye, true)
        that.drawPart(p5, rightEyeBrow, false)
      }
      p5.pop()
      p5.pop()
    }
  }

  drawPart(p5, feature, closed) {
    p5.beginShape()
    for (let i = 0; i < feature.length; i++) {
      const x = feature[i]._x
      const y = feature[i]._y
      p5.vertex(x, y)
    }

    if (closed === true) {
      p5.endShape(p5.CLOSE)
    } else {
      p5.endShape()
    }
  }
}

class mlxYolo extends mlxElementModel {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'YoLo'
    this.title = 'YoLo'

    this.inType = 'image'
    this.outType = 'results'

    this.h = 100
    this.showKeypoints = true
    this.showSkeleton = true
    this.showNames = false
    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconYOLO.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.model = ml5.YOLO(() => {
      console.log('Model YOLO is ready')

      this.ready = true
      this.label.setText('Ready')
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

class mlxUNET extends mlxElementModel {
  constructor(mlx) {
    super(mlx)

    this.category = 'Model'
    this.type = 'UNET'
    this.title = 'UNET'

    this.inType = 'image'
    this.outType = 'image'

    this.segmentationImage = null
    this.enable = false

    this.uNet = ml5.uNet('face')
    this.ready = false
    this.allowExtraInElement = true
    this.createElementMenu()

    this.h = 100

    this.icon = this.mlx.createImage(this, '/assets/iconUNET.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)
  }

  update() {
    super.update()
    if (this.uNet.modelReady) {
      this.ready = true
      this.label.setText('Ready')
    }
  }

  doProcess() {
    if (!this.outElement || !this.outputIsReady) {
      if (this.uNet.modelReady) {
        this.busy = true
        if (this.inElement) {
          this.inElement.outputIsReady = false
        }
        this.uNet.segment(this.inElement.output, (error, result) => {
          // if there's an error return it
          if (error) {
            console.error(error)
            return
          }
          // set the result to the global segmentation variable
          this.segmentationImage = result.backgroundMask
          if (this.inElement) {
            this.inElement.replaceImage = this.segmentationImage

            for (let i in this.extraInElement) {
              let elx = this.extraInElement[i]
              if (elx.outType === 'image' && elx.category == 'Filter') {
                if (elx.filter) {
                  this.inElement.replaceImage = elx.filter(this.segmentationImage)
                  break
                }
              }
            }

            for (let i in this.extraInElement) {
              let elx = this.extraInElement[i]
              if (elx.outType === 'image' && elx.category == 'Input') {
                if (elx.output && elx.outputIsReady) {
                  this.inElement.backgroundImage = elx.output
                  break
                }
              }
            }
          }
          this.busy = false
          this.outputIsReady = true
          this.alreadyRunInLoop = true
        })
      } else {
        console.log(this.uNet)
        this.segmentationImage = this.inElement.output
        this.busy = false
        this.outputIsReady = true
        this.alreadyRunInLoop = true
      }
    }

    return true
  }
}

class mlxParticle extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.category = 'Filter'
    this.type = 'Particle'
    this.title = 'Particle Generator'

    this.inType = 'none'
    this.outType = 'image'

    this.h = 100

    this.particleW = 128
    this.particleH = 128
    this.particleImage = this.p5.createGraphics(this.particleW, this.particleH)

    this.particles = []
    this.particle_speed = 0.001
    this.max_particles = 2000
    this.particle_size = 20
    this.speed_limit = 100

    this.run = false
    this.createParticle()

    this.gravity = this.p5.createVector(0, 3 / 60000)
    this.then = this.now = Date.now()

    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconParticles.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 18, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.ready = true
    this.label.setText('Ready')
  }

  createElementMenu() {
    let menu = this._createMenu()

    menu.addCommand('Reset', (ui) => {
      this.hideMenu()
      this.run = false
      this.createParticle()
    })
    menu.addCommand('Explode', (ui) => {
      this.hideMenu()
      this.createParticle()
      this.then = this.now = Date.now()
      this.run = true
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  createParticle() {
    this.particles = []
    for (let y = 0; y < this.particleH; y++) {
      for (let x = 0; x < this.particleW; x++) {
        let v = this.p5.createVector(x - this.particleW / 2, y - this.particleH / 2).normalize()
        let r = this.p5.random(1, 3)

        v.mult(r / 100)
        let p = {
          position: this.p5.createVector(x, y),
          target: v,
        }
        this.particles.push(p)
      }
    }
  }

  update() {
    super.update()
    if (this.run) {
      this.now = Date.now()
      let elapseTime = this.now - this.then
      for (let i in this.particles) {
        let p = this.particles[i]
        let vG = p5.Vector.mult(this.gravity, elapseTime)
        p.target.add(vG)
        let vP = p5.Vector.mult(p.target, elapseTime)
        p.position.add(vP)
      }
      this.then = this.now
    }
  }

  filter(img) {
    img.loadPixels()
    //this.particleImage.background("rgba(0,255,0, 0)");
    //this.particleImage.rect(0, 0, this.particleW, this.particleH);
    this.particleImage.loadPixels()
    let stepY = img.height / this.particleH
    let stepX = img.width / this.particleW

    for (let y = 0; y < this.particleH; y++) {
      for (let x = 0; x < this.particleW; x++) {
        this.particleImage.set(x, y, [0, 0, 0, 0])
      }
    }

    let yy = 0
    for (let y = 0; y < this.particleH; y++) {
      let xx = 0
      for (let x = 0; x < this.particleW; x++) {
        let idx = x + y * this.particleW
        let index = xx + yy * img.width
        let index4 = index * 4
        let a = img.pixels[index4 + 3]

        if (a) {
          let r = img.pixels[index4 + 0]
          let g = img.pixels[index4 + 1]
          let b = img.pixels[index4 + 2]
          this.particleImage.set(this.particles[idx].position.x, this.particles[idx].position.y, [r, g, b, a])
        }
        xx += stepX
      }
      yy += stepY
    }
    this.particleImage.updatePixels()

    return this.particleImage
  }
}

module.exports = {
  mlxImageClassifier,
  mlxMobileNet,
  mlxSoundCommand18w,
  mlxDoodleNet,
  mlxPoseNet,
  mlxHandPose,
  mlxFaceAPI,
  mlxYolo,
  mlxUNET,
  mlxParticle,
}
