/**
 * main 主进程
 * 在主进程中打开的一个web页面就是一个渲染进程
 */

// app: 控制应用生命周期的模块
// BrowserWindow: 创建本地浏览器窗口的模块
// ipcMain: 接收渲染进程的消息，用于交互
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

// 热加载
try {
  require('electron-reloader')(module, {});
} catch (_) {}

// 判断命令行脚本是不是 start 的
const debug = /./.test(process.argv[2])

function createWindow() {
  // 指向窗口对象
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // 外框, 有最大化/关闭 等功能的外框，可用 ElectronApi 自定义实现
    // frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // 装载应用的index.html页面
  // mainWindow.loadFile('./app/index.html')
  mainWindow.loadURL(`file://${__dirname}/app/index.html`)
  // mainWindow.loadURL('http://localhost:8000/')
  //如果是--debug 打开开发者工具，窗口最大化，
  if (debug) {
    mainWindow.webContents.openDevTools();
  }
  // 当窗口关闭时调用的方法
  mainWindow.on('closed', () => {
    // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
    // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
    mainWindow = null;
  });
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 打开文件夹选择
ipcMain.on('open-directory-dialog', (event, msg) => {
  dialog.showOpenDialog({
    // 只能选择目录
    properties: ['openDirectory'],
  }).then(result => {
    event.sender.send(msg, result.filePaths)
  }).catch(err => {
    event.sender.send(msg, false)
  })
});
