// console.log
var log = function () {
  console.log.apply(console, arguments)
}

// 元素选择器
var select = function (selector) {
  return document.querySelector(selector)
}

//  在元素末尾、结束前插入HTML
var appendHtml = function (element, html) {
  element.insertAdjacentHTML('beforeend', html)
}

// bindEvent() 绑定事件
var bindEvent = function (element, eventName, callback) {
  element.addEventListener(eventName, callback)
}

// toggleClass() class开关(判断是否拥有class,有就remove,没有就add)
var toggleClass = function (element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
  } else {
    element.classList.add(className)
  }
}

// removeClassAll() 删除所有的 class
var removeClassAll = function (className) {
  var selector = '.' + className
  var elements = document.querySelectorAll(selector)
  for (var i = 0; i < elements.length; i++) {
    var e = elements[i]
    e.classList.remove(className)
  }
}

//给所有拥有这个 class 的元素绑定事件
var bindAll = function (selector, eventName, callback) {
  var elements = document.querySelectorAll(selector)
  for (var i = 0; i < elements.length; i++) {
    var e = elements[i]
    bindEvent(e, eventName, callback)
  }
}

//函数可以查找 element 的子元素
var find = function (element, selector) {
  return element.querySelector(selector)
}

