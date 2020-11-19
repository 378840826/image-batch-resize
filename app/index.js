const fs = require('fs')
const path = require('path')
const images = require('images')
// ipcRenderer： 和主进程 main 通讯
const { ipcRenderer, dialog } = require('electron')

// 保存已选择的文件
let selectedFiles = [];

// function readFile(src, out, outSize) {
//   // 判断文件需要时间，必须同步
//   if (fs.existsSync(src)) {
//     //读取文件夹
//     fs.readdir(src, function (err, files) {
//       if (err) {
//         throw err
//       }
//       files.forEach(function (filePath) {
//         console.log('out', out)
//         //url+"/"+filename不能用/直接连接，Unix系统是”/“，Windows系统是”\“
//         var url = path.join(src, filePath)
//         var filename = filePath.split('.')[0] + '.' + outSize + '.' + filePath.split('.')[1]
//         console.log('filename', filename)
//         var dest = path.join(out, filename)
//         fs.stat(url, function (err, stats) {
//           if (err) { throw err }
//           //是文件
//           if (stats.isFile()) {
//             //正则判定是图片
//             if (/.*\.(jpg|png|gif)$/i.test(url)) {
//               encoderImage(url, dest, outSize)
//             }
//           } else if (stats.isDirectory()) {
//             exists(url, dest, readFile)
//           }
//         })
//       })
//     })
//   } else {
//     throw "no files,no such!"
//   }
// }

const readFile = (outSize) => {
  selectedFiles.forEach(({ path: filePath }) => {
    // url + / + filename 不能用直接用 /，Unix系统是 / ，Windows系统是 \
    // 路径 + 文件名
    var filename = filePath.split('.')[0] + '.' + outSize + '.' + filePath.split('.')[1]
    var dest = path.join(filename)
    log('dest', dest)
    fs.stat(filePath, (err, stats) => {
      if (err) {
        throw err
      }
      //是文件
      if (stats.isFile()) {
        //正则判定是图片
        if (/.*\.(jpg|png|gif)$/i.test(filePath)) {
          encoderImage(filePath, dest, outSize)
        } else {
          log('不是图片')
        }
      } else if (stats.isDirectory()) {
        // 是目录
        exists(filePath, dest, readFile)
      }
    })
  })
}

// 这里处理文件跟复制有点相关，输出要检测文件是否存在，不存在要新建文件
const exists = (url, dest, callback) => {
  fs.exists(dest, (exists) => {
    if (exists) {
      callback && callback(url, dest)
    } else {
      //第二个参数目录权限 ，默认0777(读写权限)
      fs.mkdir(dest, 0777, (err) => {
        if (err) { throw err }
        callback && callback(url, dest)
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
const renderFileList = fileList => {
  const div = document.querySelector('.ul-file-list')
  const ul = document.createElement('Ul')
  for (let index = 0; index < fileList.length; index++) {
    const li = `<li>${fileList[index].name}</li>`
    appendHtml(ul, li)
  }
  div.innerHTML = ''
  div.appendChild(ul)
}

// 选取输入文件或文件夹
const bindFileChange = () => {
  bindAll('.btn-select-in-path', 'change', e => {
    const { target: { files } } = e
    renderFileList(files)
    // 默认输出位置为输入位置
    const dirPath = files[0].path.split(files[0].name)[0]
    select('.output').innerText = dirPath
    selectedFiles.push(...files)
  })
}

//  选取输出路径
const bindOutPathChange = () => {
  bindEvent(select('.btn-select-out-path'), 'click', e => {
    // 通知主进程打开目录选择对话框
    ipcRenderer.send('open-directory-dialog');
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
  // 选中输出目录
  ipcRenderer.on('selectedOutDirectory', (a, b) => {
    console.log('a,b', a, b);
  });
}

const __main = () => {
  bindEvents()
  listener()
}

__main()
