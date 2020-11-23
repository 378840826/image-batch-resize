const fs = require('fs')
const _path = require('path')
const images = require('images')
// ipcRenderer： 和主进程 main 通讯
const { ipcRenderer } = require('electron')

// 保存已选择的文件
let _selectedFiles = []
// 输入路径
let _inPath = ''
// 输出路径
let _outPath = ''

// 获取选中的目录中的图片
const readSelectedFiles = () => {
  // 清空文件列表
  _selectedFiles = []
  if (fs.existsSync(_inPath)) {
    fs.readdir(_inPath, (err, files) => {
      if (err) {
        log('fs.readdir 发生错误')
        throw err
      }
      // 过滤出图片
      files.forEach(fileName => {
        if (/.*\.(jpg|png|gif)$/i.test(fileName)) {
          _selectedFiles.push(fileName)
        }
      })
      // 渲染文件列表
      renderFileList()
    })
  } else {
    log('fs.existsSync 发生错误')
    throw 'no files,no such!'
  }
}

// 开始转换
const readFile = outSizeArr => {
  outSizeArr.forEach(outSize => {
    // 输出目录路径
    const outDirPath = _path.join(_outPath, String(outSize))
    // 创建输出目录
    fs.mkdir(outDirPath, { recursive: true }, (err) => {
      if (err) {
        log('mkdir err', err)
      }
      // 遍历选中的文件
      _selectedFiles.forEach(fileName => {
        // 原文件路径 + 文件名
        const inFullPath = _path.join(_inPath, fileName)
        if (/.*\.(jpg|png|gif)$/i.test(fileName)) {
          encoderImage(inFullPath, outDirPath, outSize, fileName)
        } else {
          log('不是图片')
        }
      })
    })
  })
}

// 单个图片处理
const encoderImage = (sourceImg, destDir, outSize, outFileName) => {
  // 输出文件路径
  const destImg = _path.join(destDir, outFileName)
  images(sourceImg)
    .resize(outSize)
    .save(destImg, {
      // 图片质量
      quality: 100
    })
}

// 渲染文件列表
const renderFileList = () => {
  const div = select('.file-list')
  const ul = document.createElement('UL')
  const length = _selectedFiles.length
  if (!length) {
    div.innerHTML = '无'
    return
  }
  for (let index = 0; index < length; index++) {
    const li = `<li>${_selectedFiles[index]}</li>`
    appendHtml(ul, li)
  }
  div.innerHTML = ''
  div.appendChild(ul)
}

// 渲染输出路径
const renderOutPath = () => {
  select('.output').innerText = _outPath
}

// 选取输入文件或文件夹
const bindFileChange = () => {
  bindEvent(select('.btn-select-in-path'), 'click', () => {
    // 通知主进程打开目录选择对话框
    ipcRenderer.send('open-directory-dialog', 'selectedInPath')
  })
}

//  选取输出路径
const bindOutPathChange = () => {
  bindEvent(select('.btn-select-out-path'), 'click', e => {
    // 通知主进程打开目录选择对话框
    ipcRenderer.send('open-directory-dialog', 'selectedOutPath')
  })
}

// 开始转换
const bindStart = () => {
  bindEvent(select('#id-start'), 'click', () => {
    readFile([24, 30, 36, 42, 48])
  })
}

// 绑定事件
const bindEvents = () => {
  bindFileChange()
  bindOutPathChange()
  bindStart()
}

// 监听主进程消息
const addListener = () => {
  // 选中输入目录
  ipcRenderer.on('selectedInPath', (_, pathArr) => {
    const path = pathArr[0]
    _inPath = path
    // 默认输出位置为输入位置下的 new_size 目录
    _outPath = _path.join(path, 'new_size')
    readSelectedFiles()
    renderOutPath()
  })

  // 选中输出目录
  ipcRenderer.on('selectedOutPath', (_, pathArr) => {
    _outPath = _path.join(pathArr[0], 'new_size')
    renderOutPath()
  })
}

const __main = () => {
  bindEvents()
  addListener()
}

__main()
