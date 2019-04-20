const electron = require("electron").remote || require("electron");
const clipboard = electron.clipboard;
const dialog = electron.dialog;
const currentWindow = electron.getCurrentWindow();
const webContents = currentWindow.webContents;
const utils = require("../common/js/utils.js");
window.showMsg = (msg) => {
  webContents.executeJavaScript(`showMsg("${msg.replace(/\\/g, "\\\\")}")`);
};

window.clipboard = {
  write: (str) => {
    clipboard.writeText(str)
  },
  read: () => {
    return clipboard.readText()
  }
};

window.choiceFile = (extension) => {
  let fileName = dialog.showOpenDialog(currentWindow, {
      title: "选择文件",
      properties: ["openFile"],
      filters: [{
          name: 'Custom File Type',
          extensions: [extension]
        }
      ]
    });
  if (fileName) {
    return fileName[0]
  }
  return null;
};
window.choicePath = (defaultPath) => {
  let path = dialog.showOpenDialog(currentWindow, {
      title: "选择文件夹",
      defaultPath: defaultPath,
      properties: ["openDirectory"],
      createDirectory: true,
      promptToCreate: true
    });
  if (path) {
    return path[0]
  }
  return null;
};
window.setProgressBar = (progress) => {
  currentWindow.setProgressBar(progress);
};

