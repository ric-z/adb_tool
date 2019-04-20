
const utils = {};
utils.set = (att, value) => {
  utils[att] = value;
};

let getReturn = (arg, res, err) => {
  if (err) {
    arg.errback && arg.errback(err);
    arg.end && arg.end();
    if (!arg.errback) {
      throw err
    }
    return null;
  }
  if (arg.resToJson) {
    res = JSON.parse(res) || {}
  }
  try {
    arg.callback && arg.callback(res);
    arg.end && arg.end();
    return res;
  } catch (e) {
    return getReturn(arg, res, e);
  }
};

let key = "_Check11eaRicf32";
let iv = "3624640204598728";

utils.encode = function (data) {
  let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let crypted = cipher.update(data, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = new Buffer(crypted, 'binary').toString('base64');
  return crypted;
};

utils.decode = function (crypted) {
  crypted = new Buffer(crypted, 'base64').toString('binary');
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decoded = decipher.update(crypted, 'binary', 'utf8');
  decoded += decipher.final('utf8').toString();
  return decoded;
};

/**
 * 获取存储的数据
 */
utils.getStorage = function (arg) {
  var res;
  if (window.localStorage) {
    res = window.localStorage[arg.name];
  }
  if (res) {
    res = JSON.parse(utils.decode(res))
  } else {
    res = {
      isNull: true
    }
  }
  return getReturn(arg, res, null);
}

/**
 * 存储数据 name, value, time/inSession
 */
utils.setStorage = function (arg) {
  if (window.localStorage && !arg.time) {
    window.localStorage[arg.name] = utils.encode(JSON.stringify(arg.value));
    return;
  }
}

/* 以下需要 Node.js 支持 */
var fs = require("fs");
var orgfs = require("original-fs");
const crypto = require('crypto');


/**
 * 判断是否存在
 */
utils.pathExists = function (arg) {
  var res = false;
  if (arg.path) {
    try {
      var stat = fs.statSync(arg.path);
      res = stat && (stat.isFile() || stat.isDirectory());
    } catch (e) {
      console.error(e);
      res = false;
    }
    return getReturn(arg, res, null);
  }
};

/**
 * 读取二进制
 */
utils.readByte = function (arg) {
  const bak = arg.callback;
  delete (arg.callback);
  if (!utils.pathExists(arg)) {
    return getReturn(arg, null, "not exists: " + arg.path);
  }
  if (bak) {
    // 异步读取二进制
    fs.readFile(arg.path, function (err, data) {
      if (err) {
        return getReturn(arg, null, err);
      }
      bak(data);
    });
  } else {
    // 同步读取
    return fs.readFileSync(arg.path);
  }
};

/**
 * 读取为文本
 */
utils.readString = function (arg) {
  if (arg.callback) {
    // 异步读取二进制
    const bak = arg.callback;
    delete (arg.callback);
    if (bak) {
      arg.callback = function (data) {
        bak(data.toString(arg.charset || "utf-8"));
      }
    }
  }
  const result = utils.readByte(arg);
  return result && result.toString(arg.charset || "utf-8");
};

/**
 * 遍历目录
 */
utils.listDir = function (arg) {
  const bak = arg.callback;
  delete (arg.callback);
  if (!utils.pathExists(arg)) {
    return getReturn(arg, null, "not exists: " + arg.path);
  }
  if (bak) {
    fs.readdir(arg.path, function (err, data) {
      if (err) {
        return getReturn(arg, null, err);
      }
      bak(data);
    });
  } else {
    // 同步读取
    return fs.readdirSync(arg.path);
  }
};

/**
 * 保存文件
 */
utils.saveFile = function (arg) {
  if (arg.callback) {
    // 异步
    fs.writeFile(arg.path, arg.data, function (err) {
      if (err) {
        return getReturn(arg, null, err);
      }
      arg.callback && arg.callback();
    });
  } else {
    return fs.writeFileSync(arg.path, arg.data);
  }
};

utils.renameFile = function (arg) {
  fs.rename(arg.oldPath, arg.newPath, (err) => {
    return getReturn(arg, null, err);
  });
};

/**
 * 读取MD5
 */
utils.getFileMD5 = function (arg) {
  const bak = arg.callback;
  delete (arg.callback);
  if (!utils.pathExists(arg)) {
    return getReturn(arg, null, "not exists: " + arg.path);
  }
  arg.callback = bak;
  var md5sum = crypto.createHash('md5');
  var stream = (arg.path.endsWith(".asar") ? orgfs : fs).createReadStream(arg.path);
  stream.on('data', (trunk) => {
    md5sum.update(trunk)
  });
  stream.on('end', () => {
    getReturn(arg, md5sum.digest('hex'), null);
  });
};

utils.getStringMD5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}

module.exports = utils;
