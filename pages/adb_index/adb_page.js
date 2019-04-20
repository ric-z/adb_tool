let utils = require("../common/js/utils.js");
let adb_set = utils.getStorage({name:"set-adb"}) || {};
if (!adb_set.adb_path) {
 showMsg("请先设置 adb 路径");
 window.close();
}
let adb = new ADB(adb_set.adb_path);
adb.start();
window.onload = () => {
 adb.devices(devs => {
  if (devs.length !== 1) {
   showMsg("未找到对应设备");
  }
  let _html = document.body.innerHTML;
  let html = "";
  devs.forEach(dev => {
   html += _html.replace(/\$\{dev\}/g, dev);
  });
  document.body.innerHTML = html;
 });
};

function fresh(devid) {
 let path = adb_set.adb_path.replace(/\w*\.\w+$/, devid + ".png");
 adb.screenShot(path, () => {
  showMsg("截图保存在：" + path);
  base.select(`#panel_${devid} img`)[0].src = path + "?v=" + Math.random()
 });
}