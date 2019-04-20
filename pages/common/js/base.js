/**
 * 扩展数组，实现插入方法
 */
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

/**
 * 获取当前元素计算后的样式
 */
window.getComputedStyle = window.getComputedStyle || function (dom) {
  return dom.currentStyle;
};

window.base = {};
base.search = ((function () {
    var URLParams = {};
    var aParams = decodeURI(document.location.search).substr(1).split('&');
    for (i = 0; i < aParams.length; i++) {
      var aParam = aParams[i].split('=');
      URLParams[aParam[0]] = aParam[1];
    }
    return URLParams;
  })());

base.select = function (selector, dom) {
  return (dom || document).querySelectorAll(selector)
}
base.initDom = function (dom) {
  [].slice.call(base.select('[relative*="="]')).forEach(function (e) {
    e.getAttribute("relative").match(/\S+=\S+/g).forEach(function (str) {
      var _s = str.split("=");
      var key = _s[0].replace(/-([a-z])/, function (_t, _d) {
          return _d.toUpperCase()
        });
      var value;
      if (_s[1].charAt(0) == '-' || _s[1].charAt(0) == '+') {
        var px = getComputedStyle(e.parentElement || e.parentNode || dom)[key];
        value = parseInt(px) + parseInt(_s[1]) + px.replace(/-?\d*/, "");
      } else {
        value = _s[1]
      }
      if (value == "parent") {
        e.style[key] = getComputedStyle(e.parentElement || e.parentNode || dom)[key];
      } else {
        e.style[key] = value;
      }
    });
  });
};

/**
 * obj 作为键值对，遍历obj将obj的key作为name查找页面上所有元素，将其值刷新。<br>
 * 传入{mydiv:"dis"}，则页面上所有name为mydiv的元素value 或 innerText设置为 "dis"
 */
base.freshNams = function (obj, dom) {
  dom = dom || document;
  for (var name in obj) {
    [].slice.call(dom.querySelectorAll('[name="' + name + '"]')).forEach(function (e) {
      if (e.tagName == "INPUT" || e.tagName == "input") {
        e.value = obj[name];
      } else {
        e.innerText = obj[name];
        e.textContent = obj[name];
      }
    });
  }
};
