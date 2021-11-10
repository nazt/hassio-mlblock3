const { mlxElementInput } = require("./mlxElement");
const short = require("short-uuid");
const copy = require("copy-to-clipboard");

class mlxRTCVideo extends mlxElementInput {
  constructor(mlx) {
    super(mlx);

    this.category = "Input";
    this.type = "RTCVideo";
    this.title = "RTCVideo Capture";

    this.inType = "none";
    this.outType = "image";

    this.replaceImage = null;

    this.contentAspectRatio = 16 / 9;
    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = ((256 - 30) * 16) / 9;
    this.contentH = this.contentW / this.contentAspectRatio;
    this.contentScale = 1.0;

    this.setElementSizeByContentSize();

    this.resizable = true;
    this.flip = false;
    // this.cameraMode = 0;
    // this.facingMode = 'user';
    this.needMouse = true;
    this.autoMaximize = false;

    this.createElementMenu();

    this.isVideoCaptureReady = false;

    this.doCaptureScreen = false; //do capture screen after all draw

    this.constraints = {
      audio: false,
      video: {
        facingMode: this.facingMode,
      },
    };
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.constraints.video.aspectRatio = 16.0 / 9.0;
    }

    this.doCreateVideoCapture();
    console.log("video capture ready");

    this.flipButton = this.mlx.createButton(
      this,
      "Camera",
      () => {
        //alert(!this.cameraMode);
        this.switchCamera(!this.cameraMode);
      },
      10 + this.mlx.mlxPadding,
      this.h - 10 - 22 - this.mlx.mlxPadding,
      80,
      22
    );

    this.flipButton.border = true;
    this.flipButton.hidden = true;

    this.outputIsReady = false;
    this.busy = false;

    //shutter sound for screen capture
    this.beepSound = this.p5.loadSound("assets/shutterbeep.mp3");
    this.shutterSound = this.p5.loadSound("assets/shuttersound.mp3");

    // let y = this.contentH / 2;
    // let x = this.contentW / 2 - 200 / 2;

    this.divW = 100;
    this.divH = 20;

    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;

    this.inputX = this.contentX;
    this.inputY = this.contentY + 40;

    this.label = this.mlx.createLabel(
      this,
      "Waiting for the video signal..",
      10,
      30, //this.contentW / 2 - 20,
      this.contentW,
      24
    );

    this.labelPeerId = this.mlx.createButton(
      this,
      "",
      () => {
        let url = this.labelPeerId.text;
        // prompt('Link to stream', url);
        let res = copy(url, {
          debug: true,
          format: "text/plain",
          onCopy: () => {
            this.labelPeerId.setText(`${url} Copied`);
            setTimeout(() => {
              this.labelPeerId.setText(`${url}`);
            }, 500);
          },
        });
        console.log(res);
      },
      -10,
      50, // ; Y ; this.contentW / 2 + 20 - 20,
      this.contentW,
      24
    );

    this.qrid = short.generate();
    this.div = mlx.p5.createDiv();
    this.div.id(this.qrid);
    this.div.size(256, 256);
    this.div.position(this.x + 10, this.y + 70);
    this.div.style("background-color", "#FFFF00");
    this.div.style("text-align", "left");
    this.div.style("font-size", "x-small");
    this.div.style("display", "block");

    this.qrcode = new QRCode(this.qrid, { width: 256, height: 256 });

    this.mh = this.h;
    this.mw = this.w;

    // this.copyButton = this.mlx.createButton(
    //     this,
    //     'Copy',
    //     () => {
    //         let url = this.peerId;
    //         prompt('Copy to clipboard: Ctrl+C, Enter', url + this.peerId);
    //         this.copyButton.setText('Copied!');
    //         setTimeout(() => {
    //             this.copyButton.setText('Copy');
    //         }, 700);
    //         // this.connectButton.setText("Connecting..");
    //         // this.cmd("A")
    //     },
    //     this.w - 200,
    //     this.h - 20,
    //     90,
    //     24
    // );
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    let xx = this.x + this.inputX;
    let yy =
      this.y + this.inputY + this.mlx.mlxNavBarHeight / this.mlx.userScale;

    xx =
      xx +
      this.mlx.userTranslateX +
      this.mlx.userScaleX / this.mlx.userScale -
      this.mlx.userScaleX;
    yy =
      yy +
      this.mlx.userTranslateY +
      this.mlx.userScaleY / this.mlx.userScale -
      this.mlx.userScaleY;

    this.div.position(xx * this.mlx.userScale, yy * this.mlx.userScale);
    this.div.size(256 * this.mlx.userScale, 256 * this.mlx.userScale);
  }

  update() {
    super.update(this.x, this.y);
    this.setPosition(this.x, this.y);
  }

  inactivateUI() {
    this.div.hide();
  }

  activateUI() {
    this.div.show();
  }

  doCreateVideoCapture() {
    if (this.ready) {
      this.videoCapture.remove();
    }

    const peer = new Peer(short.generate().substring(0, 4));
    this.peer = peer;

    peer.on("open", async (id) => {
      this.peerId = id;
      let host = window.location.host;
      let url = `${location.protocol}//${host}/rtc?uid=${this.peerId}`;
      console.log(url);
      this.labelPeerId.setText(url);
      this.qrcode.makeCode(url);
    });

    peer.on("call", (call) => {
      console.log("Call received!");
      this.ready = false;
      call.on("stream", async (remoteStream) => {
        this.label.hidden = true;
        this.div.style("display", "none");
        let video = this.videoCapture.elt;
        video.srcObject = remoteStream;
        video.setAttribute("playsinline", "");
        video.onloadedmetadata = (e) => {
          this.videoRawWidth = e.target.videoWidth;
          this.videoRawHeight = e.target.videoHeight;
          this.contentAspectRatio = this.videoRawWidth / this.videoRawHeight;
          this.videoWidth = this.w - this.mlx.mlxPadding * 2;
          this.videoHeight = this.videoWidth / this.contentAspectRatio;
          this.videoCapture.size(this.videoWidth, this.videoHeight);
          this.videoCapture.hide();
          // this.videoCapture.stop();

          this.contentW = this.videoWidth;
          this.contentH = this.videoHeight;
          video.play();
          this.videoCapture.play();
          this.setVideoCaptureSize();
          this.setElementSizeByContentSize();
          this.labelPeerId.hidden = true;
          this.videoCapture.play();
          this.ready = true;
        };
        // videoStream.status = 'Video stream received';
        // videoStream.stream = remoteStream;
        for (const track of remoteStream.getTracks()) {
          await track.addEventListener("ended", () => {
            console.log("track end!");
            // this.videoStreams = this.videoStreams.filter(s => s !== videoStream);
          });
        }
      });
      call.on("close", (remoteStream) => {
        console.log("call.on close");
      });
      call.answer();
    });

    try {
      this.ready = false;
      this.videoCapture = this.mlx.p5.createVideo();
      // this.videoCapture = this.mlx.p5.createCapture(this.constraints, () => {
      this.isVideoCaptureReady = false;
      this.videoRawWidth = 800;
      this.videoRawHeight = 600;
      this.contentAspectRatio = this.videoRawWidth / this.videoRawHeight;
      this.videoWidth = this.w - this.mlx.mlxPadding * 2;
      this.videoHeight = this.videoWidth / this.contentAspectRatio;

      this.videoCapture.size(this.videoWidth, this.videoHeight);
      // this.videoCapture2.size(this.videoWidth, this.videoHeight);
      this.videoCapture.hide();
      // this.videoCapture.stop();

      this.contentW = this.videoWidth;
      this.contentH = this.videoHeight;

      this.setElementSizeByContentSize();

      if (this.isMaximize) {
        this.scaleContentToFillSize(false);
      }
      //     if (this.isFullScreen) {
      //         this.flipButton.yy = this.p5.height - 10 - 22 - this.mlx.mlxPadding;
      //         this.flipButton.hidden = false;
      //     } else {
      //         this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
      //     }
      if (this.autoMaximize) {
        this.enterMaximize();
      }
      // this.videoCapture.loadPixels();
      window.xyz = this.videoCapture;
      this.output = this.videoCapture;
      // this.ready = true;
      // });
      window.videoCapture = this.videoCapture;
    } catch (err) {
      console.log("ERROR", err);
      this.loading.html("ERROR: " + err);
      this.ready = false;
    }
  }

  save() {
    let data = super.save();
    data.flip = this.flip;
    data.autoMaximize = this.autoMaximize;
    return data;
  }

  load(data) {
    super.load(data);
    this.flip = data.flip;
    this.flipMenu.value = this.flip;
    if (!data.autoMaximize) {
      this.autoMaximize = false;
    } else {
      this.autoMaximize = data.autoMaximize;
    }
    this.autoMaxMenu.value = this.autoMaximize;
    if (this.autoMaximize) {
      this.lockMaximize = true;
      this.enterMaximize();
    }
  }

  setVideoCaptureSize() {
    this.videoWidth = this.contentW;
    this.videoHeight = this.contentH;
    this.videoCapture.size(this.videoWidth, this.videoHeight);
  }

  resizeByMouse() {
    super.resizeByMouse();
    if (!this.ready) {
      if (this.h < this.mh) {
        this.h = this.mh;
      }
      if (this.w < this.mw) {
        this.w = this.mw;
      }
    }
    this.setVideoCaptureSize();
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
  }

  endFullScreen() {
    super.endFullScreen();
    this.setVideoCaptureSize();
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
    this.flipButton.hidden = true;
  }

  enterFullScreen() {
    super.enterFullScreen();
    this.setVideoCaptureSize();
    if (this.isFullScreen) {
      this.flipButton.yy = this.p5.height - 10 - 22 - this.mlx.mlxPadding;
    } else {
      this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
    }

    this.doCreateVideoCapture();
  }

  enterMaximize() {
    super.enterMaximize();
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
    this.flipButton.hidden = false;
  }

  exitMaximize() {
    super.exitMaximize();
    this.isMaximize = false;
    this.maxMenu.value = false;
    this.flipButton.yy = this.h - 10 - 22 - this.mlx.mlxPadding;
    this.flipButton.hidden = true;
  }

  captureScreen() {
    this.captureCountdown = 2999;
    this.captureBeepCountdown = 0;
    this.doCaptureScreen = true;
  }

  switchCamera(value) {
    this.cameraMode = value;
    if (value == 0) {
      this.face = "user";
      this.constraints = {
        audio: false,
        video: {
          facingMode: this.face,
        },
      };
      this.flip = true;
    } else {
      this.face = "environment";
      this.constraints = {
        audio: false,
        video: {
          facingMode: {
            exact: this.face,
          },
        },
      };
      this.flip = false;
    }
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.constraints.video.aspectRatio = 16.0 / 9.0;
    }
    this.doCreateVideoCapture();
  }

  createElementMenu() {
    let menu = this._createMenu();

    menu.addCommand("Full screen", (ui) => {
      this.hideMenu();
      this.enterFullScreen();
    });
    this.maxMenu = menu.addCheckedMenu(
      "Maximize",
      this.isMaximize,
      (ui, value) => {
        this.hideMenu();
        this.isMaximize = value;
        if (this.isMaximize) {
          this.enterMaximize();
        } else {
          this.exitMaximize();
        }
      }
    );
    this.autoMaxMenu = menu.addCheckedMenu(
      "Auto Maximize",
      this.autoMaximize,
      (ui, value) => {
        this.hideMenu();
        this.autoMaximize = value;
      }
    );
    menu.addSeparator();

    menu.addCommand("Capture Canvas", (ui) => {
      this.hideMenu();
      this.captureScreen();
    });
    menu.addSeparator();

    this.flipMenu = menu.addCheckedMenu("Flip", this.flip, (ui, value) => {
      //console.log('filp command');
      this.hideMenu();
      this.flip = value;
    });
    menu.addSeparator();

    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  remove() {
    //console.log("RemoveVideo");
    if (this.videoCapture) {
      this.videoCapture.stop();
      if (this.isVideoCaptureReady) {
        this.videoCapture.remove();
      }
      this.videoCapture = null;
    }
    this.peer.destroy();
    super.remove();
  }

  doProcess() {
    this.div.style("display", "none");
    this.busy = false;
    this.outputIsReady = true;
    this.alreadyRunInLoop = true;
    return true;
  }

  doDraw(p5) {
    if (this.backgroundImage) {
      p5.image(
        this.backgroundImage,
        this.x + this.contentX,
        this.y + this.contentY,
        this.contentW,
        this.contentH
      );
    }
    if (this.replaceImage) {
      p5.image(
        this.replaceImage,
        this.x + this.contentX,
        this.y + this.contentY,
        this.contentW,
        this.contentH
      );
    } else {
      p5.image(
        this.videoCapture,
        this.x + this.contentX,
        this.y + this.contentY,
        this.contentW,
        this.contentH
      );
    }
  }

  draw(p5) {
    super.draw(p5);

    if (this.ready) {
      if (!this.noDraw) {
        p5.push();
        if (this.flip) {
          p5.translate((this.x + this.contentX) * 2 + this.contentW, 0);
          p5.scale(-1, 1);
        }
        this.doDraw(p5);
        p5.pop();
      }
      if (this.extraDraw) {
        this.extraDraw.doExtraDraw(p5, this.extraDraw);
      }

      if (this.doCaptureScreen) {
        //Art do capture screen action
        //add countdown 3 sec.before takeing photo
        this.captureCountdown -= p5.deltaTime;
        if (this.captureCountdown > 0) {
          this.captureBeepCountdown -= p5.deltaTime;
          if (this.captureBeepCountdown < 0) {
            //play beep sound
            if (this.beepSound != null && this.beepSound.isLoaded())
              this.beepSound.play();
            this.captureBeepCountdown = 1000;
          }
          p5.push();
          p5.fill(255);
          p5.textSize(40);
          p5.text(
            p5.floor(this.captureCountdown / 1000) + 1,
            this.x + this.contentX + this.contentW - 50,
            this.y + this.contentY,
            50,
            50
          );
          p5.pop();
        } else {
          //since p5 is already manipulated by user scale/transition
          //we create new graphic with same p5's size and redraw this frame all over again
          if (this.shutterSound != null && this.shutterSound.isLoaded())
            this.shutterSound.play();
          p5.push();
          p5.resetMatrix();
          p5.translate(0, 0);
          p5.scale(1);
          var capCanvas = p5.createGraphics(p5.width, p5.height);
          if (!this.noDraw) {
            capCanvas.push();
            if (this.flip) {
              capCanvas.translate(
                (this.x + this.contentX) * 2 + this.contentW,
                0
              );
              capCanvas.scale(-1, 1);
            }
            this.doDraw(capCanvas);
            capCanvas.pop();
          }
          if (this.extraDraw) {
            this.extraDraw.doExtraDraw(capCanvas, this.extraDraw);
          }
          var capImage = capCanvas.get(
            this.x + this.contentX,
            this.y + this.contentY,
            this.contentW,
            this.contentH
          );
          capImage.save("myVideoCanvas.jpg");
          p5.pop();
          this.doCaptureScreen = false;
        }
      }
    }
  }

  mousePressed() {
    super.mousePressed();
    if (this.p5.touches.length == 3) {
      this.exitMaximize();
    }
  }
}

module.exports = {
  mlxRTCVideo,
};
