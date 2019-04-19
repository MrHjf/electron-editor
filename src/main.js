const {app} = require('electron');
const SplashWindow = require('./windows/controllers/splash');
const MainWindow = require('./windows/controllers/main');

class Main {
  constructor() {
      this.splashWindow = null;
      this.mainWindow = null;
  }

  init() {
      this.initApp();
  }

  initApp() {
      app.on('ready', () => {
          //创建loading
          this.createSplashWindow()

          //创建主window
          this.createMainWindow();
      })
  }

  createSplashWindow() {
      this.splashWindow = new SplashWindow();
      this.splashWindow.show();
  }

  createMainWindow() {
      this.mainWindow = new MainWindow();
      const self = this;
      setInterval(function() {
          self.splashWindow.hide();
          self.mainWindow.show();
      }, 4000)
  }

}

new Main().init();