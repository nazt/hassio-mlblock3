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

const code = require('./audiocode');

class mlxCorgiDudeAudio extends mlxElementInput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Input';
        this.type = 'Spectrogram';
        this.title = 'CorgiDude Audio';

        this.inType = 'audio';
        this.outType = 'tensor';

        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.contentW = 256;
        this.contentH = 256;
        this.w = this.contentW + this.mlx.mlxPadding * 2;
        this.h = this.contentH + this.mlx.mlxCaptionHeight + this.mlx.mlxPadding * 2;
        this.text = '';
        this.detectWord = true;
        this.createElementMenu();

        this.grx = mlx.p5.createGraphics(256, 256);
        this.grx.background(0);

        this.label = this.mlx.createLabel(
            this,
            'Loading...',
            18,
            this.mlx.mlxCaptionHeight + 5,
            this.w - 20,
            24
        );
        this.fft = new p5.FFT(0.8, 256);
        this.label.hidden = true;


        // this.ready = true;
        this.busy = false;
        this.outputIsReady = false;
        this.corgihub = window.CorgiHub.getInstance();

        this.corgihub.register('audio', this.constructor.name, e => {
            let buf = new Uint8ClampedArray(e.data);
            const data = buf.slice(2);
            this.fft_data = data;
            this.ready = true;
            console.log('audio ready!');
        });

        setTimeout(() => {
            this.ready = false;
            this.corgihub.send({ cmd: 'run', code });
        }, 500);
    }

    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Run Code', ui => {
            this.hideMenu();
            this.ready = false;
            this.corgihub.send({ cmd: 'run', code });
        });
        menu.addSeparator();
        menu.addCheckedMenu('Detect Word', this.detectWord, (ui, value) => {
            //console.log('filp command');
            this.hideMenu();
            this.detectWord = value;
        });        
        menu.addSeparator();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    doProcess() {
        this.busy = false;
        if (this.outputIsReady) {
            this.output = this.fft_data;
        }
        // this.output = this.grx;
        this.alreadyRunInLoop = true;
        return true;
    }

    update() {
        super.update();
    }

    draw(p5) {
        super.draw(p5);
        // let spectrum = this.fft.analyze();
        let spectrum = this.fft_data || [0];
        this.grx.image(this.grx, -2, 0);
        // this.grx.noSmooth();
        this.grx.colorMode(p5.HSB, 255);
        for (var i = 0; i < spectrum.length / 2; i++) {
            var c = p5.map(spectrum[i] * 1.5, 0, 255, 0, 255);
            this.grx.stroke(c, 255, 255);
            this.grx.point(254, 255 - i * 2 - 1);
            this.grx.point(254, 255 - i * 2);
            this.grx.point(255, 255 - i * 2 - 1);
            this.grx.point(255, 255 - i * 2);
        }

        let xx = this.x + this.contentX;
        let yy = this.y + this.contentY;
        p5.image(this.grx, xx, yy);
        if( this.detectWord ) {
            const sum = spectrum.reduce((accumulator, currentValue) => accumulator + currentValue);
            if (sum > 10000 && this.fft_data.length == 512) { 
                console.log('[audio]ready');
                this.output = this.fft_data;
                this.outputIsReady = true;
            }    
        }
        else {
            if (this.fft_data && this.fft_data.length == 512) { 
                this.output = this.fft_data;
                this.outputIsReady = true;
            }    
        }
    }
}

module.exports = {
    mlxCorgiDudeAudio,
};
