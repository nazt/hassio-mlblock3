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
const ConfusionMatrix = require('ml-confusion-matrix')
class mlxKNNClassifier extends mlxFeatureExtractor {
  constructor(mlx) {
    super(mlx)
    console.log('KNN')
    this.category = 'DeepLeaning'
    this.type = 'KNNClassifier'
    this.title = 'KNN Classifier'

    this.inType = 'tensor'
    this.outType = 'results'
    this.w = 200
    this.h = 100
    this.method = 1
    this.mode = 'classify'
    this.needMouse = true
    this.classNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    this.currentClass = 'A'
    this.currentClassIndex = 0
    this.classifier = null
    this.trained = false
    this.losses = []
    this.highestLoss = 0
    this.rawData = {}
    this.classCounts = 0

    this.createElementMenu()

    this.icon = this.mlx.createImage(this, '/assets/iconKNNClassifier.jpg', 1, this.mlx.mlxCaptionHeight + 1, 198, 44)
    this.label = this.mlx.createLabel(this, 'Loading...', 8, this.mlx.mlxCaptionHeight + 48, this.w - 20, 24)

    this.categoryMenu = this.mlx.createMenu(this, 10, this.mlx.mlxCaptionHeight + 44 + 10)
    this.select = this.categoryMenu.addSelectMenu(['A', 'B', 'C', 'D', 'E'], -1, (ui, value) => {
      if (this.inElement && this.inElement.output) {
        if (value >= 0) {
          this.currentClass = this.classNames[value]
        }
        this.select2.setValue(-1)
      }
    })
    this.categoryMenu.w = 85
    this.trainLogX = 105
    this.trainLogY = this.mlx.mlxCaptionHeight + 44 + 10
    this.trainLogW = this.w - this.trainLogX - 1
    this.trainLogH = this.categoryMenu.h
    console.log(this.categoryMenu.h)
    this.categoryMenu2 = this.mlx.createMenu(this, 105, this.mlx.mlxCaptionHeight + 44 + 10)
    this.select2 = this.categoryMenu2.addSelectMenu(['F', 'G', 'H', 'I', 'J'], -1, (ui, value) => {
      if (this.inElement && this.inElement.output) {
        value = parseInt(value)
        if (value >= 0) {
          this.currentClass = this.classNames[value + 5]
        }
        this.select.setValue(-1)
      }
    })
    this.categoryMenu2.w = 85

    this.labelTrain = this.mlx.createLabel(
      this,
      'No data',
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
          console.log('add', this.inElement.output)
          try {
            this.addData(this.inElement.output, this.currentClass)
            this.classifier.addExample(this.inElement.output, this.currentClass)
            this.updateDisplayData()
            this.trained = true
          } catch (e) {
            console.log('ERROR', e)
          }
        }
      },
      14,
      205,
      75,
      24
    )
    this.getButton.border = true
    //this.getButton.hidden = true;

    this.h += 160
    this.label.yy += 160

    this.classifier = ml5.KNNClassifier()
    this.ready = true
  }
  getDataShape(data) {
    let l = []
    let d = data
    while (d.length) {
      l.push(d.length)
      d = d[0]
    }
    return l
  }

  getEuclideanDistance(data) {
    let keys = Object.keys(this.rawData)
    let distances = []
    for (var k in keys) {
      let key = keys[k]
      let rawData = this.rawData[key]
      for (let r in rawData) {
        let rdata = rawData[r]
        //console.log(rdata);
        let dist = this.p5.dist(data[0], data[1], rdata[0], rdata[1])
        let result = { label: key, dist: dist, rdata: [rdata[0], rdata[1]] }
        if (distances.length) {
          let i = 0
          for (i in distances) {
            let d = distances[i]
            if (dist < d.dist) {
              distances.splice(i, 0, result)
              break
            }
          }
          if (i == distances.length && distances.length < 3) {
            distances.push(result)
          }
          if (distances.length > 3) {
            distances.splice(3, distances.length - 3)
          }
        } else {
          distances.push(result)
        }
      }
    }
    //console.log(distances);
    return {
      label: distances[0].label,
      classIndex: k,
      distances: distances,
    }
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addSelectMenu(['Euclidean distance', 'Cosine similarity'], this.method, (ui, value) => {
      console.log('method', value)
      this.method = value
      this.hideMenu()
      if (this.inElement) {
        this.inElement.refresh()
      }
    })
    menu.addSeparator()
    menu.addCommand('Clear Model', (ui) => {
      this.hideMenu()
      this.classNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      this.currentClass = 'A'
      this.trained = false
      this.losses = []
      this.highestLoss = 0
      this.totalCounts = 0
      this.rawData = {}
      this.classCounts = 0
      this.classifier = ml5.KNNClassifier()
      ;['A', 'B', 'C', 'D', 'E'].forEach((v, i) => this.select.setTitle(i, v))
      ;['F', 'G', 'H', 'I', 'J'].forEach((v, i) => this.select2.setTitle(i, v))
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }

  classify(data) {
    return new Promise((resolve, reject) => {
      if (this.method == 0) {
        let results = this.getEuclideanDistance(data)
        resolve({ label: results.label, data: data })
      } else {
        this.classifier.classify(data, (error, results) => {
          if (error) {
            return reject(error)
          }
          resolve({ label: results.label, data: data })
        })
      }
    })
  }

  updateDisplayData() {
    Object.keys(this.rawData).forEach((label, i) => {
      let index = this.classNames.indexOf(label)
      if (index < 0) {
        this.classNames[i] = label
        index = i
      }
      if (index > 4) {
        this.select2.setTitle(index - 5, `${label} (${this.rawData[label].length})`)
      } else {
        this.select.setTitle(index, `${label} (${this.rawData[label].length})`)
      }
    })
  }
  addData(data, label) {
    this.labelTrain.setText(`shp:[${this.getDataShape(data).toString()}]`)
    if (!(label in this.rawData)) {
      //new class
      this.rawData[label] = []
      this.classCounts += 1
      console.log('claseCounts', this.classCounts)
    }
    this.rawData[label].push(data)
  }
  addBatchData(dataArray) {
    dataArray.forEach(({ data, label }) => {
      this.addData(data, label)
    })
  }

  processTrainData(data, isBatch) {
    if (isBatch) {
      //array
      this.addBatchData(data)
      data.forEach(({ data, label }) => {
        this.classifier.addExample(data, label) //add updated data
      })
    } else {
      this.addData(data.data, data.label)
      this.classifier.addExample(data.data, data.label)
    }
    this.updateDisplayData()
  }

  processClassify(data, isBatch) {
    if (!isBatch) {
      data = [data]
    }
    this.label.setText('Processing Input : ' + data.length)
    let resultsPromize = data.map((el) => this.classify(el))
    Promise.all(resultsPromize)
      .then((results) => {
        this.numResults = results.length
        this.output = isBatch ? results : results[0]
        this.busy = false
        this.outputIsReady = true
        this.alreadyRunInLoop = true
        if (this.inElement) {
          this.inElement.outputIsReady = false
          if (this.inElement.needResults && !isBatch) {
            this.inElement.needResults({
              data: results[0].data,
              label: results[0].label,
              classIndex: results[0].classIndex,
            })
          }
        }
        this.label.setText(`${this.numResults} results found`)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  doProcess() {
    if (this.inElement.output) {
      let data = this.inElement.output
      let isBatch = Array.isArray(data) && (data[0].data || Array.isArray(data[0]))
      let isTrain = isBatch ? data[0].label && data[0].data : data.label && data.data
      if (isTrain) {
        this.busy = true
        this.outputIsReady = false
        try {
          this.processTrainData(data, isBatch)
          this.trained = true
        } catch (e) {
          console.log('ERROR', e)
        }
        this.output = data
        this.busy = false
        this.outputIsReady = true
        this.alreadyRunInLoop = true
        if (this.inElement) this.inElement.outputIsReady = false
      } else {
        if (this.trained) {
          if (!this.outElement || !this.outputIsReady) {
            if (this.inElement) {
              this.inElement.outputIsReady = false
            }
            this.busy = true
            this.outputIsReady = false
            this.alreadyRunInLoop = false
            //========= process start here ==========//
            let indata = this.inElement.output
            this.processClassify(indata, isBatch)
            return true
          }
        } else {
          console.log('not trained')
          this.busy = false
          if (this.inElement) this.inElement.outputIsReady = false
          return false
        }
      }
    }
    if (!this.trained) return false
    return true
  }

  update() {
    super.update()
    if (!this.inElement || !this.inElement.outElement) {
      if (this.ready) this.label.setText('Ready (No input)')
    } else {
      if (this.trained) {
        if (!this.numResults) this.label.setText('Ready')
      } else {
        this.label.setText('Ready (No data)')
      }
    }
  }

  draw(p5) {
    super.draw(p5)
    p5.fill(255)
    p5.stroke(0)
  }
}

class mlxConfusionMatrix extends mlxElementOutput {
  constructor(mlx) {
    super(mlx)

    this.category = 'Output'
    this.type = 'ConfusionMatrix'
    this.title = 'Confusion Matrix'

    this.inType = 'results,tensor'
    this.outType = 'results'

    this.createElementMenu()
    this.needMouse = true
    this.resizable = false
    this.w = 200
    this.h = 100
    this.contentX = this.mlx.mlxPadding
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.contentAspectRatio = 1.0
    this.allowExtraInElement = true
    this.targeted = []
    this.predicted = []
    this.cm = null
    this.cellWidth = 30
    this.labelPredict = this.mlx.createLabel(
      this,
      'Predicted : None',
      this.mlx.mlxPadding,
      this.mlx.mlxCaptionHeight + 5,
      this.w - this.mlx.mlxPadding * 2 - 5,
      24
    )
    this.labelActual = this.mlx.createLabel(
      this,
      'Actual : None',
      this.mlx.mlxPadding,
      this.mlx.mlxCaptionHeight + 26,
      this.w - this.mlx.mlxPadding * 2 - 5,
      24
    )
    this.computeBtn = this.mlx.createButton(
      this,
      'Compute',
      () => {
        this.onCompute()
      },
      this.mlx.mlxPadding,
      //this.w - this.mlx.mlxPadding - 100 + 3,
      this.h - 28,
      100,
      24
    )
    this.computeBtn.border = true
    this.outputIsReady = false
    this.ready = true
    this.busy = false
  }
  save() {
    let data = super.save()
    data.baudrateSelector = this.baudrateSelector.getValue()
    return data
  }

  load(data) {
    super.load(data)
    this.baudrateSelector.setValue(data.baudrateSelector)
  }
  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Clear', (ui) => {
      this.hideMenu()
      this.predicted = []
      this.targeted = []
      this.labelPredict.setText(`Predicted : ${this.predicted.length}`)
      this.labelActual.setText(`Actual : ${this.targeted.length}`)
      this.cm = null
      this.w = 200
      this.h = 100
      this.activateUI()
    })
    menu.addSeparator()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.mlx.removeElement(this)
    })
  }
  onCompute() {
    if (this.predicted.length > 0 && this.targeted.length > 0 && this.predicted.length == this.targeted.length) {
      let predictLabels = this.predicted.map((el) => el.label).filter((el) => el != undefined)
      let targetLabels = this.targeted.map((el) => el.label).filter((el) => el != undefined)
      if (predictLabels.length == targetLabels.length && predictLabels.length > 0) {
        let CM2 = ConfusionMatrix.default.fromLabels(targetLabels, predictLabels)
        this.cellWidth = CM2.labels.sort((a, b) => b.length - a.length)[0].length * 6
        this.cm = CM2
      } else {
        console.log('length not match')
      }
    } else {
      console.log('length not match')
    }
  }
  map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  }
  doProcess() {
    this.busy = true
    this.alreadyRunInLoop = false
    if (this.inElement.output) {
      console.log('CONF GOT : ', this.inElement.output)
      if (!this.outElement || !this.outputIsReady) {
        if (Array.isArray(this.inElement.output)) {
          this.predicted = this.predicted.concat(this.inElement.output)
        } else {
          this.predicted.push(this.inElement.output)
        }
        this.labelPredict.setText(`Predicted : ${this.predicted.length}`)
        this.busy = false
        this.inElement.outputIsReady = false
        this.alreadyRunInLoop = true
      }
    }
    if (this.extraInElement.length == 1) {
      let elx = this.extraInElement[0]
      if (elx.output && elx.outputIsReady) {
        if (Array.isArray(this.inElement.output)) {
          this.targeted = this.targeted.concat(this.inElement.output)
        } else {
          this.targeted.push(this.inElement.output)
        }
        this.labelActual.setText(`Actual : ${this.targeted.length}`)
        this.busy = false
        elx.outputIsReady = false
        this.alreadyRunInLoop = true
      }
    }
    return true
  }
  update() {
    super.update()
  }
  drawTextBox(text, x, y, w, h, color, p5) {
    p5.fill(color)
    p5.strokeWeight(1)
    p5.rect(x, y, w, h)
    p5.fill(0)
    p5.strokeWeight(0)
    p5.text(text, x, y, w, h)
  }
  draw(p5) {
    super.draw(p5)
    if (this.cm) {
      let cellWidth = this.cellWidth + 10 //8 = cell padding
      let cellHeight = 30
      let colNum = this.cm.labels.length
      let rowNum = colNum
      let startx = this.x + this.contentX
      let starty = this.y + this.contentY + 80
      let space = 10
      let sumWidth = 50
      let recallWidth = 60
      let newWidth =
        cellHeight + cellWidth * (colNum + 1) + space + sumWidth + recallWidth * 2 + this.mlx.mlxPadding * 2
      this.h = cellHeight * (colNum + 5) + space + this.mlx.mlxPadding + 120 //+end padding for text
      p5.line(this.x, this.y + 100, this.x + this.w, this.y + 105)
      if (newWidth > 200) {
        this.w = newWidth
      }
      p5.push()
      p5.textSize(14)
      p5.textStyle(p5.NORMAL)
      p5.textAlign(p5.CENTER, p5.CENTER)
      this.d
      p5.fill(140)
      p5.rect(startx + cellHeight + cellWidth, starty, cellWidth * colNum, cellHeight) //external rect (predict)
      p5.rect(startx, starty + cellHeight + cellHeight, cellHeight, cellHeight * rowNum) //external rect (actual)
      p5.fill(0)
      p5.strokeWeight(0)
      p5.text('Predicted', startx + cellHeight + cellWidth, starty, cellWidth * colNum, cellHeight)
      p5.text('Actual', startx, starty + cellHeight + cellHeight, cellHeight, cellHeight * rowNum)
      //---- box for label ----//
      p5.push()
      this.cm.labels.forEach((v, i) => {
        this.drawTextBox(
          v,
          startx + cellHeight + cellWidth + cellWidth * i,
          starty + cellHeight,
          cellWidth,
          cellHeight,
          180,
          p5
        )
        this.drawTextBox(
          v,
          startx + cellHeight,
          starty + cellHeight + cellHeight + cellHeight * i,
          cellWidth,
          cellHeight,
          180,
          p5
        )
      })
      p5.pop()
      p5.push()
      //---------- matrix value ----------//
      this.cm.getMatrix().forEach((row, j) => {
        row.forEach((value, i) => {
          let color = 180
          if (i == j) {
            //correction
            let nagativeColor = (value / this.cm.getPositiveCount(this.cm.labels[i])) * 204
            //let blue = this.map(nagativeColor, 0, 1, 40, 200);
            //let red = this.map(nagativeColor, 0, 1, 0, 200);
            color = `rgb(${204 - nagativeColor},${204},${204 - nagativeColor})`
          } else {
            let falsePositive = (value / this.cm.getTotalCount()) * 204
            color = `rgb(${204},${204 - falsePositive},${204 - falsePositive})`
          }
          this.drawTextBox(
            value,
            startx + cellHeight + cellWidth + cellWidth * i,
            starty + cellHeight + cellHeight + cellHeight * j,
            cellWidth,
            cellHeight,
            color,
            p5
          )
        })
      })
      p5.pop()
      //-------- other for class --------//
      let beginX = startx + cellHeight + cellWidth * (colNum + 1) + space
      let beginY = starty + cellHeight * (2 + rowNum) + space
      //draw class sum
      this.drawTextBox('SUM', beginX, starty + cellHeight, sumWidth, cellHeight, 140, p5)
      ;['Recall', 'F1-Score'].forEach((v, i) => {
        this.drawTextBox(v, beginX + sumWidth + i * recallWidth, starty + cellHeight, recallWidth, cellHeight, 140, p5)
      })
      //predicted sum
      this.drawTextBox('SUM', startx + cellHeight, beginY, cellWidth, cellHeight, 140, p5)
      this.drawTextBox('Precision', startx + cellHeight, beginY + cellHeight, cellWidth, cellHeight, 140, p5)
      this.cm.labels.forEach((label, j) => {
        //draw class sum
        let yinx = starty + cellHeight + cellHeight + cellHeight * j
        let xinx = startx + cellHeight + cellWidth + cellWidth * j
        this.drawTextBox(this.cm.getPositiveCount(label), beginX, yinx, sumWidth, cellHeight, 180, p5)
        //draw recall
        this.drawTextBox(this.cm.getTruePositiveRate(label), beginX + sumWidth, yinx, recallWidth, cellHeight, 180, p5)
        //draw f1-score
        this.drawTextBox(
          this.cm.getF1Score(label),
          beginX + sumWidth + recallWidth,
          yinx,
          recallWidth,
          cellHeight,
          180,
          p5
        )
        //draw sum-predicted
        this.drawTextBox(
          this.cm.getTruePositiveCount(label) + this.cm.getFalsePositiveCount(label),
          xinx,
          beginY,
          cellWidth,
          cellHeight,
          180,
          p5
        )
        //draw precision
        this.drawTextBox(
          this.cm.getPositivePredictiveValue(label),
          xinx,
          beginY + cellHeight,
          cellWidth,
          cellHeight,
          180,
          p5
        )
      })

      //draw accuracy
      this.drawTextBox(
        'Accuracy',
        startx + cellHeight,
        beginY + cellHeight + cellHeight,
        cellWidth,
        cellHeight,
        140,
        p5
      )
      this.drawTextBox(
        (this.cm.getAccuracy() * 100).toFixed(3) + ' %',
        startx + cellHeight + cellWidth,
        beginY + cellHeight + cellHeight,
        cellWidth * colNum,
        cellHeight,
        180,
        p5
      )
      //---------------------------------//
      p5.pop()
    }
  }
}

module.exports = {
  mlxKNNClassifier,
  mlxConfusionMatrix,
}
