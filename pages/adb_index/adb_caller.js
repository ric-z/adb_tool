var ADB = function (adbPath) {
	let async = new (require("../common/js/async.js"));
	let _deviceID;
    let exec = require('child_process').spawn;
	this.wmSize;
	this.setDeviceID = (deviceID) => {
		_deviceID = deviceID;
	}
	let callabs = (cmd, _cb, sleep) => {
		let fun = () => {
			cmd = (cmd instanceof Function) ? cmd() : cmd;
			cmd.forEach((m,ind) => {
				if (m.startsWith("$eval: "))
				cmd[ind] = eval(m);
			});
			let ls = exec(adbPath, cmd);
			let rs;
			let er;
			ls.stdout.on('data', (data) => {
				rs = data.toString().split("\r\n");
			});
			ls.stderr.on('data', (data) => {
				er = data.toString();
			});
			ls.on('exit', () => {
				_cb && setImmediate(_cb, rs, er);
				if (sleep) setTimeout(async.next, sleep);
				else async.next();
				console.log(cmd)
			})
		}
		async.call(fun);
	}
	this.start = (cb) => {
		callabs(['start-server'], cb);
	}
	this.stop = (cb) => {
		callabs(['kill-server'], cb);
	}
	this.getWMSize = (cb) => {
		if (this.wmSize) {cb && cb(this.wmSize)}
		callabs(["shell","wm","size"], (rs) => {
			let list = rs[0].replace("Physical size: ","").split("x");
			this.wmSize = {width:parseInt(list[0]),height:parseInt(list[1])};
			cb && cb(wmSize);
		});
	}
	this.devices = (cb) => {
		callabs(['devices'], (rs) => {
			let list = [];
			rs.forEach((line) => {
				if (/^\w+\sdevice$/.test(line)) {list.push(line.replace(/\sdevice/,""))}
			});
			cb && cb(list);
		});
	}
	this.screenShot = (path, cb) => {
		callabs(["shell","/system/bin/screencap","-p","/sdcard/screenshot.png"]);
		callabs(["pull","/sdcard/screenshot.png",path], cb);
	}
	this.swipe = (start, end) => {
		callabs(["shell","input","swipe",start.x,start.y,end.x,end.y],null,10000);
	}
	this.swipeL = (len) => {
		this.swipe({x:wmSize.width/2,y:wmSize.height/2},{x:len.width+wmSize.width/2,y:len.height+wmSize.height/2});
	}
	this.tap = (point) => {
		callabs(["shell","input","tap",point.x,point.y]);
	}
};
