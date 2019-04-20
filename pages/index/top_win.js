const main = {};
main.wins = [];
const mainPanel = base.select("#mainPanel")[0];

main.showOrOpen = (win) => {
  if (base.select('#Root_' + win.id).length > 0) {
    main.show(win.id)
  } else {
    main.open(win)
  }
};

main.createSheet = (win) => {
  let id = win.id || Math.random().toString(36).substr(2);
  win.id = id;
  let sheetDiv = base.select(".sheet")[0];
  let sheetA = document.createElement("A");
  sheetA.setAttribute("id", "Sheet_" + win.id);
  sheetA.addEventListener("click", () => {
    main.showOrOpen(win)
  });
  sheetA.setAttribute("title", win.title);
  sheetA.className = "click";
  if (win.sheetText) {
    sheetA.innerText = win.sheetText + " ";
  }
  if (win.sheetIcon) {
    let img = document.createElement("IMG");
    img.setAttribute("src", win.sheetIcon);
    img.setAttribute("draggable", false);
    sheetA.appendChild(img);
  }
  sheetDiv.appendChild(sheetA);
  return sheetA;
};

main.open = (win) => {
  let id = win.id || Math.random().toString(36).substr(2);
  win.id = id;
  main.wins.push(win);
  if ((win.sheetText || win.sheetIcon) && base.select(".sheet>a#Sheet_" + id).length == 0) {
    main.createSheet(win);
  }
  let rtDiv = document.createElement("DIV");
  rtDiv.setAttribute("id", "Root_" + id);
  rtDiv.setAttribute("relative", "height=-35px width=-10px");
  rtDiv.setAttribute("title", win.title);
  mainPanel.appendChild(rtDiv);
  if (!win.unclose) {
    let closeBtn = document.createElement("A");
    closeBtn.innerText = "✘";
    closeBtn.setAttribute("title", "关闭");
    closeBtn.className = "click";
    rtDiv.appendChild(closeBtn);
    closeBtn.addEventListener("click", (event) => {
      main.current = id;
      main.closeCurrent();
      event.preventDefault();
      event.cancelBubble = true;
      event.stopPropagation();
      return false;
    });
  }
  let titleDiv = document.createElement("DIV");
  titleDiv.setAttribute("relative", "height=-20px width=-20px");
  titleDiv.setAttribute("id", "Title_" + id);
  titleDiv.className = "main-title center click";
  titleDiv.innerText = win.title || "loading...";
  rtDiv.appendChild(titleDiv);
  rtDiv.addEventListener("click", (event) => {
    base.select("#mainPanel")[0].className = "";
    main.show(id);
    base.initDom(rtDiv);
  });
  let webView = document.createElement("WEBVIEW");
  webView.setAttribute("relative", "height=parent width=parent");
  if (win.node) {
    console.log("use nodejs")
    webView.setAttribute("nodeintegration", "true");
  }
  webView.setAttribute("preload", "./injection.js");
  rtDiv.appendChild(webView);
  // menu
  let menuDiv = document.createElement("DIV");
  menuDiv.setAttribute("id", "Menu_" + id);
  rtDiv.appendChild(menuDiv);
  if (win.menu) {
    win.menu.forEach((menu) => {
      let menuA = document.createElement("A");
      let _t = (menu.title || menu.text || "") + (menu.key ? " Ctrl + " + menu.key : "");
      if (_t) {
        menuA.setAttribute("title", titleDiv.innerText + ": " + _t);
      }
      if (menu.text) {
        menuA.style.lineHeight = "20px";
        menuA.className = "click";
        menuA.innerText = menu.text + " ";
      }
      if (menu.icon) {
        let img = document.createElement("IMG");
        img.className = "click";
        img.setAttribute("src", menu.icon);
        img.setAttribute("height", 20);
        img.setAttribute("draggable", false);
        menuA.appendChild(img);
      }
      menuDiv.appendChild(menuA);
      let clicEvent = () => {
        webView.executeJavaScript(menu.js)
      };
      if (menu.key) {
        main.addCtrlKeyEvent(id, menu.key, clicEvent)
      }
      menuA.addEventListener("click", clicEvent);
    });
  }
  main.show(id);
  base.initDom(mainPanel);
  webView.addEventListener("new-window", (event) => {
    if (!win.canOpen || (event.frameName && base.select('#Root_' + event.frameName).length > 0)) {
      base.select('#Root_' + event.frameName + ' webview')[0].loadURL(event.url);
      main.show(event.frameName);
    } else {
      main.open({
        runAt: win.runAt,
        url: event.url,
        id: event.frameName,
        referer: win.url,
        opener: id,
        node: win.node,
        partition: win.partition
      })
    }
  });
  webView.addEventListener("close", () => {
    main.close(id)
  });
  webView.addEventListener("will-navigate", () => {
    rtDiv.setAttribute("domready", false)
  });
  webView.addEventListener(win.runAt || "dom-ready", (event) => {
    if ("did-frame-finish-load" == event.type && !event.isMainFrame) {
      return
    }
    base.initDom(mainPanel);
    webView.insertCSS("::-webkit-scrollbar { width: 8px;}::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);}::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.8); -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);}::-webkit-scrollbar-thumb:window-inactive { background_: rgba(255, 0, 0, 0.8);} html{} " + win.css);
    // tell resize
    const basePath = utils.getStorage({
        name: "sys-set-base"
      }).down_path;
    webView.executeJavaScript(`try{Object.defineProperty(window, "basePath", {value : "${(basePath || "").replace(/\\/g, "\\\\")}",writable : false,configurable : false});${win.js || ""}; window.onresize && window.onresize()}catch(e){console.error(e)}`, false, () => {
      titleDiv.innerText = webView.getTitle();
      rtDiv.setAttribute("title", webView.getTitle());
      rtDiv.setAttribute("domready", true);
    });
  });
  if (win.partition) {
    webView.setAttribute("partition", "persist:" + win.partition)
  }
  webView.setAttribute("useragent", "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36");
  win.referer && webView.setAttribute("httpreferrer", win.referer);
  if (win.param) {
    let _url = win.url + "?";
    for (let str in win.param) {
      _url += `&${str}=${win.param[str]}`;
    }
    webView.setAttribute("src", _url);
  } else {
    webView.setAttribute("src", win.url);
  }
};

main.openAll = () => {
  if (base.select(".show-all").length > 0) {
    if (base.select("#mainPanel>div.active").length > 0) {
      base.select(".show-all")[0].className = "";
      base.initDom();
    }
    return;
  }
  base.select("#mainPanel")[0].className = "show-all";
  base.initDom();
  base.select("#mainPanel.show-all>div[id*=Root_]").forEach((e) => {
    let webview = base.select("webview", e)[0];
    if (webview.parentElement.getAttribute("domready") == "true") {
      webview.capturePage((img) => {
        img = img.resize({
            width: 300,
            height: 220,
            quality: "good"
          });
        let dataUrl = img.toDataURL();
        base.select(".main-title", e)[0].style.backgroundImage = `url(${dataUrl})`;
      });
    }
  });
};

main.show = (id) => {
  base.select("#mainPanel>.active, .nav-left>div.active").forEach((e) => {
    e.className = "";
  });
  base.select(".sheet .click.active").forEach((a) => {
    a.className = "click"
  });
  let sheetA = base.select("#Sheet_" + id)[0];
  if (sheetA) {
    sheetA.className = "click active";
  }
  if (base.select("#Root_" + id).length == 0) {
    main.openAll();
  } else {
    main.current = id;
    base.select("#Root_" + id)[0].className = "active";
    let webview = base.select("#Root_" + id + "[domready]>webview")[0];
    webview && (webview.executeJavaScript("window.onshow && window.onshow()"));
  }
};

main.close = (id) => {
  main.wins.every((win, i) => {
    if (win.id == id) {
      let webview = base.select("#Root_" + id + ">webview")[0];
      webview.executeJavaScript("window.onunload && window.onunload()", false, () => {
        main.wins.splice(i, 1);
        base.select("#Root_" + id)[0].remove();
      });
      return false;
    } else {
      return true;
    }
  });
};

main.closeCurrent = () => {
  // find id
  let next;
  let canClose;
  try {
    main.wins.every((win, i) => {
      next = (main.wins.length > i + 1) ? main.wins[i + 1].id : main.wins[i - 1].id;
      if (win.id == main.current) {
        canClose = !win.unclose;
        next = win.opener || next;
        return false;
      } else {
        return true;
      }
    });
  } catch (e) {
    console.error(e);
  }
  if (canClose) {
    main.close(main.current);
    main.show(next);
  } else {
    showMsg("无法关闭");
  }
};

main.reloadCurrent = () => {
  if (base.select(".show-all").length > 0) {
    return
  }
  let webview = base.select(`#Root_${main.current}>webview`)[0];
  webview.executeJavaScript("window.onunload && window.onunload();window.onunload=null", false, () => {
    showMsg("重新加载");
    base.select(`#Root_${main.current}`)[0].setAttribute("domready", false);
    webview.reload();
  });
};

main.ctrl = {};
main.addCtrlKeyEvent = (id, key, listener) => {
  main.ctrl[id + "_Key" + key] = listener;
};
document.addEventListener("keypress", (event) => {
  if (!event.ctrlKey) {
    return
  }
  let ctrl = main.ctrl[main.current + "_" + event.code];
  if (!ctrl) {
    return
  }
  ctrl.call(event);
  event.preventDefault();
  event.cancelBubble = true;
  event.stopPropagation();
});
