const {
  app,
  dialog,
  globalShortcut,
  BrowserWindow,
  ipcMain
} = require("electron");
global.mainWindow = null;
app.on('window-all-closed', () => {
  app.quit()
});
app.once("ready", function () {
  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  if (shouldQuit) {
    app.quit();
  }
  openWindow();
});

function openWindow() {
  globalShortcut.register("F1", () => {
    mainWindow.openDevTools()
  });
  globalShortcut.register("F3", () => {
	if (mainWindow.isVisible()) {
		mainWindow.hide();
	} else {
		mainWindow.show();
	}
  });
  globalShortcut.register("F4", () => {
    app.relaunch({
      args: process.argv.slice(1).concat(['--relaunch'])
    });
    app.exit(0)
  });
  mainWindow = new BrowserWindow({
      show: true,
      minWidth: 660,
      minHeight: 550,
      icon: "./favicon.ico",
      frame: false,
      transparent: false
    });
  mainWindow.setMenu(null);
  ipcMain.once("windowbounds-get", (event, arg) => {
    if (!arg.isNull) {
      mainWindow.setBounds(arg)
    }
    mainWindow.show();
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.executeJavaScript('const {ipcRenderer} = require("electron");ipcRenderer.send("windowbounds-get", utils.getStorage({name:"panelbounds"}))');
  });
  mainWindow.once("close", (event) => {
    if (!mainWindow.isMaximized()) {
      mainWindow.webContents.executeJavaScript('const {ipcRenderer} = require("electron");ipcRenderer.once("windowbounds-set", (event, bounds) => {utils.setStorage({name:"panelbounds",value:bounds});window.close()})');
      const att = mainWindow.getBounds();
      mainWindow.webContents.send("windowbounds-set", att);
    }
    event.preventDefault();
  });
  mainWindow.loadURL(`file://${__dirname}/pages/index/top_win.html?t=${Date.now()}`);
}
