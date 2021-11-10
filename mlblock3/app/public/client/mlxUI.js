let _p5
let _mlx
function mlxUI_Init(mlx, p5) {
  _p5 = p5
  _mlx = mlx
  console.log('>', _mlx, mlx)
}

class mlxUI {
  constructor(parent = null, x = 0, y = 0, w = 100, h = 100) {
    this.xx = x
    this.yy = y
    this.w = w
    this.h = h
    this.children = []
    this.p5 = _p5
    this.hidden = false
    this.alwaysOnTop = false
    this.text = null
    this.highlight = false
    this.colorBackground = this.p5.color(240)

    this.setParent(parent)
  }

  setText(text) {
    this.text = text
  }

  update() {
    if (this.parent) {
      this.x = this.parent.x + this.xx
      this.y = this.parent.y + this.yy
    } else {
      this.x = this.xx
      this.y = this.yy
    }
  }

  isHitElement(x, y) {
    if (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h) {
      return true
    }
    return false
  }

  _update() {
    this.update()
    this._updateChildren()
  }

  _updateChildren() {
    for (var i in this.children) {
      let child = this.children[i]
      child._update()
    }
  }

  _draw(p5) {
    if (!this.hidden) {
      this.draw(p5)
      this._drawChildren(p5)
    }
  }

  draw(p5) {}

  _drawChildren(p5) {
    for (var i in this.children) {
      let child = this.children[i]
      child._draw(p5)
    }
  }

  _clearParent() {
    if (this.parent) {
      let i = this.parent.children.indexOf(this)
      if (i >= 0) {
        this.parent.children.splice(i, 1)
      }
      this.parent = null
    }
  }

  setParent(parent) {
    if (this.parent) {
      if (this.parent == parent) return
      else {
        this._clearParent()
      }
    }
    this.parent = parent
    if (this.parent) {
      this.parent.children.push(this)
      this.p5 = this.parent.p5
    }
  }

  remove() {
    if (this.parent) {
    }
  }

  mouseMoved() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      this.highlight = true
    } else {
      this.highlight = false
    }
    for (var i in this.children) {
      let child = this.children[i]
      if (child.hidden == false) child.mouseMoved()
    }
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      for (var i in this.children) {
        let child = this.children[i]
        if (!child.hidden) {
          if (child.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
            if (!child.mousePressed()) return false
          }
        }
      }
    }
    return true
  }

  mouseDragged() {
    return true
  }

  mouseReleased() {
    return true
  }
}

class uiFrame extends mlxUI {
  constructor(parent, x, y, w, h) {
    super(parent, x, y, w, h)
  }

  draw(p5) {
    this.p5.fill(255)
    this.p5.stroke(0)
    this.p5.strokeWeight(1)
    this.p5.rect(this.x, this.y, this.w, this.h)
  }
}

class uiHorizontalSlider extends mlxUI {
  constructor(parent, cb, value, min, max, x, y, w, h) {
    super(parent, x, y, w, h)
    this.callback = cb
    this.value = value
    this.min = min
    this.max = max
    this.decimal = 0
  }

  draw(p5) {
    this.p5.fill(128)
    this.p5.stroke(128)
    this.p5.strokeWeight(2)
    let h2 = (this.h - 14) / 2
    this.p5.line(this.x + h2, this.y + h2, this.x + this.w - h2, this.y + h2)
    this.p5.strokeWeight(1)
    this.drawKnob(p5)
  }

  drawKnob(p5) {
    let h2 = (this.h - 14) / 2
    let x = this.p5.map(this.value, this.min, this.max, this.x + h2, this.x + this.w - h2)
    this.p5.stroke(0)
    this.p5.ellipse(x, this.y + h2, this.h - 14, this.h - 14)
    this.p5.noStroke()
    this.p5.fill(64)
    this.p5.textAlign(this.p5.CENTER, this.p5.TOP)
    this.p5.text(`${this.value.toFixed(this.decimal)}`, x, this.y + this.h - 14)
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      let h2 = this.h / 2
      this.value = this.p5.map(_mlx.mouseX, this.x + h2, this.x + this.w - h2, this.min, this.max)
      if (this.max - this.min > 1) {
        this.value = this.p5.floor(this.value)
      }

      this.value = this.p5.constrain(this.value, this.min, this.max)
      if (this.callback) {
        this.callback(this.value)
      }
      return false
    }
    return true
  }

  mouseDragged() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      let h2 = this.h / 2
      this.value = this.p5.map(_mlx.mouseX, this.x + h2, this.x + this.w - h2, this.min, this.max)
      if (this.max - this.min > 1) {
        this.value = this.p5.floor(this.value)
      }
      this.value = this.p5.constrain(this.value, this.min, this.max)
      if (this.callback) {
        this.callback(this.value)
      }
    }
  }
}

class uiVerticalSlider extends mlxUI {
  constructor(parent, cb, value, min, max, x, y, w, h) {
    super(parent, x, y, w, h)
    this.callback = cb
    this.value = value
    this.min = min
    this.max = max
  }

  draw(p5) {
    this.p5.fill(128)
    this.p5.stroke(128)
    this.p5.strokeWeight(2)
    let w2 = this.w / 2
    this.p5.line(this.x + w2, this.y + w2, this.x + w2, this.y + this.h - w2)
    this.p5.strokeWeight(1)
    this.drawKnob(p5)
  }

  drawKnob(p5) {
    let w2 = this.w / 2
    let y = this.p5.map(this.value, this.min, this.max, this.y + this.h - w2, this.y + w2)
    this.p5.stroke(0)
    this.p5.ellipse(this.x + w2, y, this.w, this.w)
    this.p5.noStroke()
    this.p5.fill(64)
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER)
    this.p5.text(`${this.value.toFixed(2)}`, this.x + this.w + 10, y - 4)
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      let w2 = this.w / 2
      this.value = this.p5.map(_mlx.mouseY, this.y + this.h - w2, this.y + w2, this.min, this.max)
      if (this.max - this.min > 1) {
        this.value = this.p5.floor(this.value)
      }

      this.value = this.p5.constrain(this.value, this.min, this.max)
      if (this.callback) {
        this.callback(this.value)
      }
      return false
    }
    return true
  }

  mouseDragged() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      let w2 = this.w / 2
      this.value = this.p5.map(_mlx.mouseY, this.y + this.h - w2, this.y + w2, this.min, this.max)
      if (this.max - this.min > 1) {
        this.value = this.p5.floor(this.value)
      }

      this.value = this.p5.constrain(this.value, this.min, this.max)
      if (this.callback) {
        this.callback(this.value)
      }
    }
  }
}

class uiTextInput extends mlxUI {
  constructor(parent, text, type, cb, x, y, w, h) {
    super(parent, x, y, w, h)
    this.callback = cb
    if (type == null) {
      type = 'text'
    }
    this.input = this.p5.createInput(text, type)
    this.input.size(w)
    this.setText(text)
  }
  getText() {
    return this.input.value()
  }
  setText(text) {
    this.input.value(text)
  }
  draw(p5) {
    //console.log("draw ...");
    let xx = this.x
    let yy = this.y
    xx =
      xx +
      this.parent.mlx.userTranslateX +
      this.parent.mlx.userScaleX / this.parent.mlx.userScale -
      this.parent.mlx.userScaleX
    yy =
      yy +
      this.parent.mlx.userTranslateY +
      this.parent.mlx.userScaleY / this.parent.mlx.userScale -
      this.parent.mlx.userScaleY
    this.input.position(xx, yy)
    //this.p5.image(this.input.elt, this.x, this.y);
  }
}

class uiRadioBox extends mlxUI {
  constructor(parent, options, cb, x, y, w, h) {
    super(parent, x, y, w, h)
    this.callback = cb
    this.radio = this.p5.createRadio()
    for (let i = 0; i < options.length; i++) {
      this.radio.option(i, options[i])
    }
    this.radio.style('width', w + 'px')
    this.radio.style('height', h + 'px')
    this.radio.position(x, y)
    this.radio.selected('0')
  }
  getValue() {
    return this.radio.value()
  }
  setValue(val) {
    this.radio.selected(val)
  }
  draw(p5) {
    let xx = this.x
    let yy = this.y
    xx =
      xx +
      this.parent.mlx.userTranslateX +
      this.parent.mlx.userScaleX / this.parent.mlx.userScale -
      this.parent.mlx.userScaleX
    yy =
      yy +
      this.parent.mlx.userTranslateY +
      this.parent.mlx.userScaleY / this.parent.mlx.userScale -
      this.parent.mlx.userScaleY
    this.radio.position(xx, yy)
  }
}

class uiSelect extends mlxUI {
  constructor(parent, options, cb, x, y, w, h) {
    super(parent, x, y, w, h)
    this.callback = cb
    this.select = this.p5.createSelect()
    for (let i = 0; i < options.length; i++) {
      this.select.option(options[i], i)
    }
    this.select.style('width', w + 'px')
    this.select.style('height', h + 'px')
    this.select.position(x, y)
    this.select.selected('0')
  }
  getValue() {
    return this.select.value()
  }
  setValue(val) {
    this.select.selected(val)
  }
  draw(p5) {
    let xx = this.x
    let yy = this.y
    xx =
      xx +
      this.parent.mlx.userTranslateX +
      this.parent.mlx.userScaleX / this.parent.mlx.userScale -
      this.parent.mlx.userScaleX
    yy =
      yy +
      this.parent.mlx.userTranslateY +
      this.parent.mlx.userScaleY / this.parent.mlx.userScale -
      this.parent.mlx.userScaleY
    this.select.position(xx, yy)
  }
}

class uiCommand extends mlxUI {
  constructor(parent, text, cb, x, y, w, h) {
    super(parent, x, y, w, h)
    this.setText(text)
    this.callback = cb
    this.border = false
  }

  draw() {
    this.p5.noStroke()
    const marginTop = 5
    if (this.highlight) {
      this.p5.fill(192, 192, 192)
      this.p5.rect(this.x, this.y, this.w, this.h)
    }

    if (this.border) {
      this.p5.fill(210)
      this.p5.stroke(192)
      this.p5.rect(this.x + 2, this.y + 2, this.w - 4, this.h - 4, 10, 10, 10, 10)

      this.p5.fill(0)
      this.p5.textSize(14)
      this.p5.textAlign(this.p5.CENTER, this.p5.TOP)
      this.p5.text(this.text, this.x + this.w / 2, this.y + marginTop)
    } else {
      this.p5.fill(0)
      this.p5.textSize(14)
      this.p5.textAlign(this.p5.LEFT, this.p5.TOP)
      this.p5.text(this.text, this.x + 20, this.y + marginTop)
    }
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      //console.log("Pressed");
      //alert("OK1");
      if (this.callback) {
        this.callback(this)
      }
      return false
    }
    return true
  }
}

class uiDropdown extends uiCommand {
  constructor(parent, text, list, cb, x, y, w, h) {
    super(
      parent,
      text,
      (ui) => {
        this.dropdownMenu.hidden = false
        _mlx.popup.push(this.dropdownMenu)
      },
      x,
      y,
      w,
      h
    )

    this.callback2 = cb
    this.alwaysOnTop = true
    this.list = list

    //console.log("created");
    this.dropdownMenu = new uiMenu(parent, x, y + h)
    this.dropdownMenu.hidden = true
    this.dropdownMenu.w = this.w
    this.dropdownMenu._adjustChildrenWidth()
    this.dropdownMenu.addSelectMenu(list, 0, (ui, value) => {
      _mlx.hidePopup(this.dropdownMenu)
      if (this.callback2) {
        let v = parseInt(value)
        this.text = this.list[v]
        this.callback2(this, this.text)
      }
    })
    this.dropdownMenu.alwaysOnTop = true
  }

  hideDropdownMenu() {
    this.dropdownMenu.hidden = true
  }

  draw() {
    this.p5.noStroke()
    if (this.highlight) {
      this.p5.fill(192, 192, 192)
      this.p5.rect(this.x, this.y, this.w, this.h)
    }

    this.p5.image(_mlx.imgDropdown, this.x + this.w - 10, this.y + 5, 10, 10)

    this.p5.fill(0)
    this.p5.textSize(14)
    this.p5.textAlign(this.p5.RIGHT, this.p5.TOP)
    this.p5.text(this.text, this.x + this.w - 20, this.y)
  }
}

class uiSubMenu extends uiCommand {
  constructor(parent, text, x, y, w, h) {
    super(parent, text, null, x, y, w, h)
    this.subMenu = new uiMenu(this, this.x, this.y)
    this.subMenu.hidden = true
  }

  draw() {
    super.draw()
    this.p5.image(_mlx.imgPlay, this.x + this.w - 12, this.y + 6, 10, 10)
  }

  mousePressed() {
    if (this.subMenu) {
      if (this.subMenu.x + this.subMenu.w > this.p5.width - 10) {
        let menu = this.parent

        menu.xx = this.p5.width - (menu.w + this.subMenu.w) - 10
      }
      this.subMenu.xx = this.w + 1
      this.subMenu.yy = 0
      if (this.y + this.subMenu.h > this.p5.height - 50) {
        this.subMenu.yy = this.p5.height - (this.y + this.subMenu.h) - 50
      }
      this.subMenu.hidden = false
      _mlx.popup.push(this.subMenu)
    }
    return true
  }
}

class uiCheckedMenu extends uiCommand {
  constructor(parent, text, cb, value, x, y, w, h) {
    super(parent, text, cb, x, y, w, h)
    this.value = value

    this.showBox = false
  }

  draw() {
    super.draw()
    if (this.value) {
      if (this.showBox) {
        this.p5.image(_mlx.imgCheckedBox, this.x + 4, this.y + 6, 10, 10)
      } else {
        this.p5.image(_mlx.imgChecked, this.x + 4, this.y + 6, 10, 10)
      }
    } else {
      if (this.showBox) {
        this.p5.image(_mlx.imgUncheckedBox, this.x + 4, this.y + 6, 10, 10)
      }
    }
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      this.value = !this.value
      this.highlight = false
      if (this.callback) {
        this.callback(this, this.value)
      }
      return false
    }
    return true
  }
}

class uiSelectMenu extends mlxUI {
  constructor(parent, list, cb, value, x, y) {
    super(parent, x, y, 0, 0)
    this.value = value
    this.callback = cb
    this.list = list
    this.selectList = []

    for (var i in list) {
      let text = list[i]
      let b = _mlx.myFont?.textBounds(text, 0, 0, 14)
      if (b.w + 50 > this.w) {
        this.w = b.w + 50
      }
      let cmd = new uiCheckedMenu(
        this,
        text,
        (cmd, value) => {
          this.value = -1
          for (var i in this.children) {
            let child = this.children[i]
            if (child == cmd) this.value = i
            child.value = false
          }
          cmd.value = true
          if (this.callback) {
            this.callback(this, this.value)
          }
        },
        i == value,
        0,
        this.h - 1,
        b.w + 50,
        24
      )
      this.selectList.push(cmd)
      this.h += 24
    }
    this._adjustChildrenWidth()
  }

  setValue(value) {
    this.value = value
    for (var i in this.children) {
      let child = this.children[i]
      if (i == value) child.value = true
      else child.value = false
    }
  }

  setTitle(index, text) {
    if (index >= 0 && index < this.selectList.length) {
      this.selectList[index].text = text
    }
  }

  _adjustChildrenWidth() {
    for (var i in this.children) {
      let child = this.children[i]
      if (child.w < this.w - 2) child.w = this.w - 2
      if (child.selectList) {
        for (var j in child.selectList) {
          let s = child.selectList[j]
          if (s.w < this.w - 2) {
            s.w = this.w - 2
          }
        }
      }
    }
  }
}

class uiSeparator extends mlxUI {
  constructor(parent, x, y, w, h) {
    super(parent, x, y, w, h)
  }

  draw() {
    this.p5.stroke(0)
    this.p5.line(this.x, this.y + this.h / 2, this.x + this.w, this.y + this.h / 2)
  }
}

class uiGapSeparator extends mlxUI {
  constructor(parent, x, y, w, h) {
    super(parent, x, y, w, h)
  }

  draw() {
    this.p5.stroke(0)
    //this.p5.line(this.x, this.y, this.x + this.w, this.y);
    //this.p5.line(this.x, this.y + this.h, this.x + this.w, this.y + this.h);
  }
}

class uiMenu extends mlxUI {
  constructor(parent, x = 0, y = 0) {
    super(parent, x, y, 100, 2)
    this.menuList = []
    /*
        for (var i in menuList) {
            let menu = menuList[i];
            let b = _mlx.myFont.textBounds(menu, 0, 0, 14);
            if (b.w + 50 > this.w) {
                this.w = b.w + 50;
            }
            this.h += 24;
        }
        */
    this.gap = []
  }

  addCommand(text, cb) {
    let b = _mlx.myFont.textBounds(text, 0, 0, 14)
    if (b.w + 52 > this.w) {
      this.w = b.w + 52
    }
    let cmd = new uiCommand(this, text, cb, 1, this.h - 1, b.w + 50, 24)
    this.h += 24
    this._adjustChildrenWidth()
    return cmd
  }

  addSubmenu(text) {
    let b = _mlx.myFont.textBounds(text, 0, 0, 14)
    if (b.w + 72 > this.w) {
      this.w = b.w + 72
    }
    let cmd = new uiSubMenu(this, text, 1, this.h - 1, b.w + 50, 24)
    this.h += 24
    this._adjustChildrenWidth()
    return cmd
  }

  addCheckedMenu(text, value, cb) {
    let b = _mlx.myFont.textBounds(text, 0, 0, 14)
    if (b.w + 50 > this.w) {
      this.w = b.w + 52
    }
    let cmd = new uiCheckedMenu(this, text, cb, value, 1, this.h - 1, b.w + 50, 24)
    this.h += 24
    this._adjustChildrenWidth()
    return cmd
  }

  addSelectMenu(list, value, cb) {
    let cmd = new uiSelectMenu(this, list, cb, value, 1, this.h - 1)
    this.h += cmd.h
    if (this.w < cmd.w + 2) {
      this.w = cmd.w + 2
    }
    this._adjustChildrenWidth()
    return cmd
  }

  addSeparator() {
    let cmd = new uiSeparator(this, 1, this.h - 1, this.w, 6)
    this.h += 6
    this._adjustChildrenWidth()
    return cmd
  }

  addGapSeparator() {
    this.gap.push(this.h)
    let cmd = new uiGapSeparator(this, 1, this.h, this.w, 6)
    this.h += 7
    this._adjustChildrenWidth()
    return cmd
  }

  _adjustChildrenWidth() {
    for (var i in this.children) {
      let child = this.children[i]
      if (child.w < this.w - 2) child.w = this.w - 2
      if (child.selectList) {
        for (var j in child.selectList) {
          let s = child.selectList[j]
          if (s.w < this.w - 2) {
            s.w = this.w - 2
          }
        }
      }
    }
  }

  draw(p5) {
    this.p5.fill(255)
    this.p5.stroke(0)
    this.p5.strokeWeight(1)

    if (this.gap.length == 0) {
      this.p5.rect(this.x, this.y, this.w, this.h)
    } else {
      let h = this.y
      for (let i in this.gap) {
        let g = this.gap[i] - (h - this.y)
        this.p5.rect(this.x, h, this.w, g)
        h = h + g + 6
      }
      this.p5.rect(this.x, h - 1, this.w, this.y + this.h - h + 1)
    }
    this.p5.fill(0)
    this.p5.noStroke()
  }
}

class uiLabel extends mlxUI {
  constructor(parent, text, x, y, w, h) {
    if (h == undefined) {
      h = 20
    }
    super(parent, x, y, w, h)
    this.fontSize = 14
    this.label = this.p5.createGraphics(this.w, this.h)
    this.text = text
    this.setText(text)
  }

  setFontSize(fontSize) {
    this.fontSize = fontSize
  }

  resize(w, h) {
    this.w = w
    this.h = h
    this.label = this.p5.createGraphics(this.w, this.h)
    this.setText(this.text)
  }

  setText(text) {
    this.text = text
    this.label.background(this.colorBackground)
    this.label.fill(0)
    this.label.noStroke()
    this.label.textSize(this.fontSize)
    this.label.textAlign(this.p5.LEFT, this.p5.CENTER)
    this.label.text(this.text, 0, this.h / 2)
  }

  draw(p5) {
    this.p5.image(this.label, this.x, this.y)
  }
}

class uiImage extends mlxUI {
  constructor(parent, url, x, y, w, h) {
    if (h == undefined) {
      h = 20
    }
    super(parent, x, y, w, h)
    this.img = this.p5.loadImage(url)
  }

  draw(p5) {
    this.p5.image(this.img, this.x, this.y, this.w, this.h)
  }
}

class uiCanvas extends mlxUI {
  constructor(parent, x, y, w, h) {
    super(parent, x, y, w, h)
    this.offScreen = this.p5.createGraphics(this.w, this.h)
    this.offScreen.background(255)
  }

  draw(p5) {
    this.p5.image(this.offScreen, this.x, this.y)
  }

  remove() {
    this.offScreen.remove()
  }
}

class uiGraph extends uiCanvas {
  constructor(parent, x, y, w, h) {
    super(parent, x, y, w, h)
    console.log('graph')
    this.graphData = null
    // [country][name|data|option][confirm|deaths|recovered][date]
    this.initOffScreen()
    this.day0 = 0
    this.draggingDay0 = false
    this.country0 = 0
    this.leftGap = 16
    this.leftPanelWidth = 146
    this.rightPanelWidth = 80
    this.expoNum = 7
    this.maxY = [
      [2000000, 100000],
      [1500000, 100000],
      [1200000, 100000],
      [1000000, 100000],
      [800000, 10000],
      [500000, 10000],
      [300000, 20000],
      [280000, 20000],
      [240000, 20000],
      [220000, 10000],
      [200000, 10000],
      [150000, 10000],
      [120000, 10000],
      [100000, 10000],
      [80000, 10000],
      [50000, 10000],
      [30000, 5000],
      [10000, 1000],
      [8000, 1000],
      [5000, 1000],
      [3000, 500],
      [1500, 100],
      [1000, 100],
      [800, 100],
      [500, 100],
      [300, 50],
      [200, 10],
      [100, 10],
    ]
    this.currentYScale = 0
    this.dataType = 0
    // 0 - confirmed
    // 1 - recovered
    // 2 - death
    this.graphType = 1
    // 0 - linear
    // 1 - log
    this.graphMode = 0
    // 0 - accumulated case
    // 1 - new case
    this.plotType = 0
    // 0 - line graph
    // 1 - dot (daily)
    // 2 - bar graph
    this.isShow = []
    this.dateRangeStart = -1
    this.dateRangeEnd = -1
    this.linearRegression = false
    this.movingStartRange = false
    this.movingEndRange = false
    this.maxDate = 0
  }

  setGraphMode(mode) {
    this.graphMode = mode
    if (this.graphMode == 1) {
      this.graphType = 0
    }
    this.drawGraph()
  }

  showAll() {
    for (let i = 0; i < this.isShow.length; i++) {
      this.isShow[i] = true
    }
    this.drawGraph()
  }

  clearAll() {
    for (let i = 0; i < this.isShow.length; i++) {
      this.isShow[i] = false
    }
    this.drawGraph()
  }

  resize(w, h) {
    this.w = w
    this.h = h

    this.offScreen = this.p5.createGraphics(this.w, this.h)
    this.initOffScreen()
    this.graphData = {}
  }

  initOffScreen() {
    this.offScreen.background(255)
    this.offScreen.fill(240)
    this.offScreen.noStroke()
    this.offScreen.rect(0, 0, 130, this.offScreen.height)
  }

  getY(y) {
    if (this.graphType == 1) {
      return Math.log10(y) * ((this.offScreen.height - 50) / this.expoNum)
    } else {
      return (y / this.maxY[this.currentYScale][0]) * (this.offScreen.height - 50)
    }
  }

  setData(data) {
    this.graphData = data
    if (this.isShow.length != this.graphData.length) {
      this.isShow = []
      for (let i in this.graphData) {
        if (i < 2) {
          this.isShow.push(true)
        } else {
          this.isShow.push(false)
        }
      }
    }
    if (this.dateRangeStart == -1) {
      this.dateRangeStart = 0
      this.maxDate = 0
      for (let i in this.graphData) {
        let data = this.graphData[i]
        if (data[1][0].length > this.maxDate) this.maxDate = data[1][0].length
      }
      this.dateRangeEnd = this.maxDate - 1
    }
    this.drawGraph()
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  setMaxDate(max) {
    this.maxDate = max
  }

  polygon(x, y, radius, npoints, start_angle = 0) {
    let angle = this.offScreen.TWO_PI / npoints
    let sangle = this.offScreen.radians(start_angle)
    this.offScreen.beginShape()

    for (let a = sangle; a < this.offScreen.TWO_PI + sangle; a += angle) {
      let sx = x + this.offScreen.cos(a) * radius
      let sy = y + this.offScreen.sin(a) * radius
      this.offScreen.vertex(sx, sy)
    }
    this.offScreen.endShape(this.offScreen.CLOSE)
  }

  setDataType(value) {
    this.dataType = value
    this.drawGraph()
  }

  setGraphType(value) {
    this.graphType = value
    this.drawGraph()
  }

  setPlotType(value) {
    this.plotType = value
    if (this.plotType == 2) {
      this.graphType = 0
    }
    this.drawGraph()
  }

  setLinearRegression(value) {
    this.linearRegression = value
    this.drawGraph()
  }

  // accepts parameters
  //* h  Object = {h:x, s:y, v:z}
  //* OR
  //* h, s, v
  //
  HSBtoRGB(h, s, v, a) {
    if (a === undefined) {
      a = 1
    }

    h = this.clamp(h, 0, 1)
    s = this.clamp(s, 0, 1)
    v = this.clamp(v, 0, 1)

    var r, g, b, i, f, p, q, t
    if (arguments.length === 1) {
      ;(s = h.s), (v = h.v), (h = h.h)
    }
    i = Math.floor(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0:
        ;(r = v), (g = t), (b = p)
        break
      case 1:
        ;(r = q), (g = v), (b = p)
        break
      case 2:
        ;(r = p), (g = v), (b = t)
        break
      case 3:
        ;(r = p), (g = q), (b = v)
        break
      case 4:
        ;(r = t), (g = p), (b = v)
        break
      case 5:
        ;(r = v), (g = p), (b = q)
        break
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: (a * 255) / 1.0,
      mode: this.p5.RGB,
    }
  }

  // accepts parameters
  //* r  Object = {r:x, g:y, b:z}
  //* OR
  //* r, g, b
  //
  RGBtoHSB(r, g, b, a) {
    if (a === undefined) {
      a = 1
    }

    if (arguments.length === 1) {
      ;(g = r.g), (b = r.b), (r = r.r)
    }
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h,
      s = max === 0 ? 0 : d / max,
      v = max / 255

    switch (max) {
      case min:
        h = 0
        break
      case r:
        h = g - b + d * (g < b ? 6 : 0)
        h /= 6 * d
        break
      case g:
        h = b - r + d * 2
        h /= 6 * d
        break
      case b:
        h = r - g + d * 4
        h /= 6 * d
        break
    }

    return {
      h: h,
      s: s,
      v: v,
      a: (a * 1.0) / 255,
      mode: this.p5.HSB,
    }
  }

  // graphData: [
  //    [country, [confirmed, deathes, recovered], color]
  // ]
  drawGraph() {
    if (this.graphData == null || this.graphData.length == 0) return
    this.offScreen.background(255)

    this.offScreen.noStroke()
    this.offScreen.fill(240)
    this.offScreen.rect(0, 0, 130, this.offScreen.height)

    // Country list
    this.offScreen.textAlign(this.p5.LEFT, this.p5.CENTER)
    for (let i = 0; i < this.graphData.length; i++) {
      if (i >= this.country0) {
        let isShow = this.isShow[i]
        let color = this.graphData[i][2]
        let country = this.graphData[i][0]

        // Bullet
        this.offScreen.strokeWeight(1)
        this.offScreen.fill(color)
        let ly = 14 * (i - this.country0) + 10
        if (isShow) {
          this.offScreen.ellipse(10, ly, 5, 5)
        }
        // Country name
        this.offScreen.noStroke()
        this.offScreen.textAlign(this.p5.LEFT, this.p5.CENTER)
        this.offScreen.text(country, 15, ly)
      }
    }
    this.offScreen.fill(255)
    this.offScreen.rect(
      this.leftPanelWidth - this.leftGap,
      0,
      this.offScreen.width - this.leftPanelWidth + this.leftGap,
      this.offScreen.height
    )

    // Setup scale
    if (this.graphType == 0) {
      this.currentYScale = this.maxY.length - 1
      for (let i = 0; i < this.graphData.length; i++) {
        let isShow = this.isShow[i]
        let color = this.graphData[i][2]
        let country = this.graphData[i][0]
        let data = this.graphData[i][1][this.dataType]
        let max = 0

        if (this.graphMode == 0) {
          max = data[data.length - 1]
        } else if (this.graphMode == 1) {
          for (let j = 1; j < this.graphData[i][1][this.dataType].length; j++) {
            let d1 = this.graphData[i][1][this.dataType][j - 1]
            let d2 = this.graphData[i][1][this.dataType][j]
            if (d2 - d1 > max) {
              max = d2 - d1
            }
          }
        }
        //console.log("Max", max);
        if (isShow) {
          while (max > this.maxY[this.currentYScale][0]) {
            this.currentYScale--
            if (this.currentYScale < 0) {
              this.currentYScale = 0
              break
            }
          }
        }
      }
    }
    //console.log(this.currentYScale);

    //    |
    //    |
    // 130|            60
    // ------------------
    // 50
    this.offScreen.stroke(1)
    let xs = (this.offScreen.width - (this.leftPanelWidth + this.rightPanelWidth)) / this.maxDate
    let yy = this.offScreen.height - 50

    // Scale line

    let xx = this.leftPanelWidth
    this.offScreen.stroke(192)
    this.offScreen.line(xx, this.h - 50, this.offScreen.width, this.h - 50)
    if (this.graphType == 1) {
      for (let i = 10; i <= 10000000; i *= 10) {
        let yi = this.getY(i)
        this.offScreen.stroke(192)
        this.offScreen.line(xx, this.h - 50 - yi, this.offScreen.width, this.h - 50 - yi)
        this.offScreen.noStroke()
        this.offScreen.fill(192)
        this.offScreen.textAlign(this.p5.LEFT, this.p5.TOP)
        this.offScreen.text(this.numberWithCommas(i), 132, this.h - 50 - yi + 1)
      }
    } else {
      for (
        let i = this.maxY[this.currentYScale][1];
        i <= this.maxY[this.currentYScale][0];
        i += this.maxY[this.currentYScale][1]
      ) {
        let yi = this.getY(i)
        this.offScreen.stroke(192)
        this.offScreen.line(xx, this.h - 50 - yi, this.offScreen.width, this.h - 50 - yi)
        this.offScreen.noStroke()
        this.offScreen.fill(192)
        this.offScreen.textAlign(this.p5.LEFT, this.p5.TOP)
        this.offScreen.text(this.numberWithCommas(i), 132, this.h - 50 - yi + 1)
      }
    }

    // Date
    this.offScreen.fill(64)
    this.offScreen.stroke(192)
    this.offScreen.textAlign(this.p5.CENTER, this.p5.TOP)
    for (let j = 0; j < this.maxDate; j++) {
      this.offScreen.stroke(192)
      this.offScreen.line(xx, this.h - 50, xx, this.h - 45)
      if (j % 7 == 4) {
        let day = new Date('January 22, 2020')
        this.offScreen.noStroke()
        day.setDate(day.getDate() + j)
        if (this.day0 == 0) {
          this.offScreen.text(`${day.getDate()}/${day.getMonth() + 1}`, xx, this.h - 40)
        } else {
          this.offScreen.text(`d${j}`, xx, this.h - 40)
        }
      }
      xx += xs
    }
    this.offScreen.textAlign(this.p5.LEFT, this.p5.TOP)
    if (this.day0 != 0) {
      this.offScreen.text(
        `Total ${this.graphData.length - 4} countries. Day 0 when ${Math.floor(this.day0)} confirmed cases.`,
        135,
        this.h - 20
      )
    } else {
      this.offScreen.text(
        `Total ${this.graphData.length - 4} countries. Start date: January 22, 2020`,
        135,
        this.h - 20
      )
    }

    let y0 = this.getY(this.day0)
    if (this.day0 == 0) {
      y0 = 0
    }
    this.offScreen.fill(255, 0, 0)
    this.offScreen.stroke(0)
    this.polygon(125, yy - y0, 8, 3, 0)
    //this.offScreen.ellipse(126, yy - y0, 5, 5);

    this.offScreen.fill(0, 0, 255)
    this.polygon(this.leftPanelWidth + this.dateRangeStart * xs, yy, 8, 3, 270)
    this.polygon(this.leftPanelWidth + this.dateRangeEnd * xs, yy, 8, 3, 270)

    // Data
    this.offScreen.textAlign(this.p5.LEFT, this.p5.CENTER)
    for (let i = 0; i < this.graphData.length; i++) {
      let isShow = this.isShow[i]
      let color = this.graphData[i][2]
      let country = this.graphData[i][0]
      this.offScreen.stroke(color)
      if (this.plotType == 0) {
        this.offScreen.strokeWeight(2)
      } else {
        this.offScreen.strokeWeight(1)
      }
      xx = this.leftPanelWidth

      // Data line
      if (isShow) {
        let rgx = []
        let rgy = []
        let rgxmean = 0
        let rgymean = 0
        let rgxs = 0
        let rgys = 0
        let rgm = 0
        let rgc = 0
        if (this.graphMode == 0) {
          for (let j = 1; j < this.graphData[i][1][this.dataType].length; j++) {
            let d0 = this.getY(this.graphData[i][1][this.dataType][j - 1])
            let d1 = this.getY(this.graphData[i][1][this.dataType][j])
            let death = this.getY(this.graphData[i][1][1][j])
            let recover = this.getY(this.graphData[i][1][2][j])
            if (this.day0 == 0 || this.graphData[i][1][this.dataType][j] > this.day0) {
              if (this.plotType == 0) {
                this.offScreen.stroke(color)
                this.offScreen.line(xx, yy - d0, xx + xs, yy - d1)
              } else if (this.plotType == 1) {
                this.offScreen.stroke(color)
                this.offScreen.line(xx, yy - d0, xx + xs, yy - d1)
                this.offScreen.ellipse(xx + xs, yy - d1, 5, 5)
                if (j == 1) {
                  this.offScreen.ellipse(xx, yy - d0, 5, 5)
                }
              } else {
                this.offScreen.stroke(0)
                this.offScreen.fill(color)
                this.offScreen.rect(xx + xs - 3, yy - d1, 6, d1)
                let color2 = this.p5.color(color.r + 32, 255, 255)
                this.offScreen.fill(255)
                this.offScreen.rect(xx + xs - 3, yy - recover - death, 6, recover)
                this.offScreen.fill(32)
                this.offScreen.rect(xx + xs - 3, yy - death, 6, death)
              }
              xx += xs
            }
            if (j >= this.dateRangeStart && j <= this.dateRangeEnd) {
              if (j == 1 && this.dateRangeStart == 0) {
                rgx.push(j - 1)
                rgxmean += j - 1

                rgy.push(d0)
                rgymean += d0
              }
              rgx.push(j)
              rgxmean += j

              rgy.push(d1)
              rgymean += d1
            }
          }
          this.offScreen.noStroke()
          this.offScreen.strokeWeight(3)
          this.offScreen.fill(color)
          this.offScreen.text(
            country,
            xx + 5,
            yy - this.getY(this.graphData[i][1][this.dataType][this.graphData[i][1][this.dataType].length - 1])
          )
        } else if (this.graphMode == 1) {
          if (this.graphData[i][1][this.dataType].length > 2) {
            xx += xs
            for (let j = 2; j < this.graphData[i][1][this.dataType].length; j++) {
              let d0 = this.getY(this.graphData[i][1][this.dataType][j - 2])
              let d1 = this.getY(this.graphData[i][1][this.dataType][j - 1])
              let d2 = this.getY(this.graphData[i][1][this.dataType][j])
              if (this.day0 == 0 || this.graphData[i][1][this.dataType][j] > this.day0) {
                if (this.plotType == 0) {
                  this.offScreen.line(xx, yy - (d1 - d0), xx + xs, yy - (d2 - d1))
                } else if (this.plotType == 1) {
                  this.offScreen.line(xx, yy - (d1 - d0), xx + xs, yy - (d2 - d1))
                  this.offScreen.ellipse(xx + xs, yy - (d2 - d1), 5, 5)
                  if (j == 2) {
                    this.offScreen.ellipse(xx, yy - (d1 - d0), 5, 5)
                  }
                } else {
                  this.offScreen.stroke(0)
                  this.offScreen.fill(color)
                  this.offScreen.rect(xx + xs - 3, yy - d1, 6, d1)
                }
                xx += xs
              }
              if (j >= this.dateRangeStart && j <= this.dateRangeEnd) {
                if (j == 2 && this.dateRangeStart < 2) {
                  rgx.push(j - 1)
                  rgxmean += j - 1

                  rgy.push(d1 - d0)
                  rgymean += d1 - d0
                }
                rgx.push(j)
                rgxmean += j

                rgy.push(d2 - d1)
                rgymean += d2 - d1
              }
            }
            this.offScreen.noStroke()
            this.offScreen.fill(color)
            let dd =
              this.graphData[i][1][this.dataType][this.graphData[i][1][this.dataType].length - 1] -
              this.graphData[i][1][this.dataType][this.graphData[i][1][this.dataType].length - 2]
            this.offScreen.text(country, xx + 5, yy - this.getY(dd))
          }
        }
        if (this.linearRegression) {
          rgxmean = rgxmean / rgx.length
          rgymean = rgymean / rgy.length

          let rgm1 = 0
          let rgm2 = 0
          for (let r in rgx) {
            rgm1 += (rgx[r] - rgxmean) * (rgy[r] - rgymean)
            rgm2 += (rgx[r] - rgxmean) * (rgx[r] - rgxmean)
          }
          rgm = rgm1 / rgm2
          rgc = rgymean - rgm * rgxmean

          this.offScreen.stroke(color)
          this.offScreen.strokeWeight(1)
          xx = this.leftPanelWidth

          let x1 = 0
          let x2 = this.maxDate + this.rightPanelWidth / xs
          let y1 = rgm * x1 + rgc
          let y2 = rgm * x2 + rgc

          this.offScreen.line(xx + x1 * xs, yy - y1, xx + x2 * xs, yy - y2)

          this.offScreen.strokeWeight(5)
          x1 = this.dateRangeStart
          x2 = this.dateRangeEnd
          y1 = rgm * x1 + rgc
          y2 = rgm * x2 + rgc

          this.offScreen.line(xx + x1 * xs, yy - y1, xx + x2 * xs, yy - y2)
        }
      }
    }
  }

  mousePressed() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      if (_mlx.mouseX - this.x < 120) {
        let countryIndex = Math.floor((_mlx.mouseY - this.y - 5) / 14 + this.country0)
        if (countryIndex >= 0 && countryIndex < this.graphData.length) {
          let country = this.graphData[countryIndex][0]
          this.isShow[countryIndex] = !this.isShow[countryIndex]
          this.drawGraph()
        }
      } else if (_mlx.mouseX - this.x < this.leftPanelWidth) {
        this.draggingDay0 = true
        let y = this.y + this.h - 50 - _mlx.mouseY
        if (y <= 0) {
          this.day0 = 0
        } else {
          this.day0 = Math.floor(10 ** (y / ((this.offScreen.height - 50) / this.expoNum)))
        }
        this.drawGraph()
      }
      if (this.graphData) {
        let yy = this.y + this.offScreen.height - 50
        let xx = this.x + this.leftPanelWidth
        let xs = (this.offScreen.width - (this.leftPanelWidth + this.rightPanelWidth)) / this.maxDate
        if (_mlx.mouseY >= yy - 8 && _mlx.mouseY <= yy + 8) {
          let xsr = xx + this.dateRangeStart * xs
          let xer = xx + this.dateRangeEnd * xs
          if (_mlx.mouseX >= xsr - 8 && _mlx.mouseX <= xsr + 8) {
            console.log('Move start range')
            this.movingStartRange = true
          }
          if (_mlx.mouseX >= xer - 8 && _mlx.mouseX <= xer + 8) {
            console.log('Move end range')
            this.movingEndRange = true
          }
        }
      }
    }
  }

  mouseDragged() {
    if (this.isHitElement(_mlx.mouseX, _mlx.mouseY)) {
      if (_mlx.mouseX - this.x < 100) {
      } else if (_mlx.mouseX - this.x < 140) {
        if (this.draggingDay0) {
          let y = this.y + this.h - 50 - _mlx.mouseY
          if (y <= 0) {
            this.day0 = 0
          } else {
            this.day0 = 10 ** (y / ((this.offScreen.height - 50) / this.expoNum))
          }
          this.drawGraph()
        }
      }

      if (this.movingStartRange) {
        console.log('Moving start range')
        let xx = this.x + this.leftPanelWidth
        let xs = (this.offScreen.width - (this.leftPanelWidth + this.rightPanelWidth)) / this.maxDate
        let x = Math.round((_mlx.mouseX - xx) / xs)
        if (x < 0) x = 0
        if (x >= this.graphData[0][1][0].length) x = this.graphData[0][1][0].length - 1
        if (x >= this.dateRangeEnd) {
          x = this.dateRangeEnd - 1
        }
        this.dateRangeStart = x
        this.drawGraph()
      }
      if (this.movingEndRange) {
        console.log('Moving end range')
        let xx = this.x + this.leftPanelWidth
        let xs = (this.offScreen.width - (this.leftPanelWidth + this.rightPanelWidth)) / this.maxDate
        let x = Math.round((_mlx.mouseX - xx) / xs)
        if (x < 0) x = 0
        if (x >= this.maxDate) x = this.maxDate - 1
        if (x <= this.dateRangeStart) {
          x = this.dateRangeStart + 1
        }

        this.dateRangeEnd = x
        this.drawGraph()
      }
    }
  }

  mouseReleased() {
    if (this.draggingDay0) {
      this.draggingDay0 = false
    }
    if (this.movingStartRange) {
      console.log('End start range')
      this.movingStartRange = false
    }
    if (this.movingEndRange) {
      console.log('End end range')
      this.movingEndRange = false
    }
  }

  mouseWheel(event) {
    if (!this.graphData) return
    //console.log("mouseWheel", event.delta);
    this.country0 += event.delta
    if (this.country0 < 0) {
      this.country0 = 0
    } else if (this.country0 > this.graphData.length - this.offScreen.height / 14 + 1) {
      this.country0 = this.graphData.length - this.offScreen.height / 14 + 1
    }
    this.drawGraph()
  }

  draw(p5) {
    this.p5.image(this.offScreen, this.x, this.y)
  }
}

module.exports = {
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
}
