Game.Image = OZ.Class();
Game.Image._all = {};
Game.Image.get = function(name, size) {
	if (!this._all[name]) {
		this._all[name] = new this(name);
	}
	
	return this._all[name].getSize(size);
}

Game.Image.prototype.init = function(name) {
	this._img = OZ.DOM.elm("img", {src:"img/"+name+".png"});
	this._sizes = {};
	this._event = OZ.Event.add(this._img, "load", this._load.bind(this));
}

Game.Image.prototype.getSize = function(size) {
	var key = size.join(",");

	if (!this._sizes[key]) { this._sizes[key] = OZ.DOM.elm("canvas", {width:size[0], height:size[1]}); }
	if (!this._event) { this._resize(key); }
	
	return this._sizes[key];
}

Game.Image.prototype._resize = function(key) {
	var canvas = this._sizes[key];
	var context = canvas.getContext("2d");
	context.drawImage(this._img, 0, 0, canvas.width, canvas.height);
}

Game.Image.prototype._load = function(e) {
	OZ.Event.remove(this._event);
	
	for (var p in this._sizes) {
		this._resize(p);
	}
}
