module.exports = function() {
	let _lis = [];
	let sflag;
	let next = () => {
		if (_lis.length == 0) {sflag = false;return;}
		setImmediate(_lis.shift());
	};
	this.next = next;
	this.call = (fun) => {
		_lis.push(fun);
		if (!sflag) {
			sflag = true;
			next();
		}
	}
}