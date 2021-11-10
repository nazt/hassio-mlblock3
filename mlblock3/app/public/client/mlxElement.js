let mlxAmp = 0;
let mlxOsc;

class mlxElement {
  constructor(mlx) {
    this.mlx = mlx;
    this.p5 = mlx.p5;

    this.category = null;
    this.type = null;

    this.inType = null;
    this.outType = null;

    this.x = 100;
    this.y = 100;
    this.w = 200;
    this.h = 100;
    this.colorBackground = this.p5.color(240);

    this.div = null;

    this.ready = false;
    this.busy = false;
    this.alreadyRunInLoop = false;
    this.outputIsReady = false;
    this.noDraw = false;

    this.inElement = null;
    this.outElement = null;

    this.replaceImage = null;
    this.backgroundImage = null;

    this.extraInElement = [];
    this.allowExtraInElement = false;

    this.linkMoving = false;
    this.resizable = false;
    this.resizing = false;
    this.isHighlight = false;

    this.children = [];
    this.title = null;
    this.extraDraw = null;
    this.needMouse = false;

    this.needResults = null;
    this.isFullScreen = false;
    this.autoMaximize = false;
    this.lockMaximize = false;
  }

  createDiv(x, y, w, h, html) {
    this.divX = x;
    this.divY = y;
    this.divW = w;
    this.divH = h;

    this.div = mlx.p5.createDiv();
    this.div.html(html);
    this.div.size(this.divW, this.divH);
    this.div.position(this.x + this.divX, this.y + this.divY);
  }

  scaleContentToFillSize(isFullScreen) {}

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.div)
      this.div.position(
        this.x + this.divX,
        this.y + this.divY + this.mlx.mlxNavBarHeight
      );
  }

  save() {
    let data = {
      type: this.type,

      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,

      outElementIndex: parseInt(this.getOutElementIndex()),
      outExtraElementIndex: parseInt(this.getOutExtraElementIndex()),
    };
    return data;
  }

  getOutElementIndex() {
    if (!this.outElement) {
      return -1;
    }
    if (this.outElement.inElement == this) {
      return this.mlx.getElementIndex(this.outElement);
    }
    return -1;
  }

  getOutExtraElementIndex() {
    if (!this.outElement) {
      return -1;
    }
    if (this.outElement.inElement != this) {
      return this.mlx.getElementIndex(this.outElement);
    }
    return -1;
  }

  load(data) {
    if (data.type == this.type) {
      this.x = data.x;
      this.y = data.y;
      this.w = data.w;
      this.h = data.h;
    }
  }

  remove() {
    if (this.div) this.div.remove();
  }

  refresh() {}

  clearResults() {}

  process() {
    return false;
  }

  doProcess() {
    return false;
  }

  update() {}

  mouseWheel(event) {
    //console.log("mouseWheel 0");
    if (this.needMouse) {
      for (var i in this.children) {
        let child = this.children[i];
        if (!child.hidden) {
          if (child.mouseWheel) {
            if (!child.mouseWheel(event)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  mousePressed() {
    if (this.needMouse) {
      for (var i in this.children) {
        let child = this.children[i];
        if (!child.hidden) {
          if (!child.mousePressed()) return false;
        }
      }
    }
    return true;
  }

  mouseReleased() {
    if (this.needMouse) {
      for (var i in this.children) {
        let child = this.children[i];
        if (!child.hidden) {
          if (!child.mouseReleased()) return false;
        }
      }
    }
    return true;
  }

  mouseMoved() {}

  mouseDragged() {
    if (this.needMouse) {
      for (var i in this.children) {
        let child = this.children[i];
        child.mouseDragged();
      }
    }
  }

  enterMaximize() {}
  exitMaximize() {}

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  _createMenu() {
    if (!this.menu) {
      this.menu = this.mlx.createMenu(this, 10, this.mlx.mlxCaptionHeight);
      this.menu.hidden = true;
      this.menu.alwaysOnTop = true;
      return this.menu;
    }
  }

  hidePopup(ui) {
    for (var i in this.mlx.popup) {
      let pop = this.mlx.popup[i];
      if (pop == ui) {
        this.mlx.popup.splice(i, this.mlx.popup.length - i);
        pop.hidden = true;
      }
    }
  }

  hideMenu() {
    if (this.menu) {
      this.menu.hidden = true;
      for (var i in this.mlx.popup) {
        let pop = this.mlx.popup[i];
        if (pop == this.menu) {
          this.mlx.popup.splice(i, this.mlx.popup.length - i);
        }
      }
    }
  }

  updateUI() {
    for (var i in this.children) {
      let child = this.children[i];
      child._update();
    }
  }

  drawUI(p5) {
    for (var i in this.children) {
      let child = this.children[i];
      if (child.hidden == false && !child.alwaysOnTop) {
        child._draw(p5);
      }
    }
  }

  drawUITop(p5) {
    for (var i in this.children) {
      let child = this.children[i];
      if (child.hidden == false && child.alwaysOnTop) {
        child._draw(p5);
      }
    }
  }

  toggleMenu() {
    if (this.menu) {
      this.menu.hidden = !this.menu.hidden;
      if (this.menu.hidden == false) {
        this.inactivateUI();
        this.mlx.popup.push(this.menu);
      } else {
        this.activateUI();
      }
    }
  }

  inactivateUI() {}

  activateUI() {}

  isHitMenuButton(x, y) {
    if (
      x > this.x + 10 &&
      x < this.x + 20 &&
      y > this.y + 8 &&
      y < this.y + 26
    ) {
      return true;
    }
    return false;
  }

  isHitElement(x, y) {
    if (
      x > this.x &&
      x < this.x + this.w &&
      y > this.y &&
      y < this.y + this.h
    ) {
      return true;
    }
    return false;
  }

  isHitSizer(x, y) {
    if (!this.resizable) return false;
    if (
      x > this.x + this.w - 10 &&
      x < this.x + this.w &&
      y > this.y + this.h - 10 &&
      y < this.y + this.h
    ) {
      return true;
    }
    return false;
  }

  isHitCaptionBar(x, y) {
    if (
      x > this.x &&
      x < this.x + this.w &&
      y > this.y &&
      y < this.y + this.mlx.mlxCaptionHeight
    ) {
      return true;
    }
    return false;
  }

  isHitInputLink(x, y) {
    const hls = this.mlx.mlxLinkSize / 2 + 1;
    if (this.inElement) {
      if (this.inElement.linkMoving == false) {
        if (
          x > this.inputLinkX - hls &&
          x < this.inputLinkX + hls &&
          y > this.inputLinkY - hls &&
          y < this.inputLinkY + hls
        ) {
          //console.log("hit input link");
          return true;
        }
      }
    }
    return false;
  }

  isHitOutputLink(x, y) {
    const hls = this.mlx.mlxLinkSize / 2 + 1;
    if (!this.outElement) {
      if (this.linkMoving == false) {
        if (
          x > this.outputLinkX - hls &&
          x < this.outputLinkX + hls &&
          y > this.outputLinkY - hls &&
          y < this.outputLinkY + hls
        ) {
          //console.log("hit output link");
          return true;
        }
      }
    }
    return false;
  }

  updateOutputLinkPosition() {
    let pos = 0; // down
    if (this.linkMoving) {
      if (this.mlx.mouseY > this.y + this.h + 20) pos = 0;
      else pos = 1;
    } else {
      if (!this.outElement || this.outElement.y > this.y + this.h + 20) pos = 0;
      else pos = 1;
    }
    if (pos == 0) {
      this.outputLinkX = this.x + this.w / 2;
      this.outputLinkY = this.y + this.h;

      this.outputLinkCtrlX = 0;
      this.outputLinkCtrlY = 1;
    } else {
      this.outputLinkX = this.x + this.w;
      this.outputLinkY = this.y + this.h / 2 + this.mlx.mlxCaptionHeight / 2;

      this.outputLinkCtrlX = 1;
      this.outputLinkCtrlY = 0;
    }
  }

  updateInputLinkPosition() {
    if (!this.inElement) return;
    if (this.y > this.inElement.y + this.inElement.h) {
      this.inputLinkX = this.x + this.w / 2;
      this.inputLinkY = this.y;

      this.inputLinkCtrlX = 0;
      this.inputLinkCtrlY = -1;

      this.inputLinkAngle = 90;
    } else {
      this.inputLinkX = this.x;
      this.inputLinkY = this.y + this.h / 2 + this.mlx.mlxCaptionHeight / 2;

      this.inputLinkCtrlX = -1;
      this.inputLinkCtrlY = 0;
      this.inputLinkAngle = 0;
    }
  }

  draw(p5) {
    if (this.mlx.fullScreenElement == this) {
      return;
    }

    if (this.mlx.maximizedElement) {
      return;
    }
    p5.fill(this.colorBackground);
    p5.noStroke();
    // element
    p5.rect(
      this.x,
      this.y,
      this.w,
      this.h,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize
    );
    p5.fill(64);

    // title bar
    p5.rect(
      this.x,
      this.y,
      this.w,
      this.mlx.mlxCaptionHeight,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize,
      0,
      0
    );

    if (this.resizable) {
      p5.stroke(192);
      p5.strokeWeight(2);
      p5.line(
        this.x + this.w - 15,
        this.y + this.h,
        this.x + this.w,
        this.y + this.h - 15
      );
      p5.line(
        this.x + this.w - 10,
        this.y + this.h,
        this.x + this.w,
        this.y + this.h - 10
      );
    }

    p5.stroke(0);
    p5.noFill();
    if (this.isHighlight) {
      p5.stroke(this.mlx.getLinkColor(this.inType));
      p5.strokeWeight(5);
      p5.rect(
        this.x - 2,
        this.y - 2,
        this.w + 4,
        this.h + 4,
        this.mlx.mlxCornerSize + 2,
        this.mlx.mlxCornerSize + 2,
        this.mlx.mlxCornerSize + 2,
        this.mlx.mlxCornerSize + 2
      );
      p5.stroke(0);
      p5.strokeWeight(1);
    } else {
      p5.stroke(0);
      p5.strokeWeight(1);
    }
    // border
    p5.rect(
      this.x,
      this.y,
      this.w,
      this.h,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize,
      this.mlx.mlxCornerSize
    );
    p5.stroke(0);
    p5.strokeWeight(1);

    // titile line
    p5.line(
      this.x,
      this.y + this.mlx.mlxCaptionHeight,
      this.x + this.w,
      this.y + this.mlx.mlxCaptionHeight
    );

    p5.stroke(255);
    let y = this.y + 8;
    p5.line(this.x + 10, y, this.x + 20, y);
    p5.line(this.x + 10, y + 4, this.x + 20, y + 4);
    p5.line(this.x + 10, y + 8, this.x + 20, y + 8);

    // title text
    if (this.title) {
      p5.fill(255);
      p5.noStroke();
      p5.textSize(14);
      p5.textAlign(p5.LEFT, p5.TOP);

      p5.text(this.title, this.x + 30, this.y + 1);
    }

    // ready light
    p5.stroke(0);
    if (this.ready) {
      p5.fill(0, 192, 0);
      if (this.outputIsReady) {
        p5.fill(10, 255, 0);
      }
    } else {
      p5.fill(255, 0, 0);
    }
    p5.ellipse(this.x + this.w - 12, this.y + 12, 10, 10);
  }

  linkTo(el) {
    this.outElement = el;
    el.inElement = this;
    this.outLinkWeight = 3;
  }

  linkToExtra(el) {
    if (el.allowExtraInElement) {
      this.outElement = el;
      el.extraInElement.push(this);
      this.outLinkWeight = 1;
    }
  }

  clearLinkTo() {
    if (this.outElement) {
      if (this.outElement.inElement == this) {
        for (let i = this.outElement.extraInElement.length - 1; i >= 0; i--) {
          let ex = this.outElement.extraInElement[i];
          ex.clearLinkTo(this.outElement);
        }
        this.outElement.inElement = null;
      } else {
        let i = this.outElement.extraInElement.indexOf(this);
        this.outElement.extraInElement.splice(i, 1);
      }
      if (this.extraDraw) {
        this.extraDraw = null;
      }
      if (this.backgroundImage) {
        this.backgroundImage = null;
      }
      if (this.replaceImage) {
        this.replaceImage = null;
      }
      this.outElement = null;
      this.outputIsReady = false;
    }
  }

  drawLink(p5) {
    if (this.mlx.maximizedElement) {
      return;
    }
    p5.push();
    if (this.linkMoving) {
      p5.stroke(128);
      p5.strokeWeight(1);
      p5.noFill();
      let bx = (Math.abs(this.mlx.mouseX - this.outputLinkX) * 2) / 3;
      let by = (Math.abs(this.mlx.mouseY - this.outputLinkY) * 2) / 3;
      p5.bezier(
        this.outputLinkX,
        this.outputLinkY,
        this.outputLinkX + bx * this.outputLinkCtrlX,
        this.outputLinkY + by * this.outputLinkCtrlY,
        this.mlx.mouseX - bx * this.outputLinkCtrlX,
        this.mlx.mouseY - by * this.outputLinkCtrlY,
        this.mlx.mouseX,
        this.mlx.mouseY
      );
    } else if (this.outElement) {
      p5.stroke(0);
      p5.strokeWeight(this.outLinkWeight);

      p5.noFill();
      let bx =
        (Math.abs(this.outElement.inputLinkX - this.outputLinkX) * 2) / 3;
      let by =
        (Math.abs(this.outElement.inputLinkY - this.outputLinkY) * 2) / 3;
      p5.bezier(
        this.outputLinkX,
        this.outputLinkY,
        this.outputLinkX + bx * this.outputLinkCtrlX,
        this.outputLinkY + by * this.outputLinkCtrlY,
        this.outElement.inputLinkX + bx * this.outElement.inputLinkCtrlX,
        this.outElement.inputLinkY + by * this.outElement.inputLinkCtrlY,
        this.outElement.inputLinkX,
        this.outElement.inputLinkY
      );
    }
    p5.pop();
  }

  drawOutputLink(p5) {
    if (this.mlx.maximizedElement) {
      return;
    }
    if (this.mlx.fullScreenElement == this) {
      return;
    }
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.fill(this.mlx.getLinkColor(this.outType));
    p5.ellipse(
      this.outputLinkX,
      this.outputLinkY,
      this.mlx.mlxLinkSize,
      this.mlx.mlxLinkSize,
      0
    );
  }

  drawInputLink(p5) {}

  polygon(x, y, radius, npoints, start_angle = 0) {
    let angle = this.p5.TWO_PI / npoints;
    let sangle = this.p5.radians(start_angle);
    this.p5.beginShape();

    for (let a = sangle; a < this.p5.TWO_PI + sangle; a += angle) {
      let sx = x + this.p5.cos(a) * radius;
      let sy = y + this.p5.sin(a) * radius;
      this.p5.vertex(sx, sy);
    }
    this.p5.endShape(this.p5.CLOSE);
  }

  resizeByMouse() {
    let nw = this.mlx.mouseX - this.x;
    let nh = this.mlx.mouseY - this.y;
    this.w = nw;
    this.h = nh;
    this.setContentSizeByElementWidth();
  }

  setContentSizeByElementWidth() {}
}

class mlxElementInput extends mlxElement {
  constructor(mlx) {
    super(mlx);
    this.type = "input";
    this.category = "Input";
    this.x = 100;
    this.y = 100;
  }

  process() {
    if (!this.ready) return false;
    if (this.busy) return false;
    if (this.alreadyRunInLoop) return true;
    return this.doProcess();
    //return true;
  }

  update() {
    super.update();

    this.updateOutputLinkPosition();
  }

  draw(p5) {
    super.draw(p5);
  }

  setContentSizeByElementWidth() {
    this.contentW = this.w - this.mlx.mlxPadding * 2;
    this.contentH = this.contentW / this.contentAspectRatio;
  }

  w2h(w) {
    return (
      (w - this.mlx.mlxPadding * 2) / this.contentAspectRatio +
      this.mlx.mlxCaptionHeight +
      this.mlx.mlxPadding * 2
    );
  }

  h2w(h) {
    return (
      (h - this.mlx.mlxCaptionHeight - this.mlx.mlxPadding * 2) *
        this.contentAspectRatio +
      this.mlx.mlxPadding * 2
    );
  }

  resizeByMouse() {
    let nw = this.mlx.mouseX - this.x;
    let nh = this.mlx.mouseY - this.y;
    let h = this.w2h(nw);
    if (h < nh) {
      this.w = this.h2w(nh);
      this.h = nh;
    } else {
      this.w = nw;
      this.h = h;
    }
    this.setContentSizeByElementWidth();
  }

  setElementSizeByContentSize() {
    this.w = this.contentW + this.mlx.mlxPadding * 2;
    this.h = this.w2h(this.w);
  }

  endFullScreen() {
    this.isFullScreen = false;
    this.mlx.showNavBar();
    this.scaleContentToSaved();
  }

  scaleContentToSaved() {
    this.x = this.saveX;
    this.y = this.saveY;
    this.w = this.saveW;
    this.h = this.saveH;
    this.mlx.mlxCaptionHeight = this.saveCaptionHeight;
    this.mlx.mlxPadding = this.savePadding;
    this.contentX = this.saveOutputX;
    this.contentY = this.saveOutputY;
    this.contentW = this.saveOutputW;
    this.contentH = this.saveOutputH;
    this.mlx.userScaleX = this.saveUserScaleX;
    this.mlx.userScaleY = this.saveUserScaleY;
    this.mlx.userScale = this.saveUserScale;
    this.mlx.userTranslateX = this.saveUserTranslateX;
    this.mlx.userTranslateY = this.saveUserTranslateY;

    this.contentScale = 1.0;
  }

  enterFullScreen() {
    this.isFullScreen = true;
    if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this.mlx.fullscreen(this);
    }

    this.mlx.hideNavBar();
    this.saveWindowStatus();
    this.scaleContentToFillSize(true);
  }

  enterMaximize() {
    this.mlx.maximizeWindow();
    this.saveWindowStatus();
    this.scaleContentToFillSize(false);
    this.mlx.maximizedElement = this;
  }

  exitMaximize() {
    this.mlx.normalizeWindow();
    this.scaleContentToSaved();
    this.mlx.maximizedElement = null;
  }

  saveWindowStatus() {
    this.saveX = this.x;
    this.saveY = this.y;
    this.saveW = this.w;
    this.saveH = this.h;
    this.saveCaptionHeight = this.mlx.mlxCaptionHeight;
    this.savePadding = this.mlx.mlxPadding;
    this.saveOutputX = this.contentX;
    this.saveOutputY = this.contentY;
    this.saveOutputW = this.contentW;
    this.saveOutputH = this.contentH;
    this.saveVideoWidth = this.videoWidth;
    this.saveVideoHeight = this.videoHeight;
    this.saveUserTranslateX = this.mlx.userTranslateX;
    this.saveUserTranslateY = this.mlx.userTranslateY;
    this.saveUserScaleX = this.mlx.userScaleX;
    this.saveUserScaleY = this.mlx.userScaleY;
    this.saveUserScale = this.mlx.userScale;
    this.mlx.userScaleX = 0;
    this.mlx.userScaleY = 0;
    this.mlx.userScale = 1.0;
    this.mlx.userTranslateX = 0;
    this.mlx.userTranslateY = 0;
  }

  scaleContentToFillSize(bFullScreen) {
    this.x = 0;
    this.y = 0;
    if (bFullScreen) {
      this.w = this.p5.displayWidth;
      this.h = this.p5.displayHeight;
      this.contentW = this.p5.displayWidth;
    } else {
      this.w = this.p5.width;
      this.h = this.p5.height;
      this.contentW = this.p5.width;
    }
    this.mlx.mlxCaptionHeight = 0;
    this.mlx.mlxPadding = 0;

    this.contentH = this.contentW / this.contentAspectRatio;
    if (bFullScreen) {
      if (this.contentH > this.p5.displayHeight) {
        this.contentH = this.p5.displayHeight;
        this.contentW = this.contentH * this.contentAspectRatio;
      }
    } else {
      if (this.contentH < this.p5.height) {
        this.contentH = this.p5.height;
        this.contentW = this.p5.height * this.contentAspectRatio;
      } else if (this.contentH > this.p5.height) {
        this.contentW = this.p5.width;
        this.contentH = this.contentW / this.contentAspectRatio;
      }
      this.contentScale = this.contentW / this.videoWidth;
    }

    if (bFullScreen) {
      this.contentX = (this.p5.displayWidth - this.contentW) / 2;
      this.contentY = (this.p5.displayHeight - this.contentH) / 2;
    } else {
      this.contentX = (this.p5.width - this.contentW) / 2;
      this.contentY = (this.p5.height - this.contentH) / 2;
    }
  }
}

class mlxElementModel extends mlxElement {
  constructor(mlx) {
    super(mlx);
    this.type = "model";
    this.category = "Model";

    this.x = 400;
    this.y = 100;
  }

  process() {
    if (!this.inElement || !this.inElement.outElement) {
      return false;
    }
    if (!this.ready) return false;
    if (this.busy) return false;
    if (this.alreadyRunInLoop) return true;
    if (!this.inElement.outputIsReady) return false;

    return this.doProcess();
  }

  update() {
    super.update();

    this.updateInputLinkPosition();
    this.updateOutputLinkPosition();
  }

  draw(p5) {
    super.draw(p5);
  }

  drawInputLink(p5) {
    if (this.mlx.maximizedElement) {
      return;
    }
    if (this.mlx.fullScreenElement == this) {
      return;
    }
    if (this.inElement) {
      p5.stroke(0);
      p5.fill(this.mlx.getLinkColor(this.inType));
      this.polygon(
        this.inputLinkX,
        this.inputLinkY,
        this.mlx.mlxLinkSize - 2,
        3,
        this.inputLinkAngle
      );
    }
  }
}

class mlxElementOutput extends mlxElement {
  constructor(mlx) {
    super(mlx);
    this.type = "output";
    this.category = "Output";

    this.x = 700;
    this.y = 100;
  }

  process() {
    if (!this.inElement || !this.inElement.outElement) return false;
    if (!this.ready) return false;
    if (this.busy) return false;
    if (this.alreadyRunInLoop) return true;
    if (!this.inElement.outputIsReady) return false;

    return this.doProcess();
  }

  update() {
    super.update();

    this.updateInputLinkPosition();
    this.updateOutputLinkPosition();
  }

  draw(p5) {
    super.draw(p5);
  }

  drawInputLink(p5) {
    if (this.mlx.fullScreenElement == this) {
      return;
    }
    if (this.inElement) {
      p5.stroke(0);
      p5.fill(this.mlx.getLinkColor(this.inType));
      this.polygon(
        this.inputLinkX,
        this.inputLinkY,
        this.mlx.mlxLinkSize - 2,
        3,
        this.inputLinkAngle
      );
    }
  }

  endFullScreen() {
    this.x = this.saveX;
    this.y = this.saveY;
    this.w = this.saveW;
    this.h = this.saveH;
    this.mlx.mlxCaptionHeight = this.saveCaptionHeight;
    this.mlx.mlxPadding = this.savePadding;
    this.contentX = this.saveOutputX;
    this.contentY = this.saveOutputY;
    this.contentW = this.saveOutputW;
    this.contentH = this.saveOutputH;
  }

  enterFullScreen() {
    this.mlx.fullscreen(this);

    this.saveX = this.x;
    this.saveY = this.y;
    this.saveW = this.w;
    this.saveH = this.h;
    this.saveCaptionHeight = this.mlx.mlxCaptionHeight;
    this.savePadding = this.mlx.mlxPadding;
    this.saveOutputX = this.contentX;
    this.saveOutputY = this.contentY;
    this.saveOutputW = this.contentW;
    this.saveOutputH = this.contentH;
    this.saveVideoWidth = this.videoWidth;
    this.saveVideoHeight = this.videoHeight;
    this.x = 0;
    this.y = 0;
    this.w = this.p5.displayWidth;
    this.h = this.p5.displayHeight;
    this.mlx.mlxCaptionHeight = 0;
    this.mlx.mlxPadding = 0;

    this.contentW = this.p5.displayWidth;
    this.contentH = this.contentW / this.contentAspectRatio;
    if (this.contentH > this.p5.displayHeight) {
      this.contentH = this.p5.displayHeight;
      this.contentW = this.contentH * this.contentAspectRatio;
    }

    this.contentX = (this.p5.displayWidth - this.contentW) / 2;
    this.contentY = (this.p5.displayHeight - this.contentH) / 2;
  }
}

//Art - Lock canvas
class mlxElementLocakableOutput extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.lockCanvasToThisElement = false;
    this.prevCanvasWidth = -1;
    this.prevCanvasHeight = -1;
  }

  draw(p5) {
    super.draw(p5);
    this.adjustThisElementToLockCanvas();
  }

  adjustThisElementToLockCanvas() {
    if (!this.lockCanvasToThisElement) return;
    var change = false;
    if (this.prevCanvasWidth != this.p5.width) {
      this.prevCanvasWidth = this.p5.width;
      change = true;
    }
    if (this.prevCanvasHeight != this.p5.height) {
      this.prevCanvasHeight = this.p5.height;
      change = true;
    }
    if (!change) return;
    //canvas size change
    //recalculate UI to match new canvas
    this.canvasChanged();
  }

  removeFocus() {
    this.prevCanvasWidth = -1;
    this.prevCanvasHeight = -1;
    this.lockCanvasToThisElement = false;
    this.mlx.showNavBar();
  }

  //override
  canvasChanged() {
    //calculate to fit at center of frame
    this.mlx.userTranslateX = 0;
    this.mlx.userTranslateY = 0;
    //calculate zoom scale
    var contentWidth = this.w - this.mlx.mlxPadding * 2;
    var contentHeight =
      this.h - this.mlx.mlxCaptionHeight - this.mlx.mlxPadding * 2;
    var scale = this.p5.width / contentWidth;
    var scaleH = this.p5.height / contentHeight;
    if (scale > scaleH) scale = scaleH;
    this.mlx.userScaleX = 0;
    this.mlx.userScaleY = 0;
    this.mlx.userScale = scale;
    this.x = (this.p5.width - this.w * scale) / 2 / scale;
    this.y = -(this.mlx.mlxCaptionHeight + this.mlx.mlxPadding);
    //console.log(this.mlx.userScale);
  }

  //--------------------
  //save load
  save() {
    var data = super.save();
    data.lockCanvasToThisElement = this.lockCanvasToThisElement;
    return data;
  }

  load(data) {
    super.load(data);
    if (data.lockCanvasToThisElement) {
      this.lockCanvasToThisElement = data.lockCanvasToThisElement;
      this.mlx.hideNavBar();
      window.dispatchEvent(new Event("resize"));
      this.mlx.focusedElement = this;
    }
  }
}

class mlxLabel extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "Label";
    this.title = "Label";

    this.inType = "results";
    this.outType = "results";

    this.h = 60;
    this.text = "";
    this.size = 0;
    this.createElementMenu();
    this.resizable = true;
    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      this.mlx.mlxPadding,
      this.mlx.mlxCaptionHeight + 2,
      this.w - this.mlx.mlxPadding * 2,
      this.h - 10 - this.mlx.mlxCaptionHeight
    );
    this.onScreenDisplay = false;
    this.confidence80 = false;
    this.ready = true;
  }

  resizeByMouse() {
    super.resizeByMouse();
  }

  setContentSizeByElementWidth() {
    let w = this.w - this.mlx.mlxPadding * 2;
    let h = this.h - 5 - this.label.yy;
    this.label.resize(w, h);
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCheckedMenu("Confidence > 80%", this.confidence80, (ui, value) => {
      this.hideMenu();
      this.confidence80 = value;
    });
    menu.addCheckedMenu(
      "On Screen Display",
      this.onScreenDisplay,
      (ui, value) => {
        //console.log('filp command');
        this.hideMenu();
        this.onScreenDisplay = value;
        if (this.onScreenDisplay) {
          this.mlx.labelElement = this;
        } else {
          this.mlx.labelElement = null;
          this.mlx.statusOut("Copyright © 2020 Art & Technology Co.,Ltd.");
        }
      }
    );
    menu.addSeparator();
    menu.addSelectMenu(["Small", "Medium", "Large"], this.size, (ui, value) => {
      //console.log('selected', value);
      this.size = value;
      if (this.size == 0) {
        this.label.setFontSize(14);
      } else if (this.size == 1) {
        this.label.setFontSize(24);
      } else if (this.size == 2) {
        this.label.setFontSize(48);
      }
      this.hideMenu();
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    this.results = this.inElement.output;
    if (Array.isArray(this.results) && this.results.length > 0) {
      if (this.results[0].label) {
        if (this.results[0].confidence) {
          if (!this.confidence80 || this.results[0].confidence > 0.8) {
            this.text = `${this.results[0].label} (${(
              this.results[0].confidence * 100
            ).toFixed(2)}%)`;
          } else {
            this.text = "";
          }
        } else {
          this.text = this.results[0].label;
        }
        this.label.setText(this.text);
      }
    } else {
      if (this.results.value) {
        this.text = this.results.value;
        this.label.setText(this.text);
      } else if (this.results.label) {
        if (this.results.confidence)
          this.text = `${this.results.label} (${(
            this.results.confidence * 100
          ).toFixed(2)}%)`;
        else this.text = this.results.label;
        this.label.setText(this.text);
      }
    }

    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();

    if (!this.inElement || !this.inElement.outElement) {
      this.label.setText("");
    }
  }
}

class mlxOscillator extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "Oscillator";
    this.title = "Oscillator";

    this.inType = "results";
    this.outType = "results";

    this.h = 60;
    this.text = "";
    this.createElementMenu();
    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.onScreenDisplay = false;
    this.currentNote = "";

    this.freq = {
      A: 440,
      B: 493.88,
      C: 523.25,
      D: 587.33,
      E: 659.26,
      F: 698.46,
      G: 783.99,
      H: 880,
    };

    if (!mlxOsc) {
      mlxOsc = new p5.Oscillator();
    }
    mlxOsc.setType("sine");
    mlxAmp = 0;
    mlxOsc.start();
    mlxOsc.amp(mlxAmp);

    this.ready = true;
  }

  doProcess() {
    this.results = this.inElement.output;
    if (Array.isArray(this.results)) {
      if (this.results[0].label) {
        this.text = this.results[0].label;
        this.label.setText(this.text);
        if (!this.freq[this.text]) {
          //mlxAmp = 0;
          //mlxOsc.amp(mlxAmp);
        } else {
          if (mlxAmp == 0) {
            mlxOsc.freq(this.freq[this.text]);
            mlxAmp = 5;
            mlxOsc.amp(mlxAmp);
          }
        }
      }
    } else {
      if (this.results.value) {
        this.text = this.results.value;
        this.label.setText(this.text);
      } else if (this.results.label) {
        if (this.results.confidence)
          this.text = `${this.results.label} (${(
            this.results.confidence * 100
          ).toFixed(2)}%)`;
        else this.text = this.results.label;
        this.label.setText(this.text);
        if (!this.freq[this.text]) {
          //mlxAmp = 0;
          //mlxOsc.amp(mlxAmp);
        } else {
          if (mlxAmp == 0) {
            mlxOsc.freq(this.freq[this.text]);
            mlxAmp = 5;
            mlxOsc.amp(mlxAmp);
          }
        }
      }
    }

    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();
    if (mlxAmp > 0) {
      mlxAmp -= 0.1;
      if (mlxAmp < 1) mlxAmp = 0;
      mlxOsc.amp(mlxAmp);
    }

    if (!this.inElement || !this.inElement.outElement) {
      this.label.setText("");
    }
  }

  remove() {
    mlxAmp = 0;
    mlxOsc.amp(mlxAmp);
  }
}

class mlxConsoleLog extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "ConsoleLog";
    this.title = "Console Log";

    this.inType = "all";
    this.outType = "results";

    this.h = 60;
    this.text = "";
    this.createElementMenu();
    this.label = this.mlx.createLabel(
      this,
      "Ready",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.onScreenDisplay = false;

    this.ready = true;
  }

  doProcess() {
    this.busy = false;
    this.outputIsReady = true;
    this.output = this.inElement.output;
    console.log(this.output);
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();

    if (!this.inElement || !this.inElement.outElement) {
    }
  }

  draw(p5) {
    super.draw(p5);
  }
}

class mlxSpeech extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "Speech";
    this.title = "Speech";

    this.inType = "results";
    this.outType = "results";

    this.h = 60;
    this.text = "";
    this.speechCount = 0;
    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );

    this.lang = 0;
    this.language = "en";
    this.speech = new p5.Speech();
    this.label.setText("Speech ready.");
    this.createElementMenu();
    this.speech.onEnd = () => {
      if (this.inElement) {
        this.inElement.outputIsReady = false;
      }
      this.speechCount--;
      if (this.speechCount == 0) {
        this.busy = false;
        this.outputIsReady = true;
      }
    };
    this.speech.onLoad = () => {
      this.label.setText("Speech is ready");
      this.isReady = true;
      //this.speech.listVoices();
    };
    this.speech.setLang(this.language);
    if (this.language == "th") {
      this.speech.setVoice("Kanya");
    } else {
      this.speech.setVoice("Daniel");
    }
    this.speech.setVoice(63);

    this.ready = true;
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addSelectMenu(["English", "Thai"], this.lang, (ui, value) => {
      this.lang = value;
      if (value == 0) {
        this.language = "en";
      } else {
        this.language = "th";
      }
      this.speech.setLang(this.language);
      if (this.language == "th") {
        this.speech.setVoice("Kanya");
      } else {
        this.speech.setVoice("Daniel");
      }
      this.hideMenu();
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    this.results = this.inElement.output;
    if (Array.isArray(this.results)) {
      if (this.results[0].label) {
        this.text = this.results[0].label;
        this.label.setText(this.text);
      }
    } else {
      if (this.results.value) {
        this.text = this.results.value;
        this.label.setText(this.text);
      } else if (this.results.label) {
        if (this.results.confidence)
          this.text = `${this.results.label} (${(
            this.results.confidence * 100
          ).toFixed(2)}%)`;
        else this.text = this.results.label;
        this.label.setText(this.text);
      }
    }
    if (this.text && this.speechCount == 0) {
      this.speech.speak(this.text);
      this.speechCount++;
    }

    //this.busy = false;
    //this.outputIsReady = true;
    this.output = this.inElement.output;
    this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();

    if (!this.inElement || !this.inElement.outElement) {
      this.text = "";
      this.label.setText("");
    }
  }
}

// Audio Input
class mlxAudioInput extends mlxElementInput {
  constructor(mlx) {
    super(mlx);

    this.category = "Input";
    this.type = "Audio";
    this.title = "Audio Input";

    this.inType = "none";
    this.outType = "audio";

    this.createElementMenu();

    this.mic = new p5.AudioIn();
    this.mic.start();

    this.h = 100;

    this.icon = this.mlx.createImage(
      this,
      "assets/iconMicrophone.jpg",
      1,
      this.mlx.mlxCaptionHeight + 1,
      198,
      44
    );
    this.label = this.mlx.createLabel(
      this,
      "Ready",
      18,
      this.mlx.mlxCaptionHeight + 48,
      this.w - 20,
      24
    );

    this.ready = true;
    this.busy = false;
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    if (this.mic) {
      this.busy = false;
      this.output = this.mic;
      this.outputIsReady = true;
      this.alreadyRunInLoop = true;
      return true;
    }
    return false;
  }

  update() {
    super.update();
  }

  remove() {
    if (this.mic) {
      this.mic.stop();
      this.mic = null;
    }
    super.remove();
  }
}

// Audio Output
class mlxSoundAmplitude extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "SoundAmplitude";
    this.title = "Sound Amplitude";

    this.inType = "audio";
    this.outType = "audio";

    this.amplitude = new Array(60);
    this.ampIndex = 0;
    for (var i = 0; i < 60; i++) {
      this.amplitude[i] = 0;
    }

    //this.w = 300;
    //this.h = 100;
    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = 240;
    this.contentH = 100;
    this.w = this.contentW + this.mlx.mlxPadding * 2;
    this.h =
      this.contentH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;
    this.text = "";
    this.createElementMenu();
    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.label.setText("Sound Amplitude ready.");
    this.ready = true;
    this.busy = false;
    this.outputIsReady = false;
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    if (this.inElement && this.inElement.outType == "audio") {
      this.busy = true;
      this.output = this.inElement.output;
      this.outputIsReady = true;
    } else {
      this.outputIsReady = false;
    }

    this.busy = false;
    if (this.inElement) this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();
    if (this.inElement && this.inElement.outType == "audio") {
      this.amplitude[this.ampIndex] = this.inElement.output.getLevel();
      //console.log( this.amplitude[this.ampIndex] );
      this.ampIndex = this.ampIndex + 1;
      if (this.ampIndex >= 60) {
        this.ampIndex = 0;
      }
    }
  }

  draw(p5) {
    super.draw(p5);
    var x = 0;
    p5.noFill();
    p5.stroke(20);
    let xx = this.x + this.contentX;
    let yy = this.y + this.contentY + this.contentH;
    for (var i = this.ampIndex; i < 60; i++) {
      p5.line(xx + x, yy, xx + x, yy - this.amplitude[i] * 512);
      x += 4;
    }
    for (var i = 0; i < this.ampIndex; i++) {
      p5.line(xx + x, yy, xx + x, yy - this.amplitude[i] * 512);
      x += 4;
    }
  }
}

// Audio Output
class mlxFFTSpectrum extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "FFT";
    this.title = "FFT Spectrum";

    this.inType = "audio";
    this.outType = "tensor";

    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = 512;
    this.contentH = 150;
    this.w = this.contentW + this.mlx.mlxPadding * 2;
    this.h =
      this.contentH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;
    this.text = "";
    this.createElementMenu();
    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.fft = new p5.FFT(0.8, 512);
    this.label.setText("FFT ready.");
    this.ready = true;
    this.busy = false;
    this.outputIsReady = false;
    this.fftMode = 1;
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Amplitude", (ui) => {
      this.hideMenu();
      this.fftMode = 0;
    });
    menu.addCommand("Analysis", (ui) => {
      this.hideMenu();
      this.fftMode = 1;
    });
    menu.addCommand("Spectrogram", (ui) => {
      this.hideMenu();
      this.fftMode = 2;
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    if (this.inElement && this.inElement.outType == "audio") {
      this.busy = true;
      this.fft.setInput(this.inElement.output);
      if (this.fftMode == 1) {
        this.spectrum = this.fft.analyze();
        this.output = this.spectrum;
        this.outputIsReady = true;
      }
    } else {
      this.outputIsReady = false;
    }

    this.busy = false;
    if (this.inElement) this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();
  }

  draw(p5) {
    super.draw(p5);
    if (this.inElement && this.inElement.outType == "audio") {
      if (this.fftMode == 0) {
        this.spectrum = this.fft.waveform();
        let height = this.contentH;
        p5.beginShape();
        p5.noFill();
        p5.stroke(20);
        let xx = this.x + this.contentX;
        let yy = this.y + this.contentY;
        for (let i = 0; i < this.spectrum.length; i++) {
          var vx = xx + i * 2;
          var vy = yy + p5.map(this.spectrum[i], -1, 1, height, 0);
          p5.vertex(vx, vy);
        }
        p5.endShape();
      } else if (this.fftMode == 1 && this.spectrum) {
        //spectrum = this.fft.analyze();
        let height = this.contentH;
        let xx = this.x + this.contentX;
        let yy = this.y + this.contentY;
        p5.push();
        p5.colorMode(p5.HSB, 255);
        for (var i = 0; i < this.spectrum.length; i++) {
          var vx = xx + i;
          var vy = yy + p5.map(this.spectrum[i], 0, 255, height, 0);
          p5.stroke(this.spectrum[i] * 1.5, 255, 255);
          p5.line(vx, yy + height, vx, vy);
        }
        p5.pop();
      } else {
        //spectrum = this.fft.analyze();
      }
    }
  }
}
class mlxNatsSoundTensor extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "NatsSoundTensor";
    this.title = "Nat's Sound Tensor";

    this.inType = "tensor";
    this.outType = "tensor";

    this.wordDetected = false;
    this.wordDuration = 0;

    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = 256;
    this.contentH = 128;
    this.w = this.contentW + this.mlx.mlxPadding * 2;
    this.h =
      this.contentH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;
    this.text = "";
    this.createElementMenu();

    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.label.hidden = true;
    this.ready = true;
    this.busy = false;
    this.outputIsReady = false;
    this.detectWord = true;
    this.soundTensor = new Array(128);
    for (var i = 0; i < 128; i++) {
      this.soundTensor[i] = 0;
    }
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    if (
      this.inElement &&
      this.inElement.outType == "tensor" &&
      this.inElement.outputIsReady
    ) {
      this.busy = true;
      this.spectrum = this.inElement.output;
      this.output = this.soundTensor;
    } else {
      this.outputIsReady = false;
    }
    if (!this.detectWord) {
      this.outputIsReady = true;
    }

    this.busy = false;
    if (this.inElement) this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();
  }

  draw(p5) {
    super.draw(p5);
    if (this.inElement && this.inElement.outType == "tensor" && this.spectrum) {
      var t = 0;
      for (var i = 0; i < 128; i++) {
        t += this.spectrum[i];
      }
      if (this.detectWord) {
        if (t > 1500 && !this.wordDetected) {
          this.wordDetected = true;
          for (var i = 0; i < 128; i++) {
            this.soundTensor[i] = 0;
          }
        }
        if (this.wordDetected) {
          if (this.wordDuration > 64) {
            this.wordDetected = false;
            this.wordDuration = 0;
          } else if (this.wordDuration > 43) {
            this.outputIsReady = true;
            console.log(this.soundTensor);
          } else {
            // draw
            for (var i = 0; i < 128; i++) {
              this.soundTensor[i] += this.spectrum[i];
            }
          }
          this.wordDuration++;
        }
      } else {
        //this.grx2.image( this.grx, 0, 0 );
      }
      let xx = this.x + this.contentX;
      let yy = this.y + this.contentY;
      let height = this.contentH;
      for (var i = 0; i < 128; i++) {
        var vx = xx + i * 2;
        var vy = yy + p5.map(this.soundTensor[i], 0, 255 * 15, height, 0);
        p5.stroke(0);
        p5.line(vx, yy + height, vx, vy);
      }
    }
  }
}

class mlxSpectrogram extends mlxElementOutput {
  constructor(mlx) {
    super(mlx);
    this.category = "Output";
    this.type = "Spectrogram";
    this.title = "Spectrogram";

    this.inType = "tensor";
    this.outType = "image";

    this.wordDetected = false;
    this.wordDuration = 0;

    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = 256;
    this.contentH = 256;
    this.w = this.contentW + this.mlx.mlxPadding * 2;
    this.h =
      this.contentH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;
    this.text = "";
    this.createElementMenu();

    this.grx = mlx.p5.createGraphics(256, 256);
    this.grx.background(0);
    this.grx.noSmooth();
    this.grx.colorMode(p5.HSB, 255);

    this.grx2 = mlx.p5.createGraphics(256, 256);
    this.grx2.background(0);
    this.grx2.noSmooth();
    this.grx2.colorMode(p5.HSB, 255);

    this.label = this.mlx.createLabel(
      this,
      "Loading...",
      18,
      this.mlx.mlxCaptionHeight + 5,
      this.w - 20,
      24
    );
    this.label.hidden = true;
    this.ready = true;
    this.busy = false;
    this.outputIsReady = false;
    this.detectWord = false;
  }

  createElementMenu() {
    let menu = this._createMenu();
    menu.addCheckedMenu("Detect Word", this.detectWord, (ui, value) => {
      //console.log('filp command');
      this.hideMenu();
      this.detectWord = value;
    });
    menu.addSeparator();
    menu.addCommand("Delete", (ui) => {
      this.hideMenu();
      this.mlx.removeElement(this);
    });
  }

  doProcess() {
    if (
      this.inElement &&
      this.inElement.outType == "tensor" &&
      this.inElement.outputIsReady
    ) {
      this.busy = true;
      this.spectrum = this.inElement.output;
      this.output = this.grx2;
    } else {
      this.outputIsReady = false;
    }
    if (!this.detectWord) {
      this.outputIsReady = true;
    }

    this.busy = false;
    if (this.inElement) this.inElement.outputIsReady = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  update() {
    super.update();
  }

  draw(p5) {
    super.draw(p5);
    if (this.inElement && this.inElement.outType == "tensor" && this.spectrum) {
      //spectrum = this.fft.analyze();

      this.grx.image(this.grx, -6, 0);
      this.grx.colorMode(p5.HSB, 255);

      var t = 0;
      for (var i = 0; i < 128; i++) {
        t += this.spectrum[i];
        var c = this.spectrum[i] * 1.5;
        this.grx.fill(c, 255, 255);
        this.grx.noStroke();
        this.grx.rect(250, 255 - i * 2 - 1, 6, 2);
      }
      if (this.detectWord) {
        if (t > 4500 && !this.wordDetected) {
          this.wordDetected = true;
        }
        if (this.wordDetected) {
          if (this.wordDuration > 64) {
            this.wordDetected = false;
            this.wordDuration = 0;
          } else if (this.wordDuration > 43) {
            this.outputIsReady = true;
          } else {
            this.grx2.image(this.grx, 0, 0);
          }
          this.wordDuration++;
        }
      } else {
        this.grx2.image(this.grx, 0, 0);
      }
    }
    let xx = this.x + this.contentX;
    let yy = this.y + this.contentY;
    if (this.detectWord) {
      p5.image(this.grx2, xx, yy);
    } else {
      p5.image(this.grx, xx, yy);
    }
  }
}

// Audio Input
class mlxTextInput extends mlxElementInput {
  constructor(mlx) {
    super(mlx);

    console.log("TextInput");

    this.category = "Input";
    this.type = "TextInput";
    this.title = "Text Input";

    this.inType = "none";
    this.outType = "results";

    this.createElementMenu();
    this.needMouse = true;

    this.resizable = false;
    this.contentX = this.mlx.mlxPadding;
    this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
    this.contentW = 200;
    this.contentH = 100;
    this.contentAspectRatio = this.contentW / this.contentH;

    this.divX = this.contentX;
    this.divY = this.contentY;
    this.divW = this.contentW;
    this.divH = this.contentH - 24;

    this.setElementSizeByContentSize();

    this.div = mlx.p5.createDiv();
    this.div.size(this.divW, this.divH);
    this.div.position(
      this.x + this.divX,
      this.y + this.divY + this.mlx.mlxNavBarHeight
    );
    this.div.style("background-color", "#FFFFFF");
    this.div.style("text-align", "left");
    this.div.style("font-size", "x-small");

    this.textArea = document.createElement("TEXTAREA");
    this.div.elt.appendChild(this.textArea);
    this.textArea.style.Width = "100%";
    this.textArea.style.height = "100%";
    this.textArea.style.resize = "none";
    this.textArea.cols = 30;
    this.divW = this.textArea.clientWidth + 2;
    this.div.size(this.divW, this.divH);
    this.contentW = this.divW;
    this.contentAspectRatio = this.contentW / this.contentH;
    this.setElementSizeByContentSize();

    this.label = this.mlx.createLabel(
      this,
      "Ready",
      this.mlx.mlxPadding,
      this.divY + this.divH + 2,
      this.w - this.mlx.mlxPadding * 2,
      24
    );

    this.okButton = this.mlx.createButton(
      this,
      "OK",
      () => {
        this.output = {
          label: this.textArea.value,
        };
        console.log("OK");
        this.outputIsReady = true;
      },
      this.w - 60 - this.mlx.mlxPadding,
      this.h - 28,
      60,
      22
    );
    this.okButton.border = true;

    this.outputIsReady = false;
    this.ready = true;
    this.busy = false;
  }

  inactivateUI() {
    this.div.style("display", "none");
  }

  activateUI() {
    this.div.style("display", "block");
  }

  doProcess() {
    this.busy = false;
    this.alreadyRunInLoop = true;
    return true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    let xx = this.x + this.divX;
    let yy = this.y + this.divY + this.mlx.mlxNavBarHeight / this.mlx.userScale;

    //xx = xx / this.userScale - this.userScaleX / this.userScale + this.userScaleX - this.userTranslateX;
    //yy = yy / this.userScale - this.userScaleY / this.userScale + this.userScaleY - this.userTranslateY;\

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
    this.div.size(
      this.divW * this.mlx.userScale,
      this.divH * this.mlx.userScale
    );

    this.label.yy = this.divY + this.divH + 2;
    this.label.resize(this.w - this.mlx.mlxPadding * 2, this.label.h);
  }

  update() {
    super.update();
    this.setPosition(this.x, this.y);
  }
}

module.exports = {
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
};
