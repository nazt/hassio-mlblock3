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

class mlxCovid extends mlxElementInput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Input';
        this.type = 'Covid19';
        this.title = 'Covid-19';

        this.inType = 'none';
        this.outType = 'tensor';
        this.graphType = 1;
        this.graphMode = 0;
        this.plotType = 0;
        this.dataType = 0;

        this.w = 960;
        this.h = 720;
        this.createElementMenu();
        this.resizable = true;
        this.label = this.mlx.createLabel(
            this,
            'Loading...',
            this.mlx.mlxPadding,
            this.h - 20 - this.mlx.mlxPadding,
            this.w - this.mlx.mlxPadding * 2,
            24
        );
        this.initGraph = false;
        this.needMouse = true;
        this.linearRegression = false;

        this.setContentSizeByElementWidth();
        this.graph = this.mlx.createGraph(
            this,
            this.contentX,
            this.contentY,
            this.contentW,
            this.contentH
        );

        this.doLoadData();
    }

    async doLoadData() {
        this.covidData = await this.p5.loadJSON('/data/covid-19.json');
        this.label.setText('Ready');
        this.ready = true;
    }

    resizeByMouse() {
        let nw = this.mlx.mouseX - this.x;
        let nh = this.mlx.mouseY - this.y;
        this.w = nw;
        this.h = nh;
        this.setContentSizeByElementWidth();
    }

    setContentSizeByElementWidth() {
        this.contentW = this.w - this.mlx.mlxPadding * 2;
        this.contentH = this.h - this.mlx.mlxPadding * 2 - 28 - this.mlx.mlxCaptionHeight;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;

        this.label.yy = this.contentH + this.contentY + 4;
        //this.graph = this.mlx.createGraph(this, this.contentX, this.contentY, this.contentW, this.contentH);
        if (this.graph) {
            this.graph.resize(this.contentW, this.contentH);
            this.initGraph = false;
        }
    }

    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Show all', ui => {
            this.hideMenu();
            this.graph.showAll();
        });
        menu.addCommand('Clear all', ui => {
            this.hideMenu();
            this.graph.clearAll();
        });
        menu.addSeparator();
        this.dataTypeMenu = menu.addSelectMenu(
            ['Confirmed cases', 'Deaths', 'Recovered cases'],
            this.dataType,
            (ui, value) => {
                this.hideMenu();
                this.dataType = value;
                this.graph.setDataType(value);
                this.updateMenuState();
            }
        );
        menu.addSeparator();

        this.plotTypeMenu = menu.addSelectMenu(
            ['Line Graph', 'Dot (Daily)', 'Bar Graph'],
            this.plotType,
            (ui, value) => {
                this.hideMenu();
                this.plotType = value;
                this.graph.setPlotType(value);
                this.updateMenuState();
            }
        );
        menu.addSeparator();
        this.linearRegressionMenu = menu.addCheckedMenu(
            'Linear Regression',
            this.linearRegression,
            (ui, value) => {
                this.hideMenu();
                this.linearRegression = value;
                this.graph.setLinearRegression(value);
                this.updateMenuState();
            }
        );
        menu.addSeparator();
        this.graphTypeMenu = menu.addSelectMenu(
            ['Linear Graph', 'Exponential Graph'],
            this.graphType,
            (ui, value) => {
                this.hideMenu();
                this.graphType = value;
                this.graph.setGraphType(value);
                this.updateMenuState();
            }
        );
        menu.addSeparator();
        this.graphModeMenu = menu.addSelectMenu(
            ['Accumulate Cases', 'New Cases'],
            this.graphMode,
            (ui, value) => {
                this.hideMenu();
                this.graphMode = value;
                this.graph.setGraphMode(value);
                this.updateMenuState();
            }
        );
        menu.addSeparator();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    updateMenuState() {
        this.graphMode = this.graph.graphMode;
        this.graphModeMenu.setValue(this.graphMode);
        this.graphType = this.graph.graphType;
        this.graphTypeMenu.setValue(this.graphType);
        this.plotType = this.graph.plotType;
        this.plotTypeMenu.setValue(this.plotType);
        this.linearRegression = this.graph.linearRegression;
        this.linearRegressionMenu.value = this.linearRegression;
    }

    doProcess() {
        this.busy = false;
        this.outputIsReady = true;
        this.alreadyRunInLoop = true;
        return true;
    }

    load(data) {
        super.load(data);
        this.setContentSizeByElementWidth();
    }

    update() {
        super.update();

        if (!this.initGraph) {
            if (this.covidData['Thailand']) {
                // Create items array
                var items = Object.keys(this.covidData).map(key => {
                    return [key, this.covidData[key]];
                });

                // Create a new array with only the first 5 items
                //items = items.slice(0, 61);
                for (let i in items) {
                    let name = items[i][0];
                    if (name == 'United Arab Emirates') {
                        items[i][0] = 'UAE';
                    } else if (name == 'Korea, South') {
                        items[i][0] = 'South Korea';
                    } else if (name == 'United Kingdom') {
                        items[i][0] = 'UK';
                    } else if (name == 'Hubei') {
                        items[i][0] = 'Hubei (China)';
                    } else if (name == 'Hong Kong') {
                        items[i][0] = 'Hong Kong (China)';
                    } else if (name == 'Thailand') {
                        console.log('Thailand');
                        if (items[i][1][0].length == items[0][1][0].length) {
                            let newCaseTH = 2643;
                            let recover = 1497;
                            let death = 43;
                            if (items[i][1][0][items[i][1][0].length - 1] < newCaseTH) {
                                items[i][1][0].push(newCaseTH);
                                if (death > 0) {
                                    items[i][1][1].push(death);
                                } else {
                                    items[i][1][1].push(items[i][1][1][items[i][1][1].length - 1]);
                                }
                                if (recover > 0) {
                                    items[i][1][2].push(recover);
                                } else {
                                    items[i][1][2].push(items[i][1][1][items[i][1][2].length - 1]);
                                }
                            }
                        }
                    }
                    items[i].push(
                        this.p5.color(this.p5.random(192), this.p5.random(192), this.p5.random(192))
                    );
                }
                // Sort the array based on the second element
                items.sort(function(first, second) {
                    return (
                        second[1][0][second[1][0].length - 1] - first[1][0][first[1][0].length - 1]
                    );
                });

                this.graph.setData(items);
                this.initGraph = true;
            } else {
                //console.log("Not ready");
            }
        }
    }

    draw(p5) {
        super.draw(p5);

        if (this.ready) {
        }
    }
}

module.exports = {
    mlxCovid,
};
