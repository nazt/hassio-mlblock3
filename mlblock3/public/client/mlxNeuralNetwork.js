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

class mlxNeuralNetwork extends mlxElementModel {
  constructor(mlx) {
    super(mlx)
    this.numResults = 0
  }
}

class mlxNeuralNetworkClassifier extends mlxNeuralNetwork {
  constructor(mlx) {
    super(mlx)

    console.log('NNC')

    this.category = 'DeepLeaning'
    this.type = 'NeuralNetworkClassifier'
    this.title = 'Neural Network (Classifier)'

    this.inType = 'tensor'
    this.outType = 'results'

    this.w = 400
    this.h = 100
    this.mode = 0
    this.needMouse = true
    this.classNames = ['A', 'B', 'C', 'D', 'E']
    this.currentClass = 'A'

    this.classifier = null
    this.trained = false
    this.losses = []
    this.highestLoss = 0

    this.currentClassIndex = 0

    this.counts = [0, 0, 0, 0, 0]
    this.rawData = {}
    this.classCounts = 0
    this.totalCounts = 0
    this.dataShape = []

    this.customLayersInfo = null
    this.autoLayersInfo = null
    this.layerH = 36
    this.isAutoNeuron = true
    this.activationList = ['linear', 'sigmoid', 'relu', 'softmax']
    this.layerTypeList = ['dense', 'flatten', 'conv2d', 'maxPooling2d']
    this.neuronColor = {
      input: this.p5.color(255, 192, 0),
      hidden: this.p5.color(0, 255, 0),
      output: this.p5.color(255, 0, 0),
    }
    this.createElementMenu()
    this.currentValue = 0
    this.defaultLayers = [
      {
        name: 'dense',
        units: 16,
        input: {
          shape: [null, 2],
        },
        activation: {
          constructor: {
            className: 'relu',
          },
        },
      },
      {
        name: 'dense',
        units: 2,
        input: {
          shape: [null, 16],
        },
        activation: {
          constructor: {
            className: 'sigmoid',
          },
        },
      },
    ]

    this.icon = this.mlx.createImage(
      this,
      '/assets/iconNeuralNetworkClassifier.jpg',
      1,
      this.mlx.mlxCaptionHeight + 1,
      398,
      44
    )
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.createAddUI()

    this.trainLogX = 95
    this.trainLogY = this.mlx.mlxCaptionHeight + 44 + 10
    this.trainLogW = this.w - 105
    this.trainLogH = 122 // this.categoryMenu.h

    this.labelTrain = this.mlx.createLabel(
      this,
      'No training data',
      this.trainLogX,
      this.trainLogY + this.trainLogH + 4,
      this.trainLogW,
      24
    )

    this.addLayerButtron = this.mlx.createButton(
      this,
      'add hidden layer',
      () => {
        let player = null
        if (this.customLayersInfo.length >= 2) {
          player = this.customLayersInfo[this.customLayersInfo.length - 2]
        } else if (this.customLayersInfo.length == 1) {
          player = this.customLayersInfo[this.customLayersInfo.length - 1]
        }
        if (player) {
          let layer = {
            type: player.type,
            units: player.units,
            input: player.units,
            activation: player.activation,
          }

          if (this.customLayersInfo.length >= 2) {
            this.customLayersInfo.splice(this.customLayersInfo.length - 1, 0, layer)
          } else {
            this.customLayersInfo.push(layer)
          }
          this.updateLayersView()
        }
      },
      10,
      this.h - 32,
      150,
      24
    )
    this.addLayerButtron.border = true
    this.addLayerButtron.hidden = true

    this.autoNeuronCheckBox = this.mlx.createCheckBox(
      this,
      'Auto Gen',
      (ui, value) => {
        this.isAutoNeuron = value

        if (!this.isAutoNeuron) {
          this.addLayerButtron.hidden = false
          let layers
          if (!this.customLayersInfo) {
            if (this.autoLayersInfo.length) {
              layers = this.autoLayersInfo
            } else {
              layers = this.defaultLayers
            }
            this.customLayersInfo = layers.slice()
          }
          this.updateLayersView()
        } else {
          this.addLayerButtron.hidden = true
          this.updateLayersView()
        }
      },
      this.isAutoNeuron,
      this.w - 172,
      this.h - 28,
      100,
      20
    )
    this.autoNeuronCheckBox.showBox = true

    this.trainButton = this.mlx.createButton(
      this,
      'train',
      () => {
        console.log('train')
        if (this.inElement && this.inElement.output) {
          this.losses = []
          this.highestLoss = 0

          this.updateLayersView()
          let nnoptions
          if (this.mode == 1) {
            // Create ethe model
            let IMAGE_WIDTH = this.dataShape[1]
            let IMAGE_HEIGHT = this.dataShape[0]
            let IMAGE_CHANNELS = this.dataShape[2]
            nnoptions = {
              inputs: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
              outputs: ['label'],
              //debug: true,
              task: 'imageClassification',
            }
          } else if (this.mode == 0) {
            nnoptions = {
              outputs: ['label'],
              //debug: true,
              task: 'classification',
            }
          } else if (this.mode == 2) {
            nnoptions = {
              outputs: 1,
              //debug: true,
              task: 'regression',
              learningRate: 0.02,
            }
          }

          console.log(nnoptions)
          this.classifier = ml5.neuralNetwork(nnoptions)

          if (!this.isAutoNeuron) {
            console.log(this.customLayersInfo)
            for (let ci = 0; ci < this.customLayersInfo.length; ci++) {
              let layerInfo = this.customLayersInfo[ci]
              let layerSpec = {
                type: layerInfo.type,
                units: layerInfo.units,
                activation: layerInfo.activation,
              }
              let layer1
              if (layerInfo.type == 'dense') {
                if (ci == 0) {
                  layerSpec.inputShape = this.dataShape
                } else if (ci == this.customLayersInfo.length - 1) {
                  console.log(layerSpec)
                  console.log(this.classCounts)
                  layerSpec.units = this.classCounts
                  layerInfo.units = this.classCounts
                }
                layer1 = ml5.tf.layers.dense(layerSpec)
              } else if (layerInfo.type == 'conv2d') {
                layerSpec.filters = 2
                layerSpec.kernelSize = 2
                layerSpec.strides = 2
                layerSpec.kernelInitializer = 'varianceScaling'
                if (ci == 0) {
                  layerSpec.inputShape = this.dataShape
                }

                layer1 = ml5.tf.layers.conv2d(layerSpec)
              }
              console.log(layerSpec)
              console.log(layer1)
              this.classifier.addLayer(layer1)
            }
          }

          this.addDataToNN()
          this.classifier.normalizeData()
          this.loss = null
          let options = {
            epochs: 400,
            learningRate: 0.2,
          }
          if (this.mode == 2) {
            //options.learningRate = 0.05;
          }
          this.classifier.train(
            options,
            (epoch, logs) => {
              let lossValue = logs.loss

              if (lossValue) {
                //console.log(lossValue);
                //console.log(`Epoch: ${epoch} - loss: ${lossValue}`);
                this.loss = lossValue
                //console.log('Loss: ' + this.loss);
                this.labelTrain.setText(`${epoch} Loss: ` + this.loss.toFixed(2))
                this.losses.push(lossValue)
                if (lossValue > this.highestLoss) this.highestLoss = lossValue
                this.drawed = false
              } else {
                console.log('no lossValue')
              }
            },
            () => {
              // Finish training

              console.log('Done Training! Final Loss: ' + this.loss.toFixed(2))
              this.labelTrain.setText('Done Training! Final Loss: ' + this.loss.toFixed(2))
              this.trained = true
              this.drawed = false
              console.log(this.classifier)

              this.autoLayersInfo = this.layerToLayerInfo(this.classifier.neuralNetwork.model.layers)
              console.log(this.autoLayersInfo)
              this.updateLayersView()
            }
          )
        }
      },
      this.w - 72,
      this.h - 28,
      68,
      24
    )
    this.trainButton.border = true

    this.h += 160
    this.label.yy += 160
    this.trainButton.yy += 160
    this.autoNeuronCheckBox.yy += 160

    this.saveH = this.h
    this.saveLabelY = this.label.yy
    this.saveTrainButtonY = this.trainButton.yy

    /*
        let layer1 = ml5.tf.layers.dense({
            units: 32,
            inputShape: [2],
            activation: 'relu',
        });
        this.classifier.addLayer(layer1);


        let layer2 = ml5.tf.layers.dense({
            units: 32,
            activation: 'relu',
        });
        this.classifier.addLayer(layer2);


        let layer3 = ml5.tf.layers.dense({
            units: 4,
            activation: 'relu',
        });
        this.classifier.addLayer(layer3);

        let layer4 = ml5.tf.layers.dense({
            units: 2,
            activation: 'softmax',
        });
        this.classifier.addLayer(layer4);
        */

    //console.log(this.classifier.neuralNetwork.model.layers);

    this.createLayerTypeMenu()
    this.createActivationMenu()

    this.getButton.hidden = false
    this.ready = true
  }

  save() {
    let data = super.save()

    data.counts = this.counts
    data.rawData = this.rawData
    data.classCounts = this.classCounts
    data.totalCounts = this.totalCounts
    data.dataShape = this.dataShape
    data.isAutoNeuron = this.isAutoNeuron
    data.customLayersInfo = this.customLayersInfo
    data.mode = this.mode

    return data
  }

  load(data) {
    super.load(data)
    this.counts = data.counts
    this.rawData = data.rawData
    this.classCounts = data.classCounts
    this.totalCounts = data.totalCounts
    this.dataShape = data.dataShape
    this.isAutoNeuron = data.isAutoNeuron
    this.customLayersInfo = data.customLayersInfo
    if (!data.mode) data.mode = 0
    this.mode = data.mode
    this.autoNeuronCheckBox.value = this.isAutoNeuron
    if (this.select) {
      for (let i in this.classNames) {
        if (this.counts[i]) {
          this.select.setTitle(i, `${this.classNames[i]} (${this.counts[i]})`)
        } else {
          this.select.setTitle(i, `${this.classNames[i]}`)
        }
      }
    }
    this.labelTrain.setText(`Data shape: [${this.dataShape.toString()}]`)
    if (!this.isAutoNeuron) {
      this.addLayerButtron.hidden = false
    }
    this.updateLayersView()
  }

  createAddUI() {
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

    this.getButton = this.mlx.createButton(
      this,
      'add',
      () => {
        if (this.inElement && this.inElement.output) {
          console.log('add', this.currentClass, this.inElement.output)
          this.counts[this.currentClassIndex] += 1
          this.select.setTitle(this.currentClassIndex, `${this.currentClass} (${this.counts[this.currentClassIndex]})`)
          this.addData(this.inElement.output, [this.currentClass])
        }
      },
      10,
      205,
      75,
      24
    )
    this.getButton.border = true
    this.getButton.hidden = true
  }

  createElementMenu() {
    let menu = this._createMenu()

    menu.addSelectMenu(['Classification', 'Image Classification'], this.mode, (ui, value) => {
      this.mode = parseInt(value)
      console.log('selected', value)
      this.hideMenu()
    })
    menu.addSeparator()
    menu.addCommand('Clear Data', (ui) => {
      this.hideMenu()
      this.clearData()
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  clearData() {
    this.counts = [0, 0, 0, 0, 0]
    for (let i in this.counts) {
      this.select.setTitle(i, `${this.classNames[i]}`)
    }
    this.currentClassIndex = 0
    this.rawData = {}
    this.classCounts = 0
    this.totalCounts = 0
    this.dataShape = []
  }

  layerToLayerInfo(layers) {
    if (layers.length) {
      let customLayersInfo = []
      for (let i in layers) {
        let autoLayer = layers[i]
        let cl = {}

        if (autoLayer.input.shape.length > 2) {
          cl.input = 1
        } else {
          cl.input = autoLayer.input.shape.slice(1)[0]
        }

        cl.shapeInput = autoLayer.input.shape.slice(1)
        cl.shapeOutput = autoLayer.output.shape

        if (autoLayer.output.shape.length > 2) cl.output = 1
        else cl.output = autoLayer.output.shape[1]

        if (autoLayer.activation) {
          cl.activation = autoLayer.activation.constructor.className
        } else cl.activation = ''

        if (autoLayer.units) cl.units = autoLayer.units
        else cl.units = 1

        if (autoLayer.name.startsWith('dense')) {
          cl.type = 'dense'
        } else if (autoLayer.name.startsWith('conv2d')) {
          cl.type = 'conv2d'
          cl.filters = autoLayer.filters
          cl.kernelSize = autoLayer.kernelSize
          cl.strides = autoLayer.strides
          cl.units = autoLayer.filters
        } else if (autoLayer.name.startsWith('max_pooling2d')) {
          cl.type = 'maxPooling2d'
          cl.strides = autoLayer.strides
          cl.poolSize = autoLayer.poolSize
          cl.units = 1 //autoLayer.input.shape[3];
          cl.input = autoLayer.input.shape[3]
        } else if (autoLayer.name.startsWith('flatten')) {
          cl.type = 'flatten'
          cl.units = cl.output
        } else {
          cl.type = autoLayer.name
        }
        customLayersInfo.push(cl)
      }
      return customLayersInfo
    }
    return null
  }

  createActivationMenu() {
    this.menuActivation = this.mlx.createMenu(this, 10, this.mlx.mlxCaptionHeight)
    this.menuActivation.hidden = true
    this.menuActivation.alwaysOnTop = true
    this.submenuActivation = this.menuActivation.addSelectMenu(this.activationList, 2, (ui, value) => {
      //console.log(this.currentActiveLayer, value);
      let v = parseInt(value)
      let act = this.activationList[v]
      this.customLayersInfo[this.currentActiveLayer].activation = act
      this.mlx.hidePopup(this.menuActivation)
    })
  }

  createLayerTypeMenu() {
    this.menuLayerType = this.mlx.createMenu(this, 10, this.mlx.mlxCaptionHeight)
    this.menuLayerType.hidden = true
    this.menuLayerType.alwaysOnTop = true
    this.submenuLayerType = this.menuLayerType.addSelectMenu(this.layerTypeList, 2, (ui, value) => {
      //console.log(this.currentActiveLayer, value);
      let v = parseInt(value)
      let type = this.layerTypeList[v]
      this.customLayersInfo[this.currentActiveLayer].type = type
      this.mlx.hidePopup(this.menuLayerType)
    })
  }

  changeNeuron(nLayer, num) {
    if (nLayer >= 0 && nLayer < this.customLayersInfo.length) {
      if (this.customLayersInfo[nLayer].units + num > 0) {
        this.customLayersInfo[nLayer].units += num
        if (nLayer < this.customLayersInfo.length - 1) {
          this.customLayersInfo[nLayer + 1].input += num
        }
      }
    }
  }

  removeLayer(layer) {
    console.log('remove ', layer)
    this.customLayersInfo.splice(layer, 1)
    if (layer < this.customLayersInfo.length)
      this.customLayersInfo[layer].input = this.customLayersInfo[layer - 1].units
    this.updateLayersView()
  }

  mousePressed() {
    if (!super.mousePressed()) return false
    let y = this.saveH
    y += this.layerH
    if (!this.isAutoNeuron) {
      let mX = this.mlx.mouseX - this.x - this.mlx.mlxPadding
      let mY = this.mlx.mouseY - this.y

      this.layers = this.customLayersInfo
      for (let i = 0; i < this.layers.length; i++) {
        let layer = this.layers[i]
        let activation = this.layers[i].activation
        let layerType = this.layers[i].type
        let tb = this.mlx.myFont.textBounds(activation, 0, 0, 14)
        //console.log(this.layers[i]);

        let x0 = (this.w - this.mlx.mlxPadding - (layer.units - 1) * 12) / 2 - 6
        let x1 = x0 + layer.units * 12
        if (mY >= y && mY < y + this.layerH) {
          if (mX < 15) {
            this.changeNeuron(i, -1)
          } else if (mX < 30) {
            this.changeNeuron(i, 1)
          } else if (mX > this.w - 10 - this.mlx.mlxPadding * 2) {
            this.removeLayer(i)
          } else if (mX > this.w - 20 - this.mlx.mlxPadding * 2 - tb.w) {
            console.log(this.w - 20 - this.mlx.mlxPadding - tb.w)
            console.log('activation', activation)
            this.submenuActivation.setValue(this.activationList.indexOf(activation))
            this.currentActiveLayer = i
            this.menuActivation.hidden = false
            this.menuActivation.xx = this.w - 20 - this.mlx.mlxPadding - tb.w
            this.menuActivation.yy = y + this.layerH
            this.mlx.popup.push(this.menuActivation)
          } else if (mX >= x0 && mX <= x1) {
            console.log('layerType', layerType)
            this.submenuLayerType.setValue(this.layerTypeList.indexOf(layerType))
            this.currentActiveLayer = i
            this.menuLayerType.hidden = false
            this.menuLayerType.xx = (this.w - this.menuLayerType.w) / 2
            this.menuLayerType.yy = y + this.layerH
            this.mlx.popup.push(this.menuLayerType)
          }
          return false
        }
        y += this.layerH
      }
    }
    return true
  }

  classify(data, cb) {
    if (!this.trained) return
    this.classifier.classify(data, (error, results) => {
      if (error) {
        console.error(error)
      } else {
        //console.log(results);
        if (cb) {
          cb({ label: results[0].label, data: data })
        }
      }
    })
  }

  classifyMultiple(data, cb) {
    if (!this.trained) return
    this.classifier.classifyMultiple(data, (error, results) => {
      if (error) {
        console.error(error)
      } else {
        //console.log(results);
        if (cb) {
          cb(results)
        }
      }
    })
  }

  updateLayersView() {
    if (this.isAutoNeuron) {
      this.layers = this.autoLayersInfo
    } else {
      this.layers = this.customLayersInfo
    }
    this.h = this.saveH
    this.label.yy = this.saveLabelY
    this.trainButton.yy = this.saveTrainButtonY
    this.autoNeuronCheckBox.yy = this.saveTrainButtonY
    if (this.layers && this.layers.length > 0) {
      this.h += this.layerH
      this.h += this.layerH * this.layers.length
      this.h += 44
    }
    this.addLayerButtron.yy = this.h - 32
  }

  addDataToNN() {
    let keys = Object.keys(this.rawData)
    for (var i in keys) {
      let key = keys[i]
      let cdata = this.rawData[key]
      for (var dindex in cdata) {
        let data
        if (cdata[dindex].flat) {
          data = cdata[dindex].flat()
          while (data[0].length) {
            data = data.flat()
          }
        } else {
          data = cdata[dindex]
        }
        let options = {
          inputLabels: Object.keys(data),
          outputLabels: ['labels'],
        }
        this.classifier.addData(data, [key], options)
      }
    }
  }

  addData(data, label) {
    let l = []
    let d = data
    while (d.length) {
      l.push(d.length)
      d = d[0]
    }

    this.dataShape = l
    this.labelTrain.setText(`Data shape: [${this.dataShape.toString()}]`)

    let keys = Object.keys(this.rawData)
    if (!Array.isArray(this.rawData[label])) {
      this.rawData[label] = []
      this.classCounts += 1
    }
    this.rawData[label].push(data)
    this.totalCounts += 1
  }

  doProcess() {
    this.busy = true
    this.outputIsReady = false
    if (this.inElement.output) {
      console.log('[nat] nn output', this.inElement.output)
      //console.log(this.inElement.output);
      let data = this.inElement.output
      if (data.label && data.data) {
        //console.log("Labeled Data", data.data, data.label);

        try {
          this.addData(data.data, [data.label])
          //this.labelTrain.setText(`${this.totalCounts} data added`);

          let index = this.classNames.indexOf(data.label)
          this.counts[index] += 1

          if (index >= 0) {
            this.select.setTitle(index, `${data.label} (${this.counts[index]})`)
          }
        } catch (e) {
          console.log('ERROR', e)
        }
        this.busy = false
        this.output = this.inElement.output
        this.outputIsReady = true
        this.alreadyRunInLoop = true
        if (this.inElement) this.inElement.outputIsReady = false
      } else {
        if (!this.trained) {
          this.busy = false
          if (this.inElement) this.inElement.outputIsReady = false
          return false
        }
        let data
        if (this.inElement.output.flat) {
          data = this.inElement.output.flat()
          while (data[0].length) {
            data = data.flat()
          }
        } else {
          data = this.inElement.output
        }
        if (this.mode == 2) {
          this.classifier.predict(data, (error, results) => {
            if (error) {
              console.error(error)
              return
            }
            console.log(results)
            this.busy = false
            this.output = { value: results[0].value }
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            if (this.inElement) this.inElement.outputIsReady = false
          })
        } else {
          this.classifier.classify(data, (error, results) => {
            if (error) {
              console.error(error)
              return
            }
            //console.log(results);
            this.busy = false
            this.output = results
            this.outputIsReady = true
            this.alreadyRunInLoop = true
            if (this.inElement) this.inElement.outputIsReady = false
          })
        }
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
        this.label.setText('(Untrained)')
      }
    }
  }

  drawNumNeuronButton(p5, y, i, isCustom, layer) {
    p5.fill(0, 0, 255)
    p5.noStroke()
    p5.textAlign(this.p5.LEFT, this.p5.CENTER)

    if (isCustom) {
      if (layer.type == 'dense') {
        p5.text('-', this.x + this.mlx.mlxPadding, this.y + y - 3)
        p5.text('+', this.x + this.mlx.mlxPadding + 20, this.y + y - 3)
        p5.text(layer.units, this.x + this.mlx.mlxPadding + 40, this.y + y - 3)
      } else if (layer.type == 'conv2d') {
        let text = `${layer.filters}x[${layer.kernelSize.toString()}] >[${layer.strides.toString()}]`
        p5.text(text, this.x + this.mlx.mlxPadding, this.y + y - 3)
      } else if (layer.type == 'maxPooling2d') {
        let text = `[${layer.poolSize.toString()}] >[${layer.strides.toString()}]`
        p5.text(text, this.x + this.mlx.mlxPadding, this.y + y - 3)
      } else if (layer.type == 'flatten') {
        p5.text(layer.units, this.x + this.mlx.mlxPadding, this.y + y - 3)
      }
    }
  }

  drawLayer(p5, y, num, color, activation, deletable, type, input) {
    p5.fill(this.neuronColor[color])
    p5.stroke(0)
    p5.strokeWeight(1)
    if (type == 'dense' || type == 'input' || type == 'flatten') {
      let n = num
      if (n > 16) n = 16
      let x = (this.w - (n - 1) * 12) / 2
      for (let i = 0; i < n; i++) {
        p5.ellipse(this.x + x + i * 12, this.y + y, 8, 8)
      }
    }
    if (type != 'dense' && type != 'input') {
      let text = type + ' [' + input.toString() + ']'
      if (type == 'flatten') {
        text = type + ' to ' + num
      }
      let b = this.mlx.myFont.textBounds(text, 0, 0, 14)

      let x = (this.w - (b.w + 16)) / 2
      p5.stroke(0)
      p5.fill(255)
      p5.rect(this.x + x, this.y + y - 1 - b.h, b.w + 16, b.h + 8)

      p5.noStroke()
      p5.fill(0)
      x = this.w / 2
      p5.textAlign(this.p5.CENTER, this.p5.CENTER)
      p5.text(text, this.x + x, this.y + y - b.h / 2)
    }
    p5.noStroke()
    p5.textSize(14)
    if (deletable) p5.fill(0, 0, 255)
    else p5.fill(64, 64, 64)
    p5.textAlign(this.p5.RIGHT, this.p5.CENTER)
    p5.text(activation, this.x + this.w - this.mlx.mlxPadding - 20, this.y + y - 3)
    p5.fill(0)
    if (deletable) p5.text('x', this.x + this.w - this.mlx.mlxPadding, this.y + y - 2)
  }

  drawLayerLink(p5, y2, num1, num2, color, type) {
    p5.fill(this.neuronColor[color])
    p5.stroke(128)
    p5.strokeWeight(1)
    let n1 = Math.min(num1, 16)
    let n2 = Math.min(num2, 16)
    let x1 = (this.w - (n1 - 1) * 12) / 2
    let x2 = (this.w - (n2 - 1) * 12) / 2
    let y1 = y2 - this.layerH

    for (let i = 0; i < n1; i++) {
      x2 = (this.w - (n2 - 1) * 12) / 2
      for (let j = 0; j < n2; j++) {
        p5.line(this.x + x1, this.y + y1, this.x + x2, this.y + y2)
        x2 += 12
      }
      x1 += 12
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
    p5.fill(0)
    p5.noStroke()

    if (this.isAutoNeuron) {
      this.drawLayers = this.autoLayersInfo
    } else {
      this.drawLayers = this.customLayersInfo
    }

    if (this.drawLayers && this.drawLayers.length > 0) {
      let type = 'input'

      let y = this.saveH + this.layerH / 2
      y += this.layerH
      for (var i in this.drawLayers) {
        let layer = this.drawLayers[i]
        let inputNum = layer.input
        let num = layer.units
        if (!num) num = 1
        this.drawLayerLink(p5, y, inputNum, num, type, layer.type)
        y += this.layerH
      }

      y = this.saveH + this.layerH / 2
      let inputNum = this.drawLayers[0].input
      this.drawLayer(p5, y, inputNum, 'input', 'input', false, 'input', this.drawLayers[0].shapeInput)
      y += this.layerH
      for (i in this.drawLayers) {
        type = 'hidden'
        if (i == this.drawLayers.length - 1) type = 'output'
        let layer = this.drawLayers[i]
        let num = layer.units
        if (!num) num = 1
        //let text = `Layer #${i + 1}: ${num} neurons`;
        //if (layer.activation)
        this.drawLayer(p5, y, num, type, layer.activation, i < this.drawLayers.length - 0, layer.type, layer.shapeInput)
        //if (!this.isAutoNeuron)
        {
          p5.fill(0, 0, 255)
          this.drawNumNeuronButton(p5, y, i, i < this.drawLayers.length - 1, layer)
          p5.fill(0)
        }
        y += this.layerH
      }
    }
  }
}

class mlxNeuralNetworkRegressor extends mlxNeuralNetworkClassifier {
  constructor(mlx) {
    super(mlx)

    this.mode = 2

    this.category = 'DeepLeaning'
    this.type = 'NeuralNetworkRegressor'
    this.title = 'Neural Network (Regressor)'

    this.inType = 'tensor'
    this.outType = 'results'

    this.regressor = null
    this.currentValue = 0

    this.rawData = []

    this.icon = this.mlx.createImage(
      this,
      '/assets/iconNeuralNetworkRegressor.jpg',
      1,
      this.mlx.mlxCaptionHeight + 1,
      398,
      44
    )
  }

  createElementMenu() {
    let menu = this._createMenu()

    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }
  createAddUI() {
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

    this.getButton = this.mlx.createButton(
      this,
      'add',
      () => {
        if (this.inElement && this.inElement.output) {
          console.log('add', this.currentValue)
          this.counts[0] += 1
          this.addData(this.inElement.output, this.currentValue)
        }
      },
      10,
      205,
      75,
      24
    )

    this.getButton.border = true
    this.getButton.hidden = true
  }

  addData(data, value) {
    let l = []
    let d = data
    while (d.length) {
      l.push(d.length)
      d = d[0]
    }

    this.dataShape = l

    this.rawData.push({ value: value, data: data })
    this.totalCounts += 1

    this.labelTrain.setText(`Shape: [${this.dataShape.toString()}] (${this.totalCounts} added)`)
  }

  addDataToNN() {
    for (var i in this.rawData) {
      let data = this.rawData[i]
      console.log('Add ', data.value, data.data)
      this.classifier.addData(data.data, [data.value])
    }
  }
}

module.exports = {
  mlxNeuralNetwork,
  mlxNeuralNetworkClassifier,
  mlxNeuralNetworkRegressor,
}
