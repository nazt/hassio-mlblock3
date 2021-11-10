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
} = require('./mlxElement');

//============= Flow Control ==============//
class mlxFlowFilter extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'FLowFilter';
        this.title = 'Flow Filter';

        this.inType = 'results';
        this.outType = 'results';

        this.createElementMenu();
        this.needMouse = true;

        this.resizable = false;
        this.w = 250;
        this.h = 65;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.contentAspectRatio = 1.0;
        this.filterName = [
            'confidence',
            'label',
            'class ID',
            'box area',
            'box width',
            'box height',
            'box x',
            'box y',
            'box center x',
            'box center y',
            'length (array)',
        ];
        this.comparatorName = ['==', '>', '<', '>=', '<=', 'contains', 'starts with', 'ends with'];
        this.filter = this.mlx.createSelectOption(
            this,
            this.filterName,
            null,
            5,
            this.mlx.mlxCaptionHeight + 5,
            100,
            30
        );
        this.comparator = this.mlx.createSelectOption(
            this,
            this.comparatorName,
            null,
            110,
            this.mlx.mlxCaptionHeight + 5,
            50,
            30
        );
        this.inputValue = this.mlx.createTextInput(
            this,
            '',
            'text',
            null,
            165,
            this.mlx.mlxCaptionHeight + 5,
            80,
            30
        );
        this.outputIsReady = false;
        this.ready = true;
        this.busy = false;
    }

    save() {
        let data = super.save();
        data.filter = this.filter.getValue();
        data.compare = this.comparator.getValue();
        data.inputValue = this.inputValue.getText();
        return data;
    }

    load(data) {
        super.load(data);
        this.filter.setValue(data.filter);
        this.comparator.setValue(data.compare);
        this.inputValue.setText(data.inputValue);
    }

    inactivateUI() {
        this.filter.select.hide();
        this.comparator.select.hide();
        this.inputValue.input.hide();
    }

    activateUI() {
        this.filter.select.show();
        this.comparator.select.show();
        this.inputValue.input.show();
    }
    compare(input, comparator, compareTo) {
        switch (comparator) {
            case '==':
                return input == compareTo;
            case '>':
                return input > compareTo;
            case '<':
                return input < compareTo;
            case '>=':
                return input >= compareTo;
            case '<=':
                return input <= compareTo;
            case 'contains':
                return input.includes(compareTo);
            case 'starts with':
                return typeof input === 'string' && input.startsWith(compareTo);
            case 'ends with':
                return typeof input === 'string' && input.endsWith(compareTo);
        }
        return false;
    }
    processFilter(input, filter, comparator, compareTo) {
        switch (filter) {
            case 'class ID':
                return input.classId ? this.compare(input.classId, comparator, compareTo) : false;
            case 'confidence':
                return input.confidence
                    ? this.compare(input.confidence, comparator, compareTo)
                    : false;
            case 'label':
                return input.label ? this.compare(input.label, comparator, compareTo) : false;
            case 'box area':
                return input.width && input.height
                    ? this.compare(input.width * input.height, comparator, compareTo)
                    : false;
            case 'box width':
                return input.width ? this.compare(input.width, comparator, compareTo) : false;
            case 'box height':
                return input.height ? this.compare(input.height, comparator, compareTo) : false;
            case 'box x':
                return input.x ? this.compare(input.x, comparator, compareTo) : false;
            case 'box y':
                return input.y ? this.compare(input.y, comparator, compareTo) : false;
            case 'box x (center)':
                return input.x && input.width
                    ? this.compare((input.x + input.width) / 2, comparator, compareTo)
                    : false;
            case 'box y (center)':
                return input.y && input.height
                    ? this.compare((input.y + input.height) / 2, comparator, compareTo)
                    : false;
        }
        return false;
    }
    doProcess() {
        if (this.inElement.output) {
            if (!this.outElement || !this.outputIsReady) {
                let filter = this.filterName[parseInt(this.filter.getValue())];
                let comparator = this.comparatorName[parseInt(this.comparator.getValue())];
                let compareTo = this.inputValue.getText();
                if (!isNaN(compareTo)) {
                    //check string is numeric
                    compareTo = compareTo.includes('.')
                        ? parseFloat(compareTo)
                        : parseInt(compareTo);
                }
                if (Array.isArray(this.inElement.output) && this.inElement.output.length > 0) {
                    let res = this.inElement.output.filter(el =>
                        this.processFilter(el, filter, comparator, compareTo)
                    );
                    if (res.length > 0) {
                        this.output = res;
                        this.outputIsReady = true;
                    } else {
                        this.outputIsReady = false;
                    }
                } else {
                    let res2 = this.processFilter(
                        this.inElement.output,
                        filter,
                        comparator,
                        compareTo
                    );
                    if (res2) {
                        this.output = this.inElement.output;
                        this.outputIsReady = true;
                    } else {
                        this.outputIsReady = false;
                    }
                }
            }
        }
        this.busy = false;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }

    update() {
        super.update();
    }
    draw(p5) {
        super.draw(p5);
    }
}

class mlxFlowMerge extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'FLowMerge';
        this.title = 'Merge';

        this.inType = 'results';
        this.outType = 'results';
        this.allowExtraInElement = true;
        this.createElementMenu();
        this.needMouse = false;

        this.resizable = false;
        this.w = 100;
        this.h = 55;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.contentAspectRatio = 1.0;
        this.label = this.mlx.createLabel(
            this,
            'Ready',
            this.mlx.mlxPadding,
            this.mlx.mlxCaptionHeight + 5,
            this.w - this.mlx.mlxPadding * 2 - 5,
            24
        );
        this.ready = true;
        this.busy = false;
    }

    doProcess() {
        let output = [];
        if (this.inElement.output) {
            if (!this.outElement || !this.outputIsReady) {
                if (Array.isArray(this.inElement.output) && this.inElement.output.length > 0) {
                    output = output.concat(this.inElement.output);
                } else {
                    output.push(this.inElement.output);
                }
            }
        }
        for (let i in this.extraInElement) {
            let elx = this.extraInElement[i];
            if (elx.output && elx.outputIsReady) {
                if (Array.isArray(elx.output) && elx.output.length > 0) {
                    output = output.concat(elx.output);
                } else {
                    output.push(elx.output);
                }
                elx.outputIsReady = false;
            }
        }
        if (output.length > 0) {
            this.output = output;
            this.outputIsReady = true;
        } else {
            this.outputIsReady = false;
        }
        this.label.setText('Output : ' + output.length);
        this.busy = false;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }

    update() {
        super.update();
    }
    draw(p5) {
        super.draw(p5);
    }
}

//=========== editor =========//
class mlxJSEditor extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'JSEditor';
        this.title = 'Javascript Editor';

        this.inType = 'all';
        this.outType = 'results';

        this.createElementMenu();
        this.needMouse = true;

        this.resizable = true;
        this.contentX = 0; // this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight; // + this.mlx.mlxPadding;
        this.w = 400;
        this.h = 300;
        this.contentW = this.w - 1;
        this.contentH = this.h - this.mlx.mlxPadding;
        this.contentAspectRatio = 3.0;

        this.divX = this.contentX;
        this.divY = this.contentY;
        this.divW = this.contentW;
        this.divH = this.contentH;

        this.h += 45;

        this.div = mlx.p5.createDiv();
        this.div.size(this.divW, this.divH);
        this.div.position(this.x + this.divX, this.y + this.divY + this.mlx.mlxNavBarHeight);
        this.div.style('background-color', '#FFFFFF');
        this.div.style('text-align', 'left');

        //this.div.style("font-size", "x-small");
        this.div.addClass('js-editor');

        this.label = this.mlx.createLabel(
            this,
            'JS Flow Editor : Ready',
            this.mlx.mlxPadding,
            this.h - 26,
            this.w - this.mlx.mlxPadding * 2 - 5,
            24
        );

        this.outputIsReady = false;
        this.ready = true;
        this.busy = false;
        this.editor = window.monaco.editor.create(this.div.elt, {
            value: `function flow(input){
  // console.log(input);
  return input;
}`,
            language: 'javascript',
            theme: 'vs-dark',
        });
        // this.editor = CodeMirror(this.div.elt, {
        //   lineNumbers: true,
        //   extraKeys: { "Ctrl-Space": "autocomplete" },
        //   mode: { name: "javascript", globalVars: true },
        // });
    }
    save() {
        let data = super.save();
        let code = this.editor.getValue();
        data.code = code;
        return data;
    }

    load(data) {
        super.load(data);
        let code = data.code;
        this.editor.getModel().setValue(code);
    }

    inactivateUI() {
        this.div.style('display', 'none');
    }

    activateUI() {
        this.div.style('display', 'block');
    }

    resizeByMouse() {
        super.resizeByMouse();
    }

    setContentSizeByElementWidth() {
        this.label.yy = this.h - 26;
        this.label.resize(this.w - this.mlx.mlxPadding * 2 - 5, this.label.h);
        this.div.size(
            this.w * this.mlx.userScale - 1,
            this.h * this.mlx.userScale - 45 - this.mlx.mlxPadding
        );
        this.editor.layout();
    }

    doProcess() {
        try {
            if (this.inElement.output) {
                if (!this.outElement || !this.outputIsReady) {
                    let code = this.editor.getValue();
                    let wrapping = s => '{ return ' + code + ' };';
                    let flow = new Function(wrapping(code));
                    let res = flow(null)(this.inElement.output);
                    if (Array.isArray(res) && res.length > 0) {
                        this.output = res;
                        this.outputIsReady = true;
                    } else if (!Array.isArray(res) && res != null) {
                        this.output = res;
                        this.outputIsReady = true;
                    } else {
                        this.outputIsReady = false;
                    }
                    this.label.setText('READY ...');
                }
            }
        } catch (e) {
            this.label.setText('ERROR : ' + e.message);
            this.outputIsReady = false;
        }
        this.busy = false;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        let xx = this.x + this.divX;
        let yy = this.y + this.divY + this.mlx.mlxNavBarHeight / this.mlx.userScale;
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
    }

    update() {
        super.update();
        this.setPosition(this.x, this.y);
    }
    draw(p5) {
        super.draw(p5);
    }
}

module.exports = {
    mlxFlowFilter,
    mlxFlowMerge,
    mlxJSEditor,
};
