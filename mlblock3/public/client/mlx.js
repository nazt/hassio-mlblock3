let uuid = ''
const {
  mlxVideoCapture,
  mlxDrawCanvas,
  mlxMouseInput,
  mlxImage,
  mlxVideoPixels,
  mlxCSVFileInput,
} = require('./mlxVideoCanvasInput')

const { mlxRTCVideo } = require('./mlxRTCVideo')

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
  mlxSoundAmplitude,
  mlxFFTSpectrum,
  mlxSpectrogram,
  mlxNatsSoundTensor,
  mlxTextInput,
} = require('./mlxElement')

const { mlxElementSoundViz } = require('./mlxSoundViz')

const {
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
} = require('./mlxClassifier')

const { mlxCorgiDudeAudio } = require('./mlxCorgiDudeAudio')
const {
  mlxFeatureExtractor,
  mlxMobileNetFeatureExtractor,
  mlxMobileNetClassifier,
  mlxMobileNetRegressor,
} = require('./mlxFeatureExtractor')

const { mlxKNNClassifier, mlxConfusionMatrix } = require('./mlxMachineLearning')

const {
  mlxLicensePlateDetector,
  mlxFaceMaskDetector,
  mlxCorgiDudeCamera2,
  mlxCorgiDudeMobileNetClassifier,
  mlxCorgiDudeMobileNetRegressor,
  mlxCorgiDudeIDE,
  mlxCorgiDudeMobileNet,
} = require('./mlxCorgiDude')

const { mlxMQTT, mlxNETPIE2020, mlxBlynk, mlxSerialPort } = require('./mlxExtension')

const { mlxFlowFilter, mlxFlowMerge, mlxJSEditor } = require('./mlxFlowControl')

const { mlxNeuralNetwork, mlxNeuralNetworkClassifier, mlxNeuralNetworkRegressor } = require('./mlxNeuralNetwork')

const { mlxQuickDraw } = require('./mlxQuickDraw')

const { mlxGamePad, mlxSnakeGame, mlxPongGame, mlxBreakoutGame } = require('./mlxGames')

const { mlxScaventureHunt } = require('./mlxScaventureHunt')

const { mlxJungleJumper } = require('./mlxJungleJumper')

const { mlxSortingFactory } = require('./mlxSortingFactory')

const { mlxNoseArtist } = require('./mlxNoseArtist')

const { mlxNoseArtistMobile } = require('./mlxNoseArtistMobile')

const { mlxMaskGame } = require('./mlxMaskGame')

const { mlxBubbleTeaGame } = require('./mlxBubbleTea')

const { mlxBoatParking } = require('./mlxBoatParking')

const { mlxCleanOceanGame } = require('./mlxCleanOcean')

/*
const {
  mlxCovid
} = require( './mlxCovid' );
*/
const {
  mlxUI_Init,
  mlxUI,
  uiFrame,
  uiHorizontalSlider,
  uiVerticalSlider,
  uiTextInput,
  uiRadioBox,
  uiSelect,
  uiCommand,
  uiDropdown,
  uiSubMenu,
  uiCheckedMenu,
  uiSelectMenu,
  uiSeparator,
  uiGapSeparator,
  uiMenu,
  uiLabel,
  uiImage,
  uiCanvas,
  uiGraph,
} = require('./mlxUI')

class MLX {
  constructor(p5) {
    this.p5 = p5
    // this._p5 = p5
    this.myFont = null
    mlxUI_Init(this, p5)

    this.mlxCaptionHeight = 24
    this.mlxCornerSize = 8
    this.mlxPadding = 10
    this.mlxLinkSize = 10
    this.mlxNavBarHeight = p5.select('#p5-content').elt.offsetTop

    this.mlxElements = []
    this.elMoving = null
    this.elSizing = null
    this.elDragging = null
    this.elLinkMoving = null
    this.elLinkTarget = null

    this.popup = []
    this.mainCanvas = null

    this.currentProcess = null
    this.startProcessIndex = 0

    this.fullScreenElement = null
    this.maximizedElement = null
    this.labelElement = null
    this.focusedElement = null //Art - alternative to fullscreen

    this.userTranslateX = 0
    this.userTranslateY = 0
    this.userScaleX = 0
    this.userScaleY = 0
    this.userScale = 1.0

    this.panning = false
    this.pos = 0

    this.mouseX = 0
    this.mouseY = 0

    this.isMaximize = false
    this.registeredMlxElement = [
      { cmd: 'Video Capture', className: mlxVideoCapture, type: 'VideoCapture' },
      { cmd: 'RTC Video Capture', className: mlxRTCVideo, type: 'RTCVideo' },
      { cmd: 'Image Segmentation (UNET)', className: mlxUNET, type: 'UNET' },
      { cmd: 'Video Pixels', className: mlxVideoPixels, type: 'VideoPixels' },
      { cmd: 'Image', className: mlxImage, type: 'Image' },
      { cmd: 'Canvas', className: mlxDrawCanvas, type: 'DrawCanvas' },
      { cmd: '2D Coordinate', className: mlxMouseInput, type: '2DCoord' },
      { cmd: 'CSV File', className: mlxCSVFileInput, type: 'CSVFile' },
      { cmd: 'Text Input', className: mlxTextInput, type: 'TextInput' },
      { cmd: 'MobileNet', className: mlxMobileNet, type: 'MobileNet' },
      { cmd: 'DoodleNet', className: mlxDoodleNet, type: 'DoodleNet' },
      { cmd: 'PoseNet', className: mlxPoseNet, type: 'PoseNet' },
      { cmd: 'Speech Command', className: mlxSoundCommand18w, type: 'SpeechCommand' },
      { cmd: 'FaceAPI', className: mlxFaceAPI, type: 'FaceAPI' },
      { cmd: 'HandPose', className: mlxHandPose, type: 'HandPose' },
      { cmd: 'YOLO', className: mlxYolo, type: 'YoLo' },
      { cmd: 'Particle Generator', className: mlxParticle, type: 'Particle' },
      {
        cmd: 'MobileNet Feature Extractor',
        className: mlxMobileNetFeatureExtractor,
        type: 'MobileNetFeatureExtractor',
      },
      {
        cmd: 'MobileNet Classifier',
        className: mlxMobileNetClassifier,
        type: 'MobileNetClassifier',
      },
      {
        cmd: 'MobileNet Regressor',
        className: mlxMobileNetRegressor,
        type: 'MobileNetRegressor',
      },
      //================= MACHINE LEARNING =================//
      { cmd: 'KNN Classifier', className: mlxKNNClassifier, type: 'KNNClassifier' },
      { cmd: 'Confusion Matrix', className: mlxConfusionMatrix, type: 'ConfusionMatrix' },
      //====================================================//
      {
        cmd: 'Neural Network (Classifier)',
        className: mlxNeuralNetworkClassifier,
        type: 'NeuralNetworkClassifier',
      },
      {
        cmd: 'Neural Network (Regressor)',
        className: mlxNeuralNetworkRegressor,
        type: 'NeuralNetworkRegressor',
      },
      //{ cmd: "Covid-19", className: mlxCovid, type: "Covid19" },
      { cmd: 'Label', className: mlxLabel, type: 'Label' },
      { cmd: 'Speech', className: mlxSpeech, type: 'Speech' },
      { cmd: 'Oscillator', className: mlxOscillator, type: 'Oscillator' },
      { cmd: 'Snake Game', className: mlxSnakeGame, type: 'SnakeGame' },
      { cmd: 'Doodle QuickDraw', className: mlxQuickDraw, type: 'DoodleQuickDraw' },
      { cmd: 'Scaventure Hunt', className: mlxScaventureHunt, type: 'ScaventureHunt' },
      { cmd: 'Nose Artist', className: mlxNoseArtist, type: 'NoseArtistGame' },
      {
        cmd: 'Nose Artist(Mobile)',
        className: mlxNoseArtistMobile,
        type: 'NoseArtistMobileGame',
      },
      { cmd: 'Mask(Mobile)', className: mlxMaskGame, type: 'MaskGame' },
      { cmd: 'Jungle Jumper', className: mlxJungleJumper, type: 'JungleJumperGame' },
      { cmd: 'Sorting Factory', className: mlxSortingFactory, type: 'SortingFactoryGame' },
      { cmd: 'Game Pad', className: mlxGamePad, type: 'GamePad' },
      { cmd: 'Console Log', className: mlxConsoleLog, type: 'ConsoleLog' },
      { cmd: 'Sound Amplitude', className: mlxSoundAmplitude, type: 'SoundAmplitude' },
      { cmd: 'FFT Spectrum', className: mlxFFTSpectrum, type: 'FFT' },
      { cmd: 'Sound Viz', className: mlxElementSoundViz, type: 'FFT' },
      { cmd: 'Spectrogram', className: mlxSpectrogram, type: 'Spectrogram' },
      { cmd: "Nat's Sound Tensor", className: mlxNatsSoundTensor, type: 'NatsSoundTensor' },
      { cmd: 'Audio Input', className: mlxAudioInput, type: 'Audio' },
      { cmd: 'Pong Game', className: mlxPongGame, type: 'PongGame' },
      { cmd: 'Breakout Game', className: mlxBreakoutGame, type: 'BreakoutGame' },
      { cmd: 'We Love BubbleTea', className: mlxBubbleTeaGame, type: 'BubbleTeaGame' },
      { cmd: 'Boat Parking', className: mlxBoatParking, type: 'BoatParkingGame' },
      { cmd: 'Clean the Ocean', className: mlxCleanOceanGame, type: 'CleanTheOceanGame' },
      //=========== corgidude compat model (tt) ============//
      { cmd: 'Face Mask Detection', className: mlxFaceMaskDetector, type: 'FaceMask' },
      { cmd: 'LicensePlate', className: mlxLicensePlateDetector, type: 'LicensePlate' },
      {
        cmd: 'CorgiDude Video Capture',
        className: mlxCorgiDudeCamera2,
        type: 'CorgiDudeCamera',
      },
      {
        cmd: 'CorgiDude Audio Input',
        className: mlxCorgiDudeAudio,
        type: 'CorgiDudeAudio',
      },
      {
        cmd: 'CorgiDude MobileNet',
        className: mlxCorgiDudeMobileNet,
        type: 'CorgiDudeMobileNet',
      },

      {
        cmd: 'CorgiDude MobileNet Classifier',
        className: mlxCorgiDudeMobileNetClassifier,
        type: 'CorgiDudeMobileNetClassifier',
      },
      {
        cmd: 'CorgiDude MobileNet Regressor',
        className: mlxCorgiDudeMobileNetRegressor,
        type: 'CorgiDudeMobileNetRegressor',
      },
      {
        cmd: 'CorgiDude Micropython IDE',
        className: mlxCorgiDudeIDE,
        type: 'CorgiDudeIDE',
      },
      //=========== Extension ==================//
      { cmd: 'MQTT', className: mlxMQTT, type: 'MQTT' },
      { cmd: 'NETPIE 2020', className: mlxNETPIE2020, type: 'NETPIE2020' },
      { cmd: 'Blynk', className: mlxBlynk, type: 'Blynk' },
      { cmd: 'Flow Editor', className: mlxJSEditor, type: 'JSEditor' },
      { cmd: 'Serial Port', className: mlxSerialPort, type: 'SerialPort' },
      //=========== Flow Control ==================//
      { cmd: 'Filter', className: mlxFlowFilter, type: 'FLowFilter' },
      { cmd: 'Merge', className: mlxFlowMerge, type: 'FlowMerge' },
      //=========== END corgidude compat model (tt) ============//
    ]
    //console.log(ml5);
  }

  setup() {
    console.log('mlx.setup()')

    if (uuid) {
      this.removeAllElements()
      this.loadFileByUUID(uuid, (data) => {
        console.log(data)
        let loadedData = JSON.parse(data.data)
        console.log('Open', loadedData)
        this.doLoadWorkspace(loadedData)
      })
    } else {
      this.createMainMenu()

      /*
      this.onScreenLabel = this.p5.createDiv("Copyright © 2020 Art & Technology Co.,Ltd.");

      this.onScreenLabel.size(this.p5.windowWidth, 44);
      this.onScreenLabel.position(0, window.innerHeight - 44);
      this.onScreenLabel.style("font-size", "x-small");
      this.onScreenLabel.style("background-color", "#404040");
      this.onScreenLabel.style("color", "#FFF");
      this.onScreenLabel.style("padding", "10px 10px 6px 10px");
      */

      this.normalizeWindow()
    }
  }

  hideNavBar() {
    //$("#ck5-navbar").hide();
    //$("#ck5-main").css("padding-top", "0px");
    //if (this.onScreenLabel) this.onScreenLabel.hide();
  }

  showNavBar() {
    //$("#ck5-navbar").show();
    //$("#ck5-main").css("padding-top", "3.4rem");
    //if (this.onScreenLabel) this.onScreenLabel.show();
  }

  maximizeWindow() {
    this.isMaximize = true
    this.hideNavBar()
    window.dispatchEvent(new Event('resize'))
  }

  normalizeWindow() {
    this.isMaximize = false
    this.showNavBar()
    //window.dispatchEvent(new Event("resize"));
  }

  getLinkColor(linkType) {
    if (linkType == 'image') {
      return this.p5.color(255, 192, 192)
    } else if (linkType == 'tensor') {
      return this.p5.color(128, 255, 255)
    } else if (linkType == 'flatarray') {
      return this.p5.color(128, 255, 128)
    } else if (linkType == 'audio') {
      return this.p5.color(255, 255, 128)
    } else if (linkType == 'results') {
      return this.p5.color(192, 192, 255)
    } else {
      return this.p5.color(255)
    }
  }

  fullscreen(el) {
    let fs = this.p5.fullscreen()
    fs = !fs
    this.p5.fullscreen(fs)

    if (fs) this.fullScreenElement = el
    else this.fullScreenElement = null
    return fs
  }

  windowResized() {
    let fs = this.p5.fullscreen()
    if (!fs) {
      if (this.fullScreenElement) {
        this.fullScreenElement.endFullScreen()
        this.fullScreenElement = null
      }
    }
    if (this.maximizedElement) {
      this.maximizedElement.scaleContentToFillSize(false)
      //this.maximizedElement = null;
    }
    if (this.onScreenLabel) {
      this.onScreenLabel.size(this.p5.windowWidth, 44)
      this.onScreenLabel.position(0, window.innerHeight - 44)
    }
  }

  removeElement(el) {
    el.clearLinkTo()
    if (el.inElement) {
      el.inElement.clearLinkTo()
    }
    let i = this.mlxElements.indexOf(el)
    el.remove()
    this.mlxElements.splice(i, 1)
  }

  addElement(modelRefClass, x, y) {
    // check class is instance of mlxElementModel only
    console.log('modelRefClass', modelRefClass)
    if (!(modelRefClass.prototype instanceof mlxElement)) {
      console.log('NOT member of mlxElement', mlxElement)
      return false
    }
    console.log('Create', modelRefClass)
    let instance = new modelRefClass(this)
    instance.x = x - instance.w / 2
    instance.y = y - this.mlxCaptionHeight / 2
    this.mlxElements.push(instance)
    return instance
  }

  createLabel(parent, text, x, y, w, h) {
    let ui = new uiLabel(parent, text, x, y, w, h)
    return ui
  }

  createTextInput(parent, text, type, cb, x, y, w, h) {
    let ui = new uiTextInput(parent, text, type, cb, x, y, w, h)
    return ui
  }

  createRadioOption(parent, options, cb, x, y, w, h) {
    let radio = new uiRadioBox(parent, options, cb, x, y, w, h)
    return radio
  }

  createSelectOption(parent, options, cb, x, y, w, h) {
    return new uiSelect(parent, options, cb, x, y, w, h)
  }

  createSeperator(parent, x, y, w, h) {
    let sep = new uiSeparator(parent, x, y, w, h)
    return sep
  }

  createButton(parent, text, cb, x, y, w, h) {
    let cmd = new uiCommand(parent, text, cb, x, y, w, h)
    return cmd
  }

  createCheckBox(parent, text, cb, value, x, y, w, h) {
    let cmd = new uiCheckedMenu(parent, text, cb, value, x, y, w, h)
    return cmd
  }

  createDropdownButton(parent, text, list, cb, x, y, w, h) {
    let cmd = new uiDropdown(parent, text, list, cb, x, y, w, h)
    return cmd
  }

  createVerticalSlider(parent, cb, value, min, max, x, y, w, h) {
    let cmd = new uiVerticalSlider(parent, cb, value, min, max, x, y, w, h)
    return cmd
  }

  createHorizontalSlider(parent, cb, value, min, max, x, y, w, h) {
    let cmd = new uiHorizontalSlider(parent, cb, value, min, max, x, y, w, h)
    return cmd
  }

  createImage(parent, url, x, y, w, h) {
    let ui = new uiImage(parent, url, x, y, w, h)
    return ui
  }

  createCanvas(parent, x, y, w, h) {
    let ui = new uiCanvas(parent, x, y, w, h)
    return ui
  }

  createGraph(parent, x, y, w, h) {
    let ui = new uiGraph(parent, x, y, w, h)
    return ui
  }

  createFrame(parent, x, y, w, h) {
    let ui = new uiFrame(parent, x, y, w, h)
    return ui
  }

  createMenu(parent, x, y) {
    let ui = new uiMenu(parent, x, y)
    ui._adjustChildrenWidth()
    return ui
  }

  hidePopup() {
    for (var i = this.popup.length - 1; i >= 0; i--) {
      let pop = this.popup[i]
      pop.hidden = true
      this.popup.splice(i, 1)
    }
  }

  process() {
    if (!this.currentProcess) {
      if (this.startProcessIndex >= this.mlxElements.length) {
        this.startProcessIndex = 0
        for (i in this.mlxElements) {
          this.mlxElements[i].alreadyRunInLoop = false
        }
      }
      for (var i = this.startProcessIndex; i < this.mlxElements.length; i++) {
        if (this.mlxElements[i].category == 'Input') {
          this.currentProcess = this.mlxElements[i]
          this.startProcessIndex = i + 1
          break
        }
      }
      if (!this.currentProcess) {
        this.startProcessIndex = 0
        for (i in this.mlxElements) {
          this.mlxElements[i].alreadyRunInLoop = false
        }
      }
      //this.startProcessIndex = 0;
    }
    if (this.currentProcess) {
      let ret = this.currentProcess.process()
      if (!ret) {
        this.currentProcess = null
        return
      } else {
        if (this.currentProcess.outElement) {
          if (this.currentProcess.outElement.inElement == this.currentProcess) {
            this.currentProcess = this.currentProcess.outElement
          } else {
            this.currentProcess = null
          }
        } else {
          for (i in this.mlxElements) {
            this.mlxElements[i].alreadyRunInLoop = false
          }
          this.currentProcess = null
          if (this.startProcessIndex >= this.mlxElements.length) {
            this.startProcessIndex = 0
          }
        }
      }
    } else {
      if (this.startProcessIndex >= this.mlxElements.length) {
        this.startProcessIndex = 0
      }
    }
  }

  update() {
    for (var i in this.mlxElements) {
      this.mlxElements[i].update(this.p5)
      this.mlxElements[i].updateUI(this.p5)
    }
    if (this.mainMenu) {
      this.mainMenu._update()
    }

    if (this.labelElement && this.onScreenLabel) {
      this.onScreenLabel.html(this.labelElement.text)
    }
  }

  statusOut(text) {
    if (this.onScreenLabel) {
      this.onScreenLabel.html(text)
    }
  }

  addMlxElementCmd(cmd) {
    this.calculateMousePos()
    this.hidePopup()
    console.log('==== got command=====', cmd)
    let elementInfo = this.registeredMlxElement.find((el) => el.cmd == cmd.text)
    if (elementInfo) {
      this.addElement(elementInfo.className, this.mouseX, this.mouseY)
    }
  }

  getElementIndex(el_) {
    for (let i in this.mlxElements) {
      let el = this.mlxElements[i]
      if (el == el_) {
        return parseInt(i)
      }
    }
    return -1
  }

  saveWorkspace(isShared) {
    this.hidePopup()
    console.log('Save workspace')
    let data = []
    for (let i in this.mlxElements) {
      let el = this.mlxElements[i]
      let elData = el.save()
      data.push(elData)
    }
    console.log(data)
    showSaveDialog('workspace', 'data', data, isShared, () => {
      console.log('Saved')
    })
  }

  removeAllElements() {
    for (let i = this.mlxElements.length - 1; i >= 0; i--) {
      let el = this.mlxElements[i]
      this.removeElement(el)
    }
  }

  doLoadWorkspace(loadedData) {
    this.removeAllElements()
    for (let i in loadedData) {
      let elData = loadedData[i]
      console.log('elData', elData)
      let targetClass = this.registeredMlxElement.find((member) => member.type == elData.type)
      console.log('targetClass', targetClass)
      if (targetClass) {
        let el = this.addElement(targetClass.className, elData.x, elData.y)
        el.load(elData)
      }
    }
    for (let i in loadedData) {
      let elData = loadedData[i]
      if (elData.outElementIndex != -1) {
        this.mlxElements[i].linkTo(this.mlxElements[elData.outElementIndex])
      }
      if (elData.outExtraElementIndex != -1) {
        this.mlxElements[i].linkToExtra(this.mlxElements[elData.outExtraElementIndex])
      }
    }
  }

  loadWorkspace() {
    this.hidePopup()
    console.log('Load workspace')
    showOpenDialog('workspace', 'data', (data) => {
      //console.log("Open", data);
      if (data && data.data) {
        let loadedData = JSON.parse(data.data)
        console.log('Open', loadedData)
        this.doLoadWorkspace(loadedData)
      }
    })
  }

  loadExamples(cmd) {
    this.hidePopup()
    this.removeAllElements()
    this.loadFile('example', 'data', cmd.text, (data) => {
      console.log(data)
      let loadedData = JSON.parse(data.data)
      console.log('Open', loadedData)
      this.doLoadWorkspace(loadedData)
    })
  }

  loadFile(type, dataType, filename, cb) {
    let that = this
    $.ajax('/files/load', {
      method: 'POST',
      data: {
        type: type,
        dataType: dataType,
        filename: filename,
      },
      success: function (data, textStatus, XMLHttpRequest) {
        console.log('data: ' + data.data)
        cb(data.data)
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('error')
        console.log(xhr.status)
        console.log(xhr.statusText)
        console.log(xhr)

        //alert(xhr.responseJSON.message);
      },
      complete: function () {
        //console.log('complete');
      },
    })
  }

  loadFileByUUID(uuid, cb) {
    $.ajax('/files/loaduuid', {
      method: 'POST',
      data: {
        uuid: uuid,
      },
      success: function (data, textStatus, XMLHttpRequest) {
        console.log('data: ' + data.data)
        cb(data.data)
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('error')
        console.log(xhr.status)
        console.log(xhr.statusText)
        console.log(xhr)

        //alert(xhr.responseJSON.message);
      },
      complete: function () {
        //console.log('complete');
      },
    })
  }

  createMainMenu() {
    if (!this.mainMenu) {
      this.mainMenu = this.createMenu(null, 0, 0)
      this.mainMenu.hidden = true
      /*
            let exampleCmd = this.mainMenu.addSubmenu('Examples');
            exampleCmd.subMenu.addCommand('Covid-19', cmd => this.loadExamples(cmd));
            exampleCmd.subMenu.addSeparator();
            exampleCmd.subMenu.addCommand('PoseNet, FaceAPI, YoLo', cmd => this.loadExamples(cmd));
            exampleCmd.subMenu.addCommand('UNET, Particle', cmd => this.loadExamples(cmd));
            exampleCmd.subMenu.addSeparator();
            exampleCmd.subMenu.addCommand('Perceptron', cmd => this.loadExamples(cmd));
            exampleCmd.subMenu.addCommand('Multi-Perceptron (XOR)', cmd => this.loadExamples(cmd));
            exampleCmd.subMenu.addCommand('Multi-layer Neural Network', cmd =>
                this.loadExamples(cmd)
            );
            this.mainMenu.addGapSeparator();
            */

      let workspaceCmd = this.mainMenu.addSubmenu('Workspace')
      workspaceCmd.subMenu.addCommand('New', (cmd) => {
        this.hidePopup()
        this.removeAllElements()
      })
      workspaceCmd.subMenu.addSeparator()
      workspaceCmd.subMenu.addCommand('Load Workspace', (cmd) => this.loadWorkspace(cmd))
      workspaceCmd.subMenu.addCommand('Save Workspace', (cmd) => this.saveWorkspace(false))
      workspaceCmd.subMenu.addSeparator()
      workspaceCmd.subMenu.addCommand('Share Workspace', (cmd) => this.saveWorkspace(true))
      workspaceCmd.subMenu.addSeparator()
      workspaceCmd.subMenu.addCheckedMenu('Maximize', 0, (ui, value) => {
        this.hidePopup()
        if (value) {
          this.maximizeWindow()
        } else {
          this.normalizeWindow()
        }
      })
      this.mainMenu.addGapSeparator()
      let inputCmd = this.mainMenu.addSubmenu('Input')
      inputCmd.subMenu.addCommand('Video Capture', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('RTC Video Capture', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('Image', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('Canvas', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('CSV File', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addSeparator()
      inputCmd.subMenu.addCommand('Audio Input', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('Speech Command', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addSeparator()
      inputCmd.subMenu.addCommand('Video Pixels', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('2D Coordinate', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addSeparator()
      inputCmd.subMenu.addCommand('Text Input', (cmd) => this.addMlxElementCmd(cmd))
      inputCmd.subMenu.addCommand('Game Pad', (cmd) => this.addMlxElementCmd(cmd))
      /*
            inputCmd.subMenu.addSeparator();
            inputCmd.subMenu.addCommand("Internet (URL)", (cmd) => this.addMlxElementCmd(cmd));
            inputCmd.subMenu.addCommand("CSV File", (cmd) => this.addMlxElementCmd(cmd));
            */
      /*
            this.mainMenu.addSeparator();
            let dataCmd = this.mainMenu.addSubmenu('Datasets');
            dataCmd.subMenu.addCommand('Covid-19', cmd => this.addMlxElementCmd(cmd));
            */

      this.mainMenu.addSeparator()
      let modelCmd = this.mainMenu.addSubmenu('Pre-trained Model')
      modelCmd.subMenu.addCommand('MobileNet', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addCommand('DoodleNet', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addCommand('PoseNet', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addCommand('HandPose', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addCommand('FaceAPI', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addCommand('YOLO', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addSeparator()
      modelCmd.subMenu.addCommand('Image Segmentation (UNET)', (cmd) => this.addMlxElementCmd(cmd))
      modelCmd.subMenu.addSeparator()
      modelCmd.subMenu.addCommand('Face Mask Detection', (cmd) => this.addMlxElementCmd(cmd))
      /*
            modelCmd.subMenu.addSeparator();
            modelCmd.subMenu.addCommand("Teachable Machine", cmd => this.addMlxElementCmd(cmd));
            */
      this.mainMenu.addSeparator()
      let filterCmd = this.mainMenu.addSubmenu('Filters/Converters')
      filterCmd.subMenu.addCommand('Particle Generator', (cmd) => this.addMlxElementCmd(cmd))

      this.mainMenu.addSeparator()
      let flowCtrl = this.mainMenu.addSubmenu('Flow Control')
      flowCtrl.subMenu.addCommand('Merge', (cmd) => this.addMlxElementCmd(cmd))
      flowCtrl.subMenu.addCommand('Filter', (cmd) => this.addMlxElementCmd(cmd))
      flowCtrl.subMenu.addSeparator()
      flowCtrl.subMenu.addCommand('Flow Editor', (cmd) => this.addMlxElementCmd(cmd))

      this.mainMenu.addSeparator()
      let outputCmd = this.mainMenu.addSubmenu('Output')
      outputCmd.subMenu.addCommand('Label', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Speech', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Oscillator', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Sound Amplitude', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('FFT Spectrum', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Sound Viz', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Spectrogram', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Confusion Matrix', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand("Nat's Sound Tensor", (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addSeparator()
      outputCmd.subMenu.addCommand('Console Log', (cmd) => this.addMlxElementCmd(cmd))

      outputCmd.subMenu.addSeparator()
      outputCmd.subMenu.addCommand('MQTT', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('NETPIE 2020', (cmd) => this.addMlxElementCmd(cmd))
      outputCmd.subMenu.addCommand('Serial Port', (cmd) => this.addMlxElementCmd(cmd))
      //outputCmd.subMenu.addCommand("Bluetooth", (cmd) => this.addMlxElementCmd(cmd));
      outputCmd.subMenu.addCommand('Blynk', (cmd) => this.addMlxElementCmd(cmd))

      let gameCmd = this.mainMenu.addSubmenu('Games')
      gameCmd.subMenu.addCommand('Snake Game', (cmd) => this.addMlxElementCmd(cmd))
      //gameCmd.subMenu.addCommand('Pong Game', cmd => this.addMlxElementCmd(cmd));
      //gameCmd.subMenu.addCommand('Breakout Game', cmd => this.addMlxElementCmd(cmd));
      //gameCmd.subMenu.addCommand('Doodle QuickDraw', cmd => this.addMlxElementCmd(cmd));
      gameCmd.subMenu.addCommand('Scaventure Hunt', (cmd) => this.addMlxElementCmd(cmd))
      gameCmd.subMenu.addCommand('Nose Artist', (cmd) => this.addMlxElementCmd(cmd))
      gameCmd.subMenu.addCommand('Nose Artist(Mobile)', (cmd) => this.addMlxElementCmd(cmd))
      //gameCmd.subMenu.addCommand('Mask(Mobile)', cmd => this.addMlxElementCmd(cmd));
      gameCmd.subMenu.addCommand('Jungle Jumper', (cmd) => this.addMlxElementCmd(cmd))
      //gameCmd.subMenu.addCommand('Sorting Factory', cmd => this.addMlxElementCmd(cmd));
      gameCmd.subMenu.addCommand('We Love BubbleTea', (cmd) => this.addMlxElementCmd(cmd))
      gameCmd.subMenu.addCommand('Boat Parking', (cmd) => this.addMlxElementCmd(cmd))
      gameCmd.subMenu.addCommand('Clean the Ocean', (cmd) => this.addMlxElementCmd(cmd))
      /*
            let gamesCmd = this.mainMenu.addSubmenu("Games");
            gamesCmd.subMenu.addCommand("Snake", (cmd) => this.addMlxElementCmd(cmd));
            gamesCmd.subMenu.addCommand("Pong", (cmd) => this.addMlxElementCmd(cmd));
            */

      this.mainMenu.addSeparator()
      let transferCmd = this.mainMenu.addSubmenu('Transfer Learning')
      transferCmd.subMenu.addCommand('MobileNet Classifier', (cmd) => this.addMlxElementCmd(cmd))
      transferCmd.subMenu.addCommand('MobileNet Regressor', (cmd) => this.addMlxElementCmd(cmd))
      transferCmd.subMenu.addSeparator()
      transferCmd.subMenu.addCommand('MobileNet Feature Extractor', (cmd) => this.addMlxElementCmd(cmd))

      this.mainMenu.addSeparator()
      /*
            let dataPrepCmd = this.mainMenu.addSubmenu("Training Data Preparation");
            dataPrepCmd.subMenu.addCommand("Add label for Classification", (cmd) => this.addMlxElementCmd(cmd));
            dataPrepCmd.subMenu.addCommand("Add value for Regression", (cmd) => this.addMlxElementCmd(cmd));
            */

      let machineLearningCmd = this.mainMenu.addSubmenu('Machine Learning Algorithm')
      machineLearningCmd.subMenu.addCommand('KNN Classifier', (cmd) => this.addMlxElementCmd(cmd))
      let neuralNetworkCmd = this.mainMenu.addSubmenu('Deep Learning')
      neuralNetworkCmd.subMenu.addCommand('Neural Network (Classifier)', (cmd) => this.addMlxElementCmd(cmd))
      neuralNetworkCmd.subMenu.addCommand('Neural Network (Regressor)', (cmd) => this.addMlxElementCmd(cmd))
      //============== corgidude test ============//
      this.mainMenu.addSeparator()
      let corgidudeCmd = this.mainMenu.addSubmenu('CorgiDude')
      corgidudeCmd.subMenu.addCommand('CorgiDude Audio Input', (cmd) => this.addMlxElementCmd(cmd))
      corgidudeCmd.subMenu.addCommand('CorgiDude Video Capture', (cmd) => this.addMlxElementCmd(cmd))
      corgidudeCmd.subMenu.addSeparator()
      corgidudeCmd.subMenu.addCommand('CorgiDude Micropython IDE', (cmd) => this.addMlxElementCmd(cmd))
      corgidudeCmd.subMenu.addSeparator()
      corgidudeCmd.subMenu.addCommand('CorgiDude MobileNet', (cmd) => this.addMlxElementCmd(cmd))
      corgidudeCmd.subMenu.addSeparator()
      corgidudeCmd.subMenu.addCommand('CorgiDude MobileNet Classifier', (cmd) => this.addMlxElementCmd(cmd))
      corgidudeCmd.subMenu.addCommand('CorgiDude MobileNet Regressor', (cmd) => this.addMlxElementCmd(cmd))
    }
  }

  draw() {
    this.p5.resetMatrix()
    this.calculateMousePos()

    if (!this.fullScreenElement && !this.maximizedElement) {
      if (this.focusedElement) {
        this.p5.background(0)
      } else {
        this.p5.background(204)
      }

      this.p5.translate(this.userScaleX, this.userScaleY)
      this.p5.scale(this.userScale)
      //console.log("this.userScale"+this.userScale);
      this.p5.translate(-this.userScaleX, -this.userScaleY)

      this.p5.translate(this.userTranslateX, this.userTranslateY)

      for (var i in this.mlxElements) {
        this.mlxElements[i].drawLink(this.p5)
      }
    } else {
      if (this.maximizedElement) {
        this.p5.background(204)
      } else {
        this.p5.background(0)
      }
    }

    if (this.maximizedElement != null) {
      this.maximizedElement.draw(this.p5)
      return
    }

    if (this.focusedElement) {
      //Art - alternative to fullscreen
      this.focusedElement.draw(this.p5)
      this.focusedElement.drawUI(this.p5)
      this.focusedElement.drawUITop(this.p5)
    } else {
      for (var i in this.mlxElements) {
        if (!this.fullScreenElement || this.fullScreenElement == this.mlxElements[i]) {
          this.mlxElements[i].draw(this.p5)
          this.mlxElements[i].drawUI(this.p5)
          this.mlxElements[i].drawInputLink(this.p5)
          this.mlxElements[i].drawOutputLink(this.p5)
          this.mlxElements[i].drawUITop(this.p5)
        }
      }
    }
    if (!this.fullScreenElement) {
      if (this.mainMenu) {
        this.mainMenu._draw(this.p5)
      }
    }
  }

  calculateMousePos() {
    this.mouseX =
      this.p5.mouseX / this.userScale - this.userScaleX / this.userScale + this.userScaleX - this.userTranslateX
    this.mouseY =
      this.p5.mouseY / this.userScale - this.userScaleY / this.userScale + this.userScaleY - this.userTranslateY
  }

  mousePressed() {
    this.calculateMousePos()
    for (var i = this.popup.length - 1; i >= 0; i--) {
      let pop = this.popup[i]
      if (pop.isHitElement(this.mouseX, this.mouseY)) {
        pop.mousePressed()
        return
      } else {
        let p = null
        if (pop.parent) {
          p = pop.parent
        }
        pop.hidden = true
        this.popup.splice(i, 1)

        if (p && p.activateUI) {
          p.activateUI()
        }
        if (p && p.isHitElement(this.mouseX, this.mouseY)) {
          return
        }

        if (i == 0) {
          if (p) {
            if (p.isHitMenuButton(this.mouseX, this.mouseY)) {
              return
            }
          } else {
            return
          }
        } else {
          //console.log(p);
        }
      }
    }

    for (var i = this.mlxElements.length - 1; i >= 0; i--) {
      let el = this.mlxElements[i]

      if (el.isHitMenuButton(this.mouseX, this.mouseY)) {
        this.bringToTop(el)
        el.toggleMenu()
        return
      }

      if (el.isHitInputLink(this.mouseX, this.mouseY)) {
        this.elLinkMoving = el.inElement
        el.inElement.linkMoving = true
        el.inElement.clearLinkTo()
        return
      }

      if (el.isHitOutputLink(this.mouseX, this.mouseY)) {
        el.linkMoving = true
        this.elLinkMoving = el
        return
      }

      if (el.isHitCaptionBar(this.mouseX, this.mouseY)) {
        this.bringToTop(el)
        this.elMoving = el
        el.isHighlight = true
        this.pmouseX = this.mouseX
        this.pmouseY = this.mouseY
        return
      }

      if (el.isHitSizer(this.mouseX, this.mouseY)) {
        this.elSizing = el
        el.isHighlight = true
        this.pmouseX = this.mouseX
        this.pmouseY = this.mouseY
        return
      }

      if (el.isHitElement(this.mouseX, this.mouseY)) {
        if (el.needMouse) {
          this.elDragging = el
          if (!el.mousePressed()) return
        }
        return
      }
    }
    if (this.p5.mouseButton === this.p5.RIGHT || this.p5.touches.length == 3) {
      console.log('Right button pressed')
      console.log(this.mainMenu)
      //this.addVideoCapture();
      if (this.mainMenu) {
        this.mainMenu.xx = this.mouseX
        if (this.mainMenu.xx + this.mainMenu.w > this.p5.width - 10) {
          this.mainMenu.xx = this.p5.width - this.mainMenu.w - 10
        }
        this.mainMenu.yy = this.mouseY
        if (this.mainMenu.yy + this.mainMenu.h > this.p5.height - 50) {
          this.mainMenu.yy = this.p5.height - this.mainMenu.h - 50
        }
        this.mainMenu.hidden = false
        this.popup.push(this.mainMenu)
      }
    } else if (this.p5.mouseButton === this.p5.LEFT) {
      this.panning = true
    }
  }

  bringToTop(el) {
    let i = this.mlxElements.indexOf(el)
    if (i >= 0) {
      this.mlxElements.splice(i, 1)
      this.mlxElements.push(el)
    }
  }

  touchStartScale(scale) {
    this.startUserScale = this.userScale
    this.userScaleX = this.p5.mouseX
    this.userScaleY = this.p5.mouseY
  }

  touchScale(scale) {
    this.userScale = this.startUserScale * scale
    if (this.userScale < 0.1) this.userScale = 0.1
    if (this.userScale > 10) this.userScale = 10

    this.userTranslateX += this.p5.mouseX - this.p5.pmouseX
    this.userTranslateY += this.p5.mouseY - this.p5.pmouseY
    this.pmouseX = this.mouseX
    this.pmouseY = this.mouseY

    for (var i in this.mlxElements) {
      let el = this.mlxElements[i]
      if (el.isHitElement(this.mouseX, this.mouseY)) {
        if (el.needMouse) {
          if (!el.mouseWheel(event)) return
        }
        return
      }
    }
  }

  mouseWheel(event) {
    if (this.p5.keyIsDown(this.p5.SHIFT)) {
      this.userScaleX = this.p5.mouseX
      this.userScaleY = this.p5.mouseY

      this.pos += event.delta
      this.userScale = 1.0 + this.pos / 100
      if (this.userScale < 0.1) this.userScale = 0.1
      if (this.userScale > 10) this.userScale = 10
      //console.log(this.pos);
    }
    for (var i in this.mlxElements) {
      let el = this.mlxElements[i]
      if (el.isHitElement(this.mouseX, this.mouseY)) {
        if (el.needMouse) {
          if (!el.mouseWheel(event)) return
        }
        return
      }
    }
  }

  mouseReleased() {
    this.calculateMousePos()
    if (this.panning) {
      this.panning = false
      return
    }
    if (this.popup.length) {
      this.popup[this.popup.length - 1].mouseReleased()
      return
    }

    if (this.elLinkMoving) {
      this.elLinkMoving.linkMoving = false
      if (this.elLinkTarget) {
        this.elLinkTarget.isHighlight = false
        this.elLinkTarget = null
      }
      for (var i in this.mlxElements) {
        let el = this.mlxElements[i]
        if (el.isHitElement(this.mouseX, this.mouseY)) {
          if (el != this.elLinkMoving) {
            if (
              this.elLinkMoving.outType === el.inType ||
              el.inType == 'all' ||
              (el.inType.includes(',') ? el.inType.split(',').includes(this.elLinkMoving.outType) : false)
            ) {
              if (!el.inElement) {
                this.elLinkMoving.linkTo(el)
                break
              } else if (el.allowExtraInElement) {
                this.elLinkMoving.linkToExtra(el)
                break
              }
            }
          }
        }
      }

      this.elLinkMoving = null
    }
    if (this.elMoving) {
      this.elMoving.isHighlight = false
      this.elMoving = null
    }

    if (this.elSizing) {
      this.elSizing.isHighlight = false
      this.elSizing = null
    }

    if (this.elDragging) {
      this.elDragging.mouseReleased()
      this.elDragging = null
    }
  }

  mouseMoved() {
    this.calculateMousePos()
    if (this.popup.length) {
      for (var i = this.popup.length - 1; i >= 0; i--) {
        let pop = this.popup[i]
        pop.mouseMoved()
      }
    }
    if (this.elDragging) {
      this.elDragging.mouseMoved()
    }
  }

  mouseDragged() {
    this.calculateMousePos()
    if (this.panning) {
      this.userTranslateX += this.p5.mouseX - this.p5.pmouseX
      this.userTranslateY += this.p5.mouseY - this.p5.pmouseY
      return
    }
    if (this.popup.length) {
      this.popup[this.popup.length - 1].mouseDragged()
      return
    }

    if (this.elLinkMoving) {
      for (var i in this.mlxElements) {
        let el = this.mlxElements[i]
        if (el.isHitElement(this.mouseX, this.mouseY)) {
          if (el != this.elLinkMoving && !el.inElement) {
            if (
              this.elLinkMoving.outType === el.inType ||
              el.inType == 'all' ||
              (el.inType.includes(',') ? el.inType.split(',').includes(this.elLinkMoving.outType) : false)
            ) {
              if (this.elLinkTarget) {
                this.elLinkTarget.isHighlight = false
              }
              this.elLinkTarget = el
              this.elLinkTarget.isHighlight = true
            }
            return
          }
        }
      }
      if (this.elLinkTarget) {
        this.elLinkTarget.isHighlight = false
        this.elLinkTarget = null
      }
    }
    if (this.elMoving) {
      this.elMoving.x += this.mouseX - this.pmouseX
      this.elMoving.y += this.mouseY - this.pmouseY
      this.elMoving.setPosition(this.elMoving.x, this.elMoving.y)
      this.pmouseX = this.mouseX
      this.pmouseY = this.mouseY
    }

    if (this.elSizing) {
      this.elSizing.resizeByMouse()
    }

    if (this.elDragging) {
      this.elDragging.mouseDragged()
    }
  }

  keyPressed(value) {
    //console.log("mlx.keyPressed:"+this.p5.keyCode);
    if (this.p5.keyCode === this.p5.ESCAPE) {
      if (this.focusedElement) {
        console.log('Exit Focus Element')
        //remove focusedElement
        this.userScaleX = 0
        this.userScaleY = 0
        this.userScale = 1
        this.focusedElement.removeFocus()
        this.focusedElement = null
      }
      if (this.isMaximize) {
        if (this.maximizedElement) {
          if (!this.maximizedElement.lockMaximize) {
            this.maximizedElement.exitMaximize()
          }
        } else {
          this.normalizeWindow()
        }
      }
    }
  }
}

module.exports = {
  MLX,
}
