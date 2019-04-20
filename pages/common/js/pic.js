const nativeImage = require('electron').nativeImage;

function Pic(picData, size) {
	let _size = size;
	this.getSize = () => {return _size}
	let _picData = picData;
	this.load = (path, height, width) => {
		let img = nativeImage.createFromPath(path);
		if (height || width) {img = img.resize({height:height,width:width})}
		let buffer = img.getBitmap();
		_size = img.getSize();
		_picData = new Uint8Array(_size.height * _size.width);
		for (let i = 0;i < buffer.length;i += 4) {
			let ind = i / 4;
			let s = Math.floor((buffer[i] + buffer[i+1] + buffer[i+2]) / 3);
			//s = Math.floor(s / 10) * 10;
			_picData[ind] = s;
		}
	}
	this.getDataUrl = () => {
		let d = new Uint8Array(_size.height * _size.width * 4);
		for (let i = 0;i < _picData.length;i ++) {
			d[i*4] = _picData[i];
			d[i*4+1] = _picData[i];
			d[i*4+2] = _picData[i];
			d[i*4+3] = 255;
		}
		let newImg = nativeImage.createFromBuffer(d, _size);
		return newImg.toDataURL();
	}
	this.cut = (bounds) => {
		let _data = new Uint8Array(bounds.height * bounds.width);
		for (let h = 0;h < bounds.height;h ++) {
			for (let w = 0;w < bounds.width;w ++) {
				_data[h * bounds.width + w] = _picData[(h + bounds.y)*_size.width + bounds.x + w];
			}
		}
		return new Pic(_data,{height:bounds.height,width:bounds.width});
	}
	this.getPix = (x, y) => {
		return _picData[y*_size.width + x];
	}
	this.setPix = (x, y, value) => {
		_picData[y*_size.width + x] = value;
	}
	let _hash;
	this.getHash = () => {
		if (_hash) {return _hash}
		let d = new Uint8Array(_size.height * _size.width * 4);
		for (let i = 0;i < _picData.length;i ++) {
			d[i*4] = _picData[i];
			d[i*4+1] = _picData[i];
			d[i*4+2] = _picData[i];
			d[i*4+3] = 255;
		}
		let newImg = nativeImage.createFromBuffer(d, _size);
		newImg = newImg.resize({height:16,width:17});
		let _buffer = newImg.getBitmap();
		_hash = "";
		for (let h = 0;h < 16;h ++) {
			let hs = "";
			for (let w = 0;w < 16;w ++) {
				hs += _buffer[(h*16+w)*4]>_buffer[(h*16+w+1)*4] ? "1" : "0";
			}
			_hash += parseInt(hs,2).toString(32);
		}
		return _hash;
	}
	this.equal = (pic) => {
		return this.getHash() == pic.getHash();
	}
}
