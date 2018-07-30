import { app, BrowserWindow,Menu,ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow,webContents
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1000,
  })
  webContents = mainWindow.webContents;
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */


import { autoUpdater } from 'electron-updater'

// 主进程监听渲染进程传来的信息
ipcMain.on('update', (e, arg) => {
  checkForUpdates()
});

let checkForUpdates = () => {
  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', function(message) {
      console.log(message)
      sendUpdateMessage('error', '检查更新失败');
  });
  autoUpdater.on('checking-for-update', function(message) {
      sendUpdateMessage('checking-for-update', '检查更新.');
  });
  autoUpdater.on('update-available', function(message) {
      sendUpdateMessage('update-available', '存在新版本');
  });
  autoUpdater.on('update-not-available', function(message) {
      sendUpdateMessage('update-not-available', '未发现新版本');
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {
      sendUpdateMessage('downloadProgress', progressObj);
  });
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      sendUpdateMessage('isUpdateNow');
      ipcMain.on('updateNow', (e, arg) => {
          autoUpdater.quitAndInstall();
      });
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates()
};


// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
  console.log({ message, data });
  webContents.send('message', { message, data });
}
