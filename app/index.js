const fs = require('fs')
const _path = require('path')
const images = require('images')
// ipcRenderer： 和主进程 main 通讯
const { ipcRenderer, dialog } = require('electron')

// 保存已选择的文件
let _selectedFiles = []
// 输入路径
let _inPath = ''
// 输出路径
let _outPath = ''

function readSelectedFiles() {
  // 判断文件需要时间，必须同步
  if (fs.existsSync(_inPath)) {
    fs.readdir(_inPath, function (err, files) {
      if (err) {
        throw err
      }
      _selectedFiles = files
      // 渲染文件列表
      renderFileList()
    })
  } else {
    throw "no files,no such!"
  }
}

const readFile = (outSize) => {
  _selectedFiles.forEach(filePath => {
    // 原文件路径 + 文件名
    var inFullPath = _path.join(_inPath, filePath)
    // 输出文件名
    var outFilename = filePath.split('.')[0] + '.' + outSize + '.' + filePath.split('.')[1]
    // 输出路径 + 文件名 不能用直接用 /，Unix系统是 / ，Windows系统是 \
    var outFullPath = _path.join(_outPath, outFilename)
    fs.stat(inFullPath, (err, stats) => {
      if (err) {
        throw err
      }
      //是文件
      if (stats.isFile()) {
        //正则判定是图片
        if (/.*\.(jpg|png|gif)$/i.test(filePath)) {
          encoderImage(inFullPath, outFullPath, outSize)
        } else {
          log('不是图片')
        }
      } else if (stats.isDirectory()) {
        // 是目录
        exists(filePath, outFullPath, readFile)
      }
    })
  })
}

// 这里处理文件跟复制有点相关，输出要检测文件是否存在，不存在要新建文件
const exists = (url, outFullPath, callback) => {
  fs.exists(outFullPath, (exists) => {
    if (exists) {
      callback && callback(url, outFullPath)
    } else {
      //第二个参数目录权限 ，默认0777(读写权限)
      fs.mkdir(outFullPath, 0777, (err) => {
        if (err) { throw err }
        callback && callback(url, outFullPath)
      })
    }
  })
}

// 单个图片处理
const encoderImage = (sourceImg, destImg, outSize) => {
  images(sourceImg)
    .resize(outSize)
    .save(destImg, {
      // 图片质量
      quality: 100
    })
}

// 渲染文件列表
const renderFileList = () => {
  const div = document.querySelector('.ul-file-list')
  const ul = document.createElement('Ul')
  for (let index = 0; index < _selectedFiles.length; index++) {
    const li = `<li>${_selectedFiles[index]}</li>`
    appendHtml(ul, li)
  }
  div.innerHTML = ''
  div.appendChild(ul)
}

// 选取输入文件或文件夹
const bindFileChange = () => {
  bindEvent(select('.btn-select-in-path'), 'click', e => {
    // 通知主进程打开目录选择对话框
    ipcRenderer.send('open-directory-dialog', 'selectedInPath');
  })
}

//  选取输出路径
const bindOutPathChange = () => {
  bindEvent(select('.btn-select-out-path'), 'click', e => {
    // 通知主进程打开目录选择对话框
    ipcRenderer.send('open-directory-dialog', 'selectedOutPath');
  })
}

// 开始转换
const bindStart = () => {
  document.querySelector('#id-start').addEventListener('click', () => {
    readFile(24)
  })
}

// 绑定事件
const bindEvents = () => {
  bindFileChange()
  bindOutPathChange()
  bindStart()
}

// 监听主进程消息
const listener = () => {
  // 选中输入目录
  ipcRenderer.on('selectedInPath', (_, pathArr) => {
    const path = pathArr[0]
    _inPath = path
    // 默认输出位置为输入位置
    _outPath = path
    readSelectedFiles()
    select('.output').innerText = path
  });

  // 选中输出目录
  ipcRenderer.on('selectedOutPath', (_, pathArr) => {
    console.log('pathArr', pathArr);
  });
}

const __main = () => {
  bindEvents()
  listener()
}

__main()
