const {BrowserWindow} = require('electron');
const path = require('path');

class MainWindow {
    constructor() {
        this.isShown = false;
        this.mainWidow = null;
        this.createWindow();
    }

    createWindow() {
        this.mainWidow = new BrowserWindow({
            title: 'main',
            resizable: true,
            center: true,
            show: false,
            frame: true,
            autoHideMenuBar: true,
            titleBarStyle: 'hidden-inset'
        })

        // this.mainWidow.loadURL(`file://${path.resolve(__dirname, '../views/index.html')}`);
        this.isShown = false;
    }

    show() {
        this.mainWidow.show();
        this.isShown = true;
    }
}

module.exports = MainWindow;