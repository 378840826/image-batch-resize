// console.log
const log = function () {
  console.log.apply(console, arguments)
}

// 元素选择器
const select = function (selector) {
  return document.querySelector(selector)
}

//  在元素末尾、结束前插入HTML
const appendHtml = function (element, html) {
  element.insertAdjacentHTML('beforeend', html)
}

// bindEvent() 绑定事件
const bindEvent = function (element, eventName, callback) {
  element.addEventListener(eventName, callback)
}

// toggleClass() class开关(判断是否拥有class,有就remove,没有就add)
const toggleClass = function (element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
  } else {
    element.classList.add(className)
  }
}

// removeClassAll() 删除所有的 class
const removeClassAll = function (className) {
  const selector = '.' + className
  const elements = document.querySelectorAll(selector)
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i]
    e.classList.remove(className)
  }
}

//给所有拥有这个 class 的元素绑定事件
const bindAll = function (selector, eventName, callback) {
  const elements = document.querySelectorAll(selector)
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i]
    bindEvent(e, eventName, callback)
  }
}

//函数可以查找 element 的子元素
const find = function (element, selector) {
  return element.querySelector(selector)
}

