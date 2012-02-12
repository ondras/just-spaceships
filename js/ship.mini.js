Ship.Mini = OZ.Class().extend(HAF.Actor);
Ship.Mini.prototype.init = function(game, color) {
	this._game = game;
	this._color = color;
	this._size = this._game.getSize();
	this._dirty = false;
	this._position = [0, 0];
	game.getEngine().addActor(this, Game.LAYER_MAP);
}

Ship.Mini.prototype.setPosition = function(position) {
	this._position = position;
	this._dirty = true;
	return this;
}

Ship.Mini.prototype.tick = function(dt) {
	return this._dirty;
}

Ship.Mini.prototype.draw = function(context) {
	var port = this._game.getPort();
	var map = this._game.getMap().getSize();
	
	var scale = [0, 0];
	var pos = [0, 0];
	
	for (var i=0;i<2;i++) {
		scale[i] = map[i]/this._size[i];
		pos[i] = Math.round(this._position[i]*scale[i]);
	}
	
	context.fillStyle = this._color;
	context.fillRect(pos[0]-1, pos[1]-1, 3, 3);
	
	this._dirty = false;
}

Ship.Mini.prototype.die = function() {
	this._game.getEngine().removeActor(this, Game.LAYER_MAP);
}
