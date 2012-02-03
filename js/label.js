var Label = OZ.Class().extend(HAF.Actor);
Label.prototype.init = function(game, text, position, options) {
	this._game = game;
	this._size = this._game.getSize();
	this._options = {
		color: "red",
		time: 2000,
		speed: [0, -100],
		size: 20,
		opacity: 0.8
	}
	for (var p in options) { this._options[p] = options[p]; }
	this._position = position;
	this._pxPosition = [0, 0];
	this._time = 0;
	
	this._canvas = OZ.DOM.elm("canvas", {height:this._options.size});
	var font = "bold " + this._options.size + "px sans-serif";
	var context = this._canvas.getContext("2d");
	context.font = font;
	this._canvas.width = context.measureText(text).width;
	
	context.globalAlpha = this._options.opacity;
	context.font = font;
	context.textBaseline = "top";
	context.fillStyle = this._options.color;
	context.fillText(text, 0, 0);
	
	this._position[0] -= this._canvas.width/2;
	this._position[1] -= this._canvas.height/2;
	
	this._game.getEngine().addActor(this, "fx");
}

Label.prototype.tick = function(dt) {
	this._time += dt;
	
	if (this._time > this._options.time) {
		this._game.getEngine().removeActor(this, "fx");
		return true;
	}
	
	var changed = false;
	for (var i=0;i<2;i++) {
		this._position[i] += this._options.speed[i] * dt / 1000;
		var px = Math.round(this._position[i]);
		if (px != this._pxPosition[i]) {
			this._pxPosition[i] = px;
			changed = true;
		}
	}
	
	return changed;
}

Label.prototype.draw = function(context) {	
	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._pxPosition[i] - offset[i]).mod(this._size[i]);
	}
	
	context.drawImage(this._canvas, tmp[0], tmp[1]);
}
