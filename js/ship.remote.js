Ship.Remote = OZ.Class().extend(Ship);
Ship.Remote.prototype.init = function(game, position) {
	Ship.prototype.init.call(this, game, {color:"green", position:position});
}

Ship.prototype.setPosition = function(position) {
	this._phys.position = position;
}

