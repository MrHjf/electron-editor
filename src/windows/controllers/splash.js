const {BrowserWindow} = require('electron');
const path = require('path');

class SplashWindow {
    constructor() {
        this.splashWindow = new BrowserWindow({
            width: 200,
            height: 80,
            center: true,
            frame: false,
            autoHideMenuBar: true,
            alwaysOnTop: true,
            resizable: false,
        });

        this.splashWindow.loadURL(`file://${path.resolve(__dirname, '../views/splash.html')}`)
        this.isShown = false;
    }

    show() {
        this.splashWindow.show();
        this.isShown = true;
    }

    hide() {
        this.splashWindow.hide();
        this.isShown = false;
    }
}

module.exports = SplashWindow;