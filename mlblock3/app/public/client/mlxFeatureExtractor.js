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

class mlxFeatureExtractor extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.numResults = 0
  }
}

class mlxMobileNetFeatureExtractor extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'MobileNetFeatureExtractor'
    this.title = 'MobileNet Feature Extractor'

    this.inType = 'image'
    this.outType = 'tensor'

    this.w = 400
    this.h = 100
    this.mode = 'logits'
    this.needMouse = true
    this.snapData = []

    this.outputType = 1
    this.createElementMenu()

    this.icon = this.mlx.createImage(
      this,
      '/assets/iconFeatureExtractor.jpg',
      1,
      this.mlx.mlxCaptionHeight + 1,
      398,
      44
    )
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.snapButton = this.mlx.createButton(
      this,
      'snap',
      () => {
        console.log('snap')

        if (this.inElement && this.inElement.output) {
          this.h += 32
          this.label.yy += 32
          this.snapButton.yy += 32

          const logits = this.features.infer(this.inElement.output)
          let data = logits.dataSync()
          console.log(data)
          this.snapData.push(data)
        }
      },
      this.w - 72,
      this.h - 28,
      68,
      24
    )
    this.snapButton.border = true

    this.h += 32
    this.label.yy += 32
    this.snapButton.yy += 32
    this.features = ml5.featureExtractor('MobileNet', () => {
      console.log('MobileNet Feature Extractor is ready')
      this.ready = true
      this.label.setText('Ready')

      console.log(this.features)
    })
  }

  getSoftMax(data) {
    let softMax = [0, 0, 0]
    let softMaxIndex = [-1, -1, -1]
    for (let i = 0; i < data.length; i++) {
      let d = data[i]
      if (d > softMax[0]) {
        softMax[0] = d
        softMaxIndex[0] = i
        continue
      }
      if (d > softMax[1] && d < softMax[0]) {
        softMax[1] = d
        softMaxIndex[1] = i
        continue
      }
      if (d > softMax[2] && d < softMax[1]) {
        softMax[2] = d
        softMaxIndex[2] = i
      }
    }
    //console.log(softMax);
    //console.log(softMaxIndex);
    return softMaxIndex
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addSelectMenu(['Output Raw Data', 'Output Flatten Array'], this.outputType, (ui, value) => {
      //console.log('selected', value);
      this.hideMenu()
      this.outputType = value
      if (this.outputType == 0) {
        this.outType = 'logits'
      } else if (this.outputType == 1) {
        this.outType = 'tensor'
      }
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  doProcess() {
    if (this.inElement.output) {
      if (!this.outElement || !this.outputIsReady) {
        if (this.inElement) this.inElement.outputIsReady = false
        this.busy = true

        const logits = this.features.infer(this.inElement.output)
        this.data = logits.dataSync()

        this.label.setText(`Ready (${this.mode})`)

        this.numResults = 256
        if (this.outType == 'logits') {
          this.output = logits
        } else {
          this.output = Array.prototype.slice.call(this.data)
        }

        this.busy = false
        this.outputIsReady = true
        this.alreadyRunInLoop = true
      }
      //this.label.setText(`${this.numResults} results found`);
      //console.log(this.output);
    }
    return true
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready')
    } else {
    }
  }

  draw(p5) {
    super.draw(p5)

    let y = this.mlx.mlxCaptionHeight + 44
    p5.stroke(211)
    p5.line(this.x, this.y + y, this.x + this.w, this.y + y)
    y += 32
    let xx = this.x + 130

    if (this.output) {
      let data = this.data

      p5.noStroke()
      p5.fill(0)

      p5.text('Real-time logits', xx - 120, this.y + y - 24)
      p5.stroke(64)
      for (var j = 0; j < data.length; j++) {
        p5.line(xx + j, this.y + y - 3, xx + j, this.y + y - 3 - (25 * data[j]) / 3)
      }
      /*
            let sm = this.getSoftMax(data);
            p5.stroke(255, 0, 0);
            for (var j = 0; j < sm.length; j++) {
                p5.line(xx + sm[j], this.y + y - 3, xx + sm[j], this.y + y - 3 - (25 * data[sm[j]] / 3))
            }
            */
    }
    p5.stroke(211)
    p5.line(this.x, this.y + y, this.x + this.w, this.y + y)
    y += 32

    for (var i = 0; i < this.snapData.length; i++) {
      let data = this.snapData[i]

      p5.noStroke()
      p5.fill(0)

      p5.text(`Logit snap #${i + 1}`, xx - 120, this.y + y - 24)

      p5.stroke(128)
      const xxx = this.x + (400 - data.length) / 2
      for (var j = 0; j < data.length; j++) {
        p5.line(xx + j, this.y + y - 3, xx + j, this.y + y - 3 - (25 * data[j]) / 3)
      }
      p5.stroke(211)
      p5.line(this.x, this.y + y, this.x + this.w, this.y + y)

      y += 32
    }
  }
}

class mlxMobileNetClassifier extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'MobileNetClassifier'
    this.title = 'MobileNet Classifier'

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
      '/assets/iconMobileNetClassifier.jpg',
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
          this.losses = []
          this.highestLoss = 0
          this.classifier.train((lossValue) => {
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

    const options = { numLabels: 5 }
    this.features = ml5.featureExtractor('MobileNet', options, () => {
      console.log('MobileNet Feature Extractor is ready')
      this.ready = true
      this.label.setText('Ready (No trained data)')

      console.log(this.features)
      this.getButton.hidden = false
    })

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

class mlxMobileNetRegressor extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    this.category = 'Model'
    this.type = 'MobileNetRegressor'
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
      '/assets/iconMobileNetRegressor.jpg',
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

module.exports = {
  mlxFeatureExtractor,
  mlxMobileNetFeatureExtractor,
  mlxMobileNetClassifier,
  mlxMobileNetRegressor,
}
