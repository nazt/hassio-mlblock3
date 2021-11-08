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

// MQTT Extension
class mlxMQTT extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Output';
        this.type = 'MQTT';
        this.title = 'MQTT';

        this.inType = 'all';
        this.outType = 'results';
        this.needMouse = true;

        this.resizable = false;
        this.w = 280;
        this.h = 270;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;

        this.sendTimestamp = Date.now();
        this.minOnChangeInterval = 500; //1 sec
        this.text = '';
        this.createElementMenu();
        let margin = 10;
        let elmHeight = 30;

        this.label = this.mlx.createLabel(this, '', 10, this.h - 35, this.w - 20, elmHeight);

        this.mlx.createLabel(
            this,
            'Host',
            10,
            this.mlx.mlxCaptionHeight + margin,
            this.w - 60,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Username',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 1,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Password',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Client ID',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3,
            this.w - 20,
            elmHeight
        );

        let contentHeight = this.mlx.mlxCaptionHeight + margin;

        this.host = this.mlx.createTextInput(
            this,
            'ws://mqtt.com:8000/mqtt',
            'text',
            null,
            80,
            contentHeight + elmHeight * 0,
            190,
            elmHeight
        );
        // this.port = this.mlx.createTextInput(
        //     this,
        //     '80',
        //     'text',
        //     null,
        //     this.w - 55,
        //     contentHeight + elmHeight * 0,
        //     45,
        //     elmHeight
        // );
        this.username = this.mlx.createTextInput(
            this,
            '',
            'text',
            null,
            80,
            contentHeight + elmHeight * 1,
            190,
            elmHeight
        );
        this.password = this.mlx.createTextInput(
            this,
            '',
            'password',
            null,
            80,
            contentHeight + elmHeight * 2,
            190,
            elmHeight
        );
        this.clientId = this.mlx.createTextInput(
            this,
            '',
            'text',
            null,
            80,
            contentHeight + elmHeight * 3,
            190,
            elmHeight
        );

        this.mlx.createSeperator(
            this,
            0,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4 + 5,
            this.w,
            3
        );

        margin += 45;
        this.mlx.createLabel(
            this,
            'Topic',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Send',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            this.w - 20,
            elmHeight
        );
        this.topic = this.mlx.createTextInput(
            this,
            '/test',
            'text',
            null,
            80,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3,
            190,
            elmHeight
        );

        this.sendOption = this.mlx.createRadioOption(
            this,
            ['On Change', 'Every'],
            null,
            75,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4 + 2,
            200,
            25
        );
        this.interval = this.mlx.createTextInput(
            this,
            '3',
            'text',
            null,
            228,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            30,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            's',
            this.w - 20,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            10,
            elmHeight
        );

        this.connectBtn = this.mlx.createButton(
            this,
            'Connect',
            () => {
                this.onConnect();
            },
            this.w - this.mlx.mlxPadding - 100,
            this.h - 30,
            100,
            24
        );

        this.connectBtn.border = true;
        this.ready = false;
        this.busy = false;
        this.outputIsReady = false;
    }

    onConnect() {
        let host = this.host.getText();
        //let port = parseInt(this.port.getText()) || 80;
        let username = this.username.getText();
        let password = this.password.getText();
        let clientId = this.clientId.getText();
        if (this.client == null) {
            let url = new URL(host);
            this.client = new Paho.MQTT.Client(
                url.hostname,
                parseInt(url.port),
                url.pathname,
                clientId
            );
            this.client.onConnectionLost = this.onDisconnected.bind(this);
            this.client.onMessageArrived = this.onMessage.bind(this);
            this.client.onConnected = this.onConnected.bind(this);
        }
        if (this.client.isConnected()) {
            console.log('Disconnected');
            this.client.disconnect();
        } else {
            if (host == '') {
                this.label.setText('Client ID empty!');
                return;
            }
            this.connectBtn.text = 'Connecting...';
            console.log('Connect to : ' + host);
            let options = {
                useSSL: host.startsWith('wss') ? true : false,
                onSuccess: () => {
                    this.onConnected();
                },
                onFailure: () => {
                    this.onDisconnected();
                },
            };
            if (username != '') {
                options.userName = username;
            }
            if (password != '') {
                options.password = password;
            }
            this.client.connect(options);
        }
    }
    onConnected() {
        this.label.setText('Connected');
        this.connectBtn.text = 'Disconnect';
        this.ready = true;
        this.outputIsReady = false;
    }
    onMessage() {
        console.log('message');
    }
    onDisconnected() {
        this.label.setText('Disconnected');
        this.connectBtn.text = 'Connect';
        this.ready = false;
        this.outputIsReady = false;
        this.client = null;
    }
    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    save() {
        let data = super.save();
        let host = this.host.getText();
        //let port = this.port.getText();
        let userName = this.token.getText();
        let password = this.secret.getText();
        let clientId = this.clientId.getText();
        let topic = this.topic.getText();
        let interval = this.interval.getText();
        let sendOption = this.sendOption.getValue();
        data.host = host;
        data.port = port;
        data.username = userName;
        data.password = password;
        data.clientId = clientId;
        data.topic = topic;
        data.interval = interval;
        data.sendOption = sendOption;
        return data;
    }

    load(data) {
        super.load(data);
        this.host.setText(data.host);
        //this.port.setText(data.port);
        this.username.setText(data.username);
        this.password.setText(data.password);
        this.clientId.setText(data.clientId);
        this.topic.setText(data.topic);
        this.interval.setText(data.interval);
        this.sendOption.setValue(data.sendOption);
    }

    inactivateUI() {
        this.host.input.hide();
        //this.port.input.hide();
        this.username.input.hide();
        this.password.input.hide();
        this.clientId.input.hide();
        this.topic.input.hide();
        this.sendOption.radio.hide();
        this.interval.input.hide();
    }

    activateUI() {
        this.host.input.show();
        //this.port.input.show();
        this.username.input.show();
        this.password.input.show();
        this.clientId.input.show();
        this.topic.input.show();
        this.sendOption.radio.show();
        this.interval.input.show();
    }
    doProcess() {
        this.outputIsReady = false;
        this.busy = true;
        this.results = this.inElement.output;
        let msg = '';
        let confidence = 0;
        if (Array.isArray(this.results) && this.results.length > 0) {
            if (this.results[0].label) {
                if (this.results[0].confidence) {
                    this.text = this.results[0].label;
                    confidence = (this.results[0].confidence * 100).toFixed(2);
                } else {
                    this.text = this.results[0].label;
                }
                msg = this.text;
            }
        } else {
            if (this.results.value) {
                this.text = this.results.value;
                msg = this.text;
            } else if (this.results.label) {
                if (this.results.confidence) {
                    this.text = this.results.label;
                    confidence = (this.results.confidence * 100).toFixed(2);
                } else {
                    this.text = this.results.label;
                }
                msg = this.text;
            }
        }
        if (this.sendOption.getValue() == 0) {
            if (this.mqttMsg != msg) {
                let now = Date.now();
                let timeDiff = now - this.sendTimestamp;
                if (timeDiff > this.minOnChangeInterval) {
                    //send
                    this.sendTimestamp = Date.now();
                    this.label.setText(msg);
                    this.mqttSend(msg);
                    this.mqttMsg = msg;
                }
            }
        } else {
            let now = Date.now();
            let sendTimeInterval = parseFloat(this.interval.getText()) * 1000;
            let timeDiff = now - this.sendTimestamp;
            if (sendTimeInterval > 0 && timeDiff > sendTimeInterval) {
                this.sendTimestamp = Date.now();
                this.label.setText(msg);
                this.mqttSend(msg);
            }
        }
        this.busy = false;
        this.outputIsReady = true;
        this.output = this.inElement.output;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }
    mqttSend(msg) {
        let topic = this.topic.getText();
        var message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        this.client.send(message);
    }

    update() {
        super.update();
        if (!this.inElement || !this.inElement.outElement) {
            this.label.setText('');
        }
    }

    draw(p5) {
        super.draw(p5);
    }
}

// NETPIE 2020 MQTT Extension
class mlxNETPIE2020 extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Output';
        this.type = 'NETPIE2020';
        this.title = 'NETPIE 2020';

        this.inType = 'all';
        this.outType = 'results';
        this.needMouse = true;

        this.resizable = false;
        this.w = 280;
        this.h = 240;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;

        this.mqttUri = 'mqtt.netpie.io';
        this.mqttPort = 443;
        this.sendTimestamp = Date.now();
        this.minOnChangeInterval = 500; //1 sec
        this.text = '';
        this.createElementMenu();
        let margin = 10;
        let elmHeight = 30;
        this.label = this.mlx.createLabel(
            this,
            '--- Wait To Connect ---',
            10,
            this.h - 35,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Client ID',
            10,
            this.mlx.mlxCaptionHeight + margin,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Token',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 1,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Secret',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2,
            this.w - 20,
            elmHeight
        );
        let contentHeight = this.mlx.mlxCaptionHeight + margin;
        //console.log("vvvvvvvv", contentHeight);
        this.clientId = this.mlx.createTextInput(
            this,
            '',
            'text',
            null,
            70,
            contentHeight + elmHeight * 0,
            200,
            elmHeight
        );
        this.token = this.mlx.createTextInput(
            this,
            '',
            'text',
            null,
            70,
            contentHeight + elmHeight * 1,
            200,
            elmHeight
        );
        this.secret = this.mlx.createTextInput(
            this,
            '',
            'password',
            null,
            70,
            contentHeight + elmHeight * 2,
            200,
            elmHeight
        );

        this.mlx.createSeperator(
            this,
            0,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3 + 5,
            this.w,
            3
        );

        margin += 15;
        this.mlx.createLabel(
            this,
            'Topic',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Send',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            this.w - 20,
            elmHeight
        );
        this.topic = this.mlx.createTextInput(
            this,
            '@msg/test',
            'text',
            null,
            70,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 3,
            200,
            elmHeight
        );

        this.sendOption = this.mlx.createRadioOption(
            this,
            ['On Change', 'Every'],
            null,
            70,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4 + 2,
            200,
            25
        );
        this.interval = this.mlx.createTextInput(
            this,
            '3',
            'text',
            null,
            228,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            30,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            's',
            this.w - 20,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 4,
            10,
            elmHeight
        );

        this.connectBtn = this.mlx.createButton(
            this,
            'Connect',
            () => {
                this.onConnect();
            },
            this.w - this.mlx.mlxPadding - 100,
            this.h - 30,
            100,
            24
        );

        this.connectBtn.border = true;
        this.ready = false;
        this.busy = false;
        this.outputIsReady = false;
    }
    createInput(x, y, cb) {
        let el = this.mlx.p5.createInput('');
        el.position(x, y);
        el.size(100);
        //el.input(cb);
        return el;
    }
    onConnect() {
        if (this.client == null) {
            this.client = new Paho.MQTT.Client(
                this.mqttUri,
                this.mqttPort,
                this.clientId.getText()
            );
            this.client.onConnectionLost = this.onDisconnected.bind(this);
            this.client.onMessageArrived = this.onMessage.bind(this);
            this.client.onConnected = this.onConnected.bind(this);
        }
        if (this.client.isConnected()) {
            console.log('Disconnect NETPIE 2020');
            this.client.disconnect();
        } else {
            if (this.clientId.getText() == '') {
                this.label.setText('Client ID empty!');
                return;
            }
            if (this.token.getText() == '') {
                this.label.setText('Token empty!');
                return;
            }
            if (this.secret.getText() == '') {
                this.label.setText('Secret empty!');
                return;
            }
            if (this.topic.getText() == '') {
                this.label.setText('Topic empty!');
                return;
            }
            this.connectBtn.text = 'Connecting...';
            console.log('Connect to NETPIE 2020');
            console.log('Client ID : ', this.clientId.getText());
            console.log('Token : ', this.token.getText());
            let options = {
                useSSL: true,
                userName: this.token.getText(),
                password: this.secret.getText(),
                onSuccess: () => {
                    this.onConnected();
                },
                onFailure: () => {
                    this.onDisconnected();
                },
            };
            this.client.connect(options);
        }
    }
    onConnected() {
        this.label.setText('Connected');
        this.connectBtn.text = 'Disconnect';
        this.ready = true;
        this.outputIsReady = false;
    }
    onMessage() {
        console.log('message');
    }
    onDisconnected() {
        this.label.setText('Disconnected');
        this.connectBtn.text = 'Connect';
        this.ready = false;
        this.outputIsReady = false;
        this.client = null;
    }
    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    save() {
        let data = super.save();
        let userName = this.token.getText();
        let password = this.secret.getText();
        let clientId = this.clientId.getText();
        let topic = this.topic.getText();
        let interval = this.interval.getText();
        let sendOption = this.sendOption.getValue();
        data.username = userName;
        data.password = password;
        data.clientId = clientId;
        data.topic = topic;
        data.interval = interval;
        data.sendOption = sendOption;
        return data;
    }

    load(data) {
        super.load(data);
        this.token.setText(data.username);
        this.secret.setText(data.password);
        this.clientId.setText(data.clientId);
        this.topic.setText(data.topic);
        this.interval.setText(data.interval);
        this.sendOption.setValue(data.sendOption);
    }

    inactivateUI() {
        this.clientId.input.hide();
        this.token.input.hide();
        this.secret.input.hide();
        this.sendOption.radio.hide();
        this.topic.input.hide();
        this.interval.input.hide();
    }

    activateUI() {
        this.clientId.input.show();
        this.token.input.show();
        this.secret.input.show();
        this.sendOption.radio.show();
        this.topic.input.show();
        this.interval.input.show();
    }
    doProcess() {
        this.outputIsReady = false;
        this.busy = true;
        this.results = this.inElement.output;
        let msg = '';
        let confidence = 0;
        if (Array.isArray(this.results) && this.results.length > 0) {
            if (this.results[0].label) {
                if (this.results[0].confidence) {
                    this.text = this.results[0].label;
                    confidence = (this.results[0].confidence * 100).toFixed(2);
                } else {
                    this.text = this.results[0].label;
                }
                msg = this.text;
            }
        } else {
            if (this.results.value) {
                this.text = this.results.value;
                msg = this.text;
            } else if (this.results.label) {
                if (this.results.confidence) {
                    this.text = this.results.label;
                    confidence = (this.results.confidence * 100).toFixed(2);
                } else {
                    this.text = this.results.label;
                }
                msg = this.text;
            }
        }
        if (this.sendOption.getValue() == 0) {
            if (this.mqttMsg != msg) {
                let now = Date.now();
                let timeDiff = now - this.sendTimestamp;
                if (timeDiff > this.minOnChangeInterval) {
                    //send
                    this.sendTimestamp = Date.now();
                    this.label.setText(msg);
                    this.mqttSend(msg);
                    this.mqttMsg = msg;
                }
            }
        } else {
            let now = Date.now();
            let sendTimeInterval = parseFloat(this.interval.getText()) * 1000;
            let timeDiff = now - this.sendTimestamp;
            if (sendTimeInterval > 0 && timeDiff > sendTimeInterval) {
                this.sendTimestamp = Date.now();
                this.label.setText(msg);
                this.mqttSend(msg);
            }
        }
        this.busy = false;
        this.outputIsReady = true;
        this.output = this.inElement.output;
        this.inElement.outputIsReady = false;
        this.alreadyRunInLoop = true;
        return true;
    }
    mqttSend(msg) {
        let topic = this.topic.getText();
        var message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        this.client.send(message);
    }

    update() {
        super.update();
        if (!this.inElement || !this.inElement.outElement) {
            this.label.setText('');
        }
    }

    draw(p5) {
        super.draw(p5);
    }
}
//============= mlx Blynk ====================//
class mlxBlynk extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);
        this.category = 'Output';
        this.type = 'Blynk';
        this.title = 'Blynk';

        this.inType = 'results';
        this.outType = 'results';
        this.needMouse = true;
        this.resizable = false;
        this.w = 280;
        this.h = 175;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;

        this.sendTimestamp = Date.now();
        this.minOnChangeInterval = 500; //1 sec
        this.text = '';
        this.createElementMenu();
        let margin = 10;
        let elmHeight = 30;
        this.label = this.mlx.createLabel(
            this,
            '--- Wait To Connect ---',
            10,
            this.h - 35,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'Token',
            10,
            this.mlx.mlxCaptionHeight + margin,
            this.w - 20,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            'VPin',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 1,
            this.w - 20,
            elmHeight
        );
        let contentHeight = this.mlx.mlxCaptionHeight + margin;
        //console.log("vvvvvvvv", contentHeight);
        this.token = this.mlx.createTextInput(
            this,
            '-- Blynk Auth Token --', //--- Blynk Auth Token ---
            'text',
            null,
            70,
            contentHeight + elmHeight * 0,
            200,
            elmHeight
        );
        this.vpins = ['*V0 reserved for LCD', '*V1 reserved for class ID'].concat(
            Array.from({ length: 38 }, (_, i) => 'V' + (i + 2))
        );
        this.vpin = this.mlx.createSelectOption(
            this,
            this.vpins,
            null,
            70,
            contentHeight + elmHeight * 1,
            200,
            elmHeight
        );
        this.vpin.setValue('2'); //use as default
        this.mlx.createSeperator(
            this,
            0,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2 + 5,
            this.w,
            3
        );

        margin += 15;

        this.mlx.createLabel(
            this,
            'Send',
            10,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2,
            this.w - 20,
            elmHeight
        );

        this.sendOption = this.mlx.createRadioOption(
            this,
            ['On Change', 'Every'],
            null,
            70,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2 + 2,
            200,
            25
        );
        this.interval = this.mlx.createTextInput(
            this,
            '3',
            'text',
            null,
            228,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2,
            30,
            elmHeight
        );
        this.mlx.createLabel(
            this,
            's',
            this.w - 20,
            this.mlx.mlxCaptionHeight + margin + elmHeight * 2,
            10,
            elmHeight
        );

        this.connectBtn = this.mlx.createButton(
            this,
            'Connect',
            () => {
                this.onConnect();
            },
            this.w - this.mlx.mlxPadding - 100,
            this.h - 30,
            100,
            24
        );

        this.connectBtn.border = true;
        this.ready = false;
        this.busy = false;
        this.outputIsReady = false;
    }

    onConnect() {
        let token = this.token.getText();
        if (this.blynk == null) {
            this.blynk = new Blynk.Blynk(token, {
                path: '/websockets',
                port: 8080,
                skip_connect: true,
            });
            this.blynk.once('disconnect', this.onDisconnected.bind(this));
            this.blynk.once('connect', this.onConnected.bind(this));
            this.lcd = new this.blynk.WidgetLCD(0);
        }

        if (this.ready == true) {
            //connected
            //this.blynk.disconnect();
            //this.blynk = null;
            //delete this.blynk;
        } else {
            if (token == '') {
                this.label.setText('Token empty!');
                return;
            }
            let vpin = parseInt(this.vpin.getValue());
            if (vpin == 0) {
                this.label.setText('V0 reserved for label LCD');
                return;
            }
            if (vpin == 1) {
                this.label.setText('V1 reserved for class ID');
                return;
            }
            this.classIdPin = new this.blynk.VirtualPin(1);
            this.virtualPin = new this.blynk.VirtualPin(vpin);
            this.blynk.connect();
        }
    }
    onConnected() {
        this.blynk.syncAll();
        this.label.setText('Connected');
        this.connectBtn.text = 'Disconnect';
        this.ready = true;
        this.outputIsReady = false;
    }
    onMessage() {
        console.log('message');
    }
    onDisconnected() {
        this.label.setText('Disconnected');
        this.connectBtn.text = 'Connect';
        this.ready = false;
        this.outputIsReady = false;
    }
    createElementMenu() {
        let menu = this._createMenu();
        menu.addCommand('Delete', ui => {
            this.hideMenu();
            this.mlx.removeElement(this);
        });
    }

    save() {
        let data = super.save();
        let token = this.token.getText();
        let vpin = this.vpin.getValue();
        let interval = this.interval.getText();
        let sendOption = this.sendOption.getValue();
        data.blynk_token = token;
        data.blynk_vpin = vpin;
        data.blynk_interval = interval;
        data.blynk_sendOption = sendOption;
        return data;
    }

    load(data) {
        super.load(data);
        this.token.setText(data.blynk_token);
        this.vpin.setValue(data.blynk_vpin);
        this.interval.setText(data.blynk_interval);
        this.sendOption.setValue(data.blynk_sendOption);
    }

    inactivateUI() {
        this.token.input.hide();
        this.vpin.select.hide();
        this.sendOption.radio.hide();
        this.interval.input.hide();
    }

    activateUI() {
        this.token.input.show();
        this.vpin.select.show();
        this.sendOption.radio.show();
        this.interval.input.show();
    }
    doProcess() {
        this.outputIsReady = false;
        this.busy = true;
        this.results = this.inElement.output;
        let msg = '';
        let confidence = 0;
        let classId = null;
        if (Array.isArray(this.results) && this.results.length > 0) {
            if (this.results[0].label) {
                if (this.results[0].confidence) {
                    this.text = this.results[0].label;
                    confidence = (this.results[0].confidence * 100).toFixed(2);
                } else {
                    this.text = this.results[0].label;
                }
                if (this.results[0].classId !== undefined) {
                    classId = this.results[0].classId;
                }
                msg = this.text;
            }
        } else {
            if (this.results.value) {
                this.text = this.results.value;
                msg = this.text;
            } else if (this.results.label) {
                if (this.results.confidence) {
                    this.text = this.results.label;
                    confidence = (this.results.confidence * 100).toFixed(2);
                } else {
                    this.text = this.results.label;
                }
                if (this.results.classId !== undefined) {
                    classId = this.results[0].classId;
                }
                msg = this.text;
            }
        }
        if (this.sendOption.getValue() == 0) {
            if (this.mqttMsg != msg) {
                let now = Date.now();
                let timeDiff = now - this.sendTimestamp;
                if (timeDiff > this.minOnChangeInterval) {
                    //send
                    this.sendTimestamp = Date.now();
                    this.label.setText(msg);
                    if (classId !== null) {
                        this.classIdPin.write(classId);
                    }
                    this.virtualPin.write(msg);
                    this.lcd.clear();
                    this.lcd.print(0, 0, msg);
                    this.mqttMsg = msg;
                }
            }
        } else {
            let now = Date.now();
            let sendTimeInterval = parseFloat(this.interval.getText()) * 1000;
            let timeDiff = now - this.sendTimestamp;
            if (sendTimeInterval > 0 && timeDiff > sendTimeInterval) {
                this.sendTimestamp = Date.now();
                this.label.setText(msg);
                if (classId !== null) {
                    this.classIdPin.write(classId);
                }
                this.virtualPin(msg);
                this.lcd.clear();
                this.lcd.print(0, 0, msg);
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
            this.label.setText('');
        }
    }

    draw(p5) {
        super.draw(p5);
    }
}

//============= mlx Serial Port ==============//
class mlxSerialPort extends mlxElementOutput {
    constructor(mlx) {
        super(mlx);

        this.category = 'Output';
        this.type = 'SerialPort';
        this.title = 'Serial Port';

        this.inType = 'results';
        this.outType = 'results';

        this.createElementMenu();
        this.needMouse = true;
        this.serialObject = null;
        this.writer = null;
        this.reader = null;
        this.opened = false;

        this.resizable = false;
        this.w = 237;
        this.h = 90;
        this.contentX = this.mlx.mlxPadding;
        this.contentY = this.mlx.mlxCaptionHeight + this.mlx.mlxPadding;
        this.contentAspectRatio = 1.0;
        this.mlx.createLabel(
            this,
            'Baud Rate : ',
            this.mlx.mlxPadding,
            this.mlx.mlxCaptionHeight + 8,
            100,
            24
        );
        this.baudrate = [
            '115200',
            '1200',
            '2400',
            '4800',
            '9600',
            '14400',
            '19200',
            '28800',
            '31250',
            '38400',
            '57600',
        ];
        this.baudrateSelector = this.mlx.createSelectOption(
            this,
            this.baudrate,
            null,
            90,
            this.mlx.mlxCaptionHeight + 5,
            140,
            30
        );
        this.label = this.mlx.createLabel(
            this,
            '... Wait to connect',
            this.mlx.mlxPadding,
            this.h - 26,
            this.w - this.mlx.mlxPadding * 2 - 5,
            24
        );
        this.connectBtn = this.mlx.createButton(
            this,
            'Connect',
            () => {
                this.onConnect();
            },
            this.w - this.mlx.mlxPadding - 100 + 3,
            this.h - 28,
            100,
            24
        );
        this.connectBtn.border = true;
        if (!navigator.serial) {
            this.mlx.createLabel(
                this,
                'Your web browser is not supported',
                this.mlx.mlxPadding,
                this.mlx.mlxCaptionHeight,
                this.w - this.mlx.mlxPadding,
                this.h - this.mlx.mlxCaptionHeight - 5
            );
            this.baudrateSelector.select.hide();
        } else {
            //
        }
        this.outputIsReady = false;
        this.ready = false;
        this.busy = false;
    }
    onConnect() {
        if (!this.ready) {
            navigator.serial
                .requestPort()
                .then(port => {
                    if (port) {
                        let baudrate = this.baudrate[parseInt(this.baudrateSelector.getValue())];
                        this.serialObject = port;
                        this.serialObject.onconnect = () => {
                            this.onConnected();
                        };
                        this.serialObject.ondisconnect = () => {
                            this.onDisconnected();
                        };
                        return port.open({ baudRate: baudrate });
                    }
                    return false;
                })
                .then(res => {
                    if (res === false) {
                        //reject
                    } else {
                        // const textDecoder = new TextDecoderStream();
                        // const readableStreamClosed = this.serialObject.readable.pipeTo(textDecoder.writable);
                        // this.reader = textDecoder.readable.getReader();
                        // this.reader = this.serialObject.readable.getReader();
                        this.writer = this.serialObject.writable.getWriter();
                        this.connectBtn.text = 'Disconnect';
                        this.ready = true;
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.label.setText(err.message);
                    this.ready = false;
                });
        } else {
            if (this.serialObject) {
                if (this.writer) {
                    this.writer.releaseLock();
                }
                if (this.reader) {
                    this.reader.releaseLock();
                }
                this.serialObject
                    .close()
                    .then(_ => {
                        this.connectBtn.text = 'Connect';
                        this.ready = false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
            }
        }
    }
    onConnected() {
        console.log('serial port connected');
        this.connectBtn.text = 'Disconnect';
        this.ready = true;
    }
    onDisconnected() {
        console.log('serial port disconnected');
        this.ready = false;
        this.connectBtn.text = 'Connect';
    }
    save() {
        let data = super.save();
        data.baudrateSelector = this.baudrateSelector.getValue();
        return data;
    }

    load(data) {
        super.load(data);
        this.baudrateSelector.setValue(data.baudrateSelector);
    }

    inactivateUI() {
        this.baudrateSelector.select.hide();
    }

    activateUI() {
        this.baudrateSelector.select.show();
    }
    int2bytes(value) {
        return [(value >> 8) & 0x00ff, value & 0x00ff];
    }
    float2bytes(value) {
        let buff = new Float32Array(1);
        buff[0] = value;
        return [...new Uint8Array(buff.buffer)];
    }
    checkSum(buff) {
        let checksum = 0x00;
        for (let i = 0; i < buff.length; i++) {
            checksum ^= buff[i];
        }
        return checksum;
    }
    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    createPayload(id, type, classId, label, confidence, centerX, centerY, width, height) {
        let buff = [].concat(
            0x24, //$ start
            0, //packet length 0
            0, //packet lenght 1
            type, // message type
            this.int2bytes(id), //session id
            this.int2bytes(classId), // result class id
            this.int2bytes(label.length), //message len
            Array.from(label, x => x.charCodeAt(0)), //label
            this.float2bytes(confidence) //confident rate
        );
        if (type == 1) {
            // buff = buff.concat(
            //   0x23 //# ending
            // );
        } else if (type == 2) {
            //detection
            buff = buff.concat(
                this.int2bytes(centerX), //box center x
                this.int2bytes(centerY), // box center y
                this.int2bytes(width), // box width
                this.int2bytes(height) // box height
            );
        }
        let packetLen = this.int2bytes(buff.length + 2); // + checksum 1 byte and ending 1 byte
        buff[1] = packetLen[0];
        buff[2] = packetLen[1];
        let checkSum = this.checkSum(buff);
        buff.push(checkSum);
        buff.push(0xfe); //ending
        return buff;
    }
    sendOut(sessionId, outputArray) {
        let allPayload = [];

        for (let i = 0; i < outputArray.length; i++) {
            let message = outputArray[i];
            //check type first
            if (!message.label) {
                return; //reject
            }
            let type = 1; //classification
            if (message.width && message.height) {
                type = 2; //detection as bounding box
            }
            let classId = message.classId || 0;
            let centerX = message.x ? Math.floor(message.x + message.width / 2) : 0;
            let centerY = message.y ? Math.floor(message.y + message.height / 2) : 0;
            let width = Math.floor(message.width);
            let height = Math.floor(message.height);
            let payload = this.createPayload(
                sessionId,
                type,
                classId,
                message.label,
                message.confidence ? message.confidence * 100 : 0,
                centerX,
                centerY,
                width,
                height
            );
            allPayload = allPayload.concat(payload);
        }
        if (outputArray.length == 0) {
            //no result
            allPayload = this.createPayload(0, 0, 0, '', 0, 0, 0, 0, 0);
        }
        let output = new Uint8Array(allPayload);
        return this.writer.write(output);
    }
    doProcess() {
        this.busy = true;
        this.alreadyRunInLoop = false;
        if (this.inElement.output) {
            if (!this.outElement || !this.outputIsReady) {
                let sessionId = this.getRndInteger(1, 0xfffd);
                let outArr = [];
                if (Array.isArray(this.inElement.output)) {
                    outArr = this.inElement.output;
                } else {
                    outArr = [this.inElement.output];
                }
                this.sendOut(sessionId, outArr).then(async () => {
                    // try {
                    //   while (true) {
                    //     const { value, done } = await this.reader.read();
                    //     if (done) {
                    //       break;
                    //     }
                    //     if (value) {
                    //       console.log(new TextDecoder().decode(value));
                    //     }
                    //   }
                    // } catch (error) {
                    //   console.log("error", error);
                    //   // TODO: Handle non-fatal read error.
                    // }
                });

                this.busy = false;
                this.inElement.outputIsReady = false;
                this.alreadyRunInLoop = true;
            }
        }
        return true;
    }

    update() {
        super.update();
    }
    draw(p5) {
        super.draw(p5);
    }
}

module.exports = {
    mlxMQTT,
    mlxNETPIE2020,
    mlxBlynk,
    mlxSerialPort,
};
