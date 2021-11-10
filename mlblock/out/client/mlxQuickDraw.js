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

var mlxQuickDrawEndSpeak = true

class mlxQuickDraw extends mlxElementOutput {
  constructor(mlx) {
    //Game Value
    super(mlx)
    this.title = 'Doodle QuickDraw'
    this.category = 'Output'
    this.type = 'DoodleQuickDraw'
    this.inType = 'results'
    this.outType = 'results'
    this.needMouse = true
    this.lastSpeakeWord

    this.gameMode = 'INTRO' //'INTRO','FINDING','FOUND','OVER'
    this.timeShowFound = 4000
    this.welcomeSound = false
    this.canvas
    this.drawCanvas
    this.imageFromDrawCanvas
    this.currentWord
    this.currentGuess
    this.currentIndex = 0
    this.isPlaying = false
    //this.words = ['shoe', 'book', 'keyboard', 'shirt', 'pants', 'cup' , 'clock'];
    this.words = ['shoe', 'book', 'keyboard', 'pants', 'cup']
    this.myVoice = new p5.Speech()
    this.isModelReady = false
    this.previousResultWord = null
    this.timeLeft = 60000
    this.sound_blip
    this.font
    this.canvas_w = 407 //internal usage
    this.canvas_h = 151 //internal usage
    this.precanvas = this.p5.createGraphics(this.canvas_w, this.canvas_h)
    this.w = this.canvas_w + this.mlx.mlxPadding * 2 //size including frame
    this.h = this.canvas_h + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2 //size including frame
    this.fps = 10
    this.offScreenX = this.mlx.mlxPadding
    this.offScreenY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding
    this.offScreen = this.mlx.createCanvas(this, this.offScreenX, this.offScreenY, this.canvas_w, this.canvas_h)
    this.canvas = this.offScreen.offScreen

    //internal setup
    this.preload()
    this.setup()

    this.createElementMenu()

    //Output(required)
    this.output = this.canvas
    this.ready = true
  }

  createElementMenu() {
    let menu = this._createMenu()
    menu.addCommand('Delete', (ui) => {
      this.hideMenu()
      this.myVoice.cancel()
      this.mlx.removeElement(this)
    })
  }

  preload() {
    this.img_1 = this.p5.loadImage('assets_game/mlxQuickDraw/img1.png')
    this.img_2 = this.p5.loadImage('assets_game/mlxQuickDraw/img2.png')
    this.img_3 = this.p5.loadImage('assets_game/mlxQuickDraw/img3.png')
    this.img_4 = this.p5.loadImage('assets_game/mlxQuickDraw/img4.png')
    this.img_5 = this.p5.loadImage('assets_game/mlxQuickDraw/img5.png')
    this.sound_blip = this.p5.loadSound('assets_game/mlxQuickDraw/Blip.mp3')
    this.sound_start = this.p5.loadSound('assets_game/mlxQuickDraw/start.mp3')
    this.font = this.p5.loadFont('assets_game/mlxQuickDraw/JSJindara-Bold.otf')
  }

  setup() {
    this.precanvas.textFont(this.font)
    this.myVoice.onEnd = this.speechEnded
  }

  resetGame() {
    //start over
    this.clearCanvas()
    this.currentIndex = 0
    this.gameMode = 'INTRO'
    this.timeShowFound = 4000
    this.timeLeft = 60000
  }

  draw(p5) {
    super.draw(p5)
    //background(255);
    if (this.gameMode == 'INTRO') {
      this.precanvas.image(this.img_1, 0, 0, this.canvas_w, this.canvas_h)
      if (!this.welcomeSound) {
        this.welcomeSound = true
        this.myVoice.speak('Welcome, Press Start to begin!! ')
      }
    } else if (this.gameMode == 'FINDING') {
      this.precanvas.push()
      this.precanvas.image(this.img_2, 0, 0, this.canvas_w, this.canvas_h)
      //text
      this.setTextSizeStrokeWeight(30, 0, 2)
      this.precanvas.fill(255)
      this.precanvas.textAlign(this.p5.LEFT, this.p5.CENTER)
      this.precanvas.text(this.currentWord, 231, 8, 173, 33)
      this.setTextSizeStrokeWeight(45, 0, 2)
      this.precanvas.textAlign(this.p5.CENTER, this.p5.CENTER)
      this.precanvas.text(this.p5.floor(this.timeLeft / 1000), 18, 70, 70, 63)
      this.precanvas.fill(255, 234, 0)
      this.setTextSizeStrokeWeight(26, 0, 2)
      this.precanvas.text(this.currentGuess, 113, 98, 205, 46)
      this.precanvas.pop()
      //timelimit
      this.timeLeft -= this.p5.deltaTime
      if (this.timeLeft <= 0) {
        this.gameMode = 'OVER'
        this.myVoice.cancel()
        this.myVoice.speak('Sorry , I do not know what you are drawing')
        this.timeShowFound = 6000
      }
    } else if (this.gameMode == 'FOUND') {
      //FOund
      this.precanvas.push()
      var cimage = this.img_3
      if (this.currentIndex == this.words.length) cimage = this.img_5
      this.precanvas.image(cimage, 0, 0, this.canvas_w, this.canvas_h)
      //check time
      this.timeShowFound -= this.p5.deltaTime
      if (this.timeShowFound <= 0) {
        if (this.currentIndex != this.words.length) {
          //next word
          this.gameMode = 'FINDING'
          this.timeShowFound = 4000
          this.playNextWord()
          this.currentIndex++
          this.timeLeft = 60000
          this.clearCanvas()
        } else {
          //start over
          this.resetGame()
        }
      }
    } else if (this.gameMode == 'OVER') {
      //OVER
      this.precanvas.push()
      this.precanvas.image(this.img_4, 0, 0, this.canvas_w, this.canvas_h)
      //check time
      this.timeShowFound -= this.p5.deltaTime
      if (this.timeShowFound <= 0) {
        //reset
        this.resetGame()
      }
    }

    //draw on canvas
    this.canvas.push()
    this.canvas.image(this.precanvas, 0, 0)
    this.canvas.pop()

    //check for changing
    if (this.inElement == null || this.inElement.inElement == null) {
      this.myVoice.stop()
    }
  }

  mousePressed() {
    if (this.gameMode == 'INTRO') {
      this.sound_blip.play()
      this.gameMode = 'FINDING'
      this.playNextWord()
      this.currentIndex++
    }
  }

  clearCanvas() {
    //clear drawing canvas
    if (this.inElement != null && this.inElement.inElement != null && this.inElement.inElement.type == 'DrawCanvas') {
      this.inElement.inElement.canvas.background(255)
    }
  }

  setTextSizeStrokeWeight(_size, _stroke, _weight) {
    this.precanvas.textSize(_size)
    this.precanvas.stroke(_stroke)
    //this.precanvas.strokeWeight(_weight);
  }

  playNextWord() {
    this.isPlaying = true
    this.currentWord = this.words[this.currentIndex]
  }

  doProcess() {
    this.results = this.inElement.output
    //console.log(this.results);
    if (this.results == undefined) return
    this.result = this.results[0].label
    // Split the first result string by coma and get the first word
    var oneWordRes = this.result.split(',')[0]
    //console.log("oneWordRes||"+oneWordRes);
    // Get the top 3 results as strings in an array
    // Read more about map function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    var top3Res = this.results.map((r) => r.label)
    // Find if any of the top 3 result strings includes the current word
    // Read more about find function here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    var ifFound = false
    for (var i = 0; i < top3Res.length; i++) {
      if (top3Res[i] == this.currentWord) {
        ifFound = true
        break
      }
    }
    if (ifFound && this.gameMode == 'FINDING') {
      // If top 3 results includes the current word
      this.isPlaying = false
      if (this.currentIndex == this.words.length) {
        this.currentGuess = 'Congratulations. You won.'
        this.sound_start.play()
        this.myVoice.cancel()
        this.myVoice.speak(`Congratulations. You won.`)
      } else {
        this.currentGuess = "Oh I know. it's " + this.currentWord
        this.myVoice.cancel()
        this.myVoice.speak(`Oh I know. it\'s ${this.currentWord}!`)
      }
      this.gameMode = 'FOUND'
    } else if (this.gameMode == 'FINDING') {
      if (this.previousResultWord == null || this.previousResultWord != oneWordRes) {
        if (oneWordRes == 'line') {
          this.currentGuess = 'Please  draw ' + this.currentWord
          if (mlxQuickDrawEndSpeak && this.lastSpeakeWord != this.currentGuess) {
            mlxQuickDrawEndSpeak = false
            this.myVoice.cancel()
            this.myVoice.speak(`Please  draw ${this.currentWord}`)
            this.lastSpeakeWord = this.currentGuess
          }
        } else {
          //oneWordRes = oneWordRes.replace('_',' ');
          if (oneWordRes == null) return
          this.currentGuess = 'I see ' + oneWordRes
          if (mlxQuickDrawEndSpeak && this.lastSpeakeWord != this.currentGuess) {
            mlxQuickDrawEndSpeak = false
            this.myVoice.cancel()
            this.myVoice.speak(`I see ${oneWordRes}`)
            this.lastSpeakeWord = this.currentGuess
          }
          //console.log(oneWordRes);
        }
      }
    }

    this.busy = false
    this.outputIsReady = true
    this.output = this.inElement.output
    this.inElement.outputIsReady = false
    this.alreadyRunInLoop = true
    return true
  }

  speechEnded() {
    mlxQuickDrawEndSpeak = true
    //this.myVoice.cancel();
    //if (isPlaying) classifyVideo();
  }
}

module.exports = {
  mlxQuickDraw,
}
