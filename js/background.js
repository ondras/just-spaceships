var Background = OZ.Class().extend(HAF.Actor);

Background.prototype.init = function(game) {
	this._game = game;
	this._size = game.getSize();
}

Background.prototype.tick = function() {
	return true;
}

Background.prototype.draw = function(context) {
	context.fillStyle = "#aaa";
	var offset = this._game.getOffset();
	for (var i=0;i<this._size[0];i+=100) {
		for (var j=0;j<this._size[1];j+=100) {
			context.beginPath();
			context.moveTo((i - offset[0]).mod(this._size[0]), (j - offset[1]).mod(this._size[1]));
			context.arc((i - offset[0]).mod(this._size[0]), (j - offset[1]).mod(this._size[1]), 10, 0, 2*Math.PI, true);
			context.fill();
		}
	}
}
