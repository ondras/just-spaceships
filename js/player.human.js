Player.Human = OZ.Class().extend(Player);

Player.Human.prototype.init = function(game, name, id) {
	Player.prototype.init.call(this, game, name, id);

	this._oldTick = null;
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Player.Human.prototype.createShip = function() {
	var ship = Player.prototype.createShip.call(this);
	this._oldTick = ship.tick;
	ship.tick = this._tick.bind(this);
}

Player.Human.prototype._keydown = function(e) {
	if (this._ship) { return; }
}

Player.Human.prototype._keyup = function(e) {
	if (this._ship) { return; }
}

Player.Human.prototype._tick = function(dt) {
	var tickResult = this._oldTick.call(this._ship, dt);

	var position = this._ship.getPhys().position;
	var size = this._game.getSize();
	var offset = this._game.getOffset();
	var port = this._game.getPort();
	var limit = 200;
	var offsetChanged = false;

	for (var i=0;i<2;i++) {
		var portPosition = Math.round(position[i] - offset[i]).mod(size[i]);

		if (portPosition < limit) {
			offsetChanged = true;
			offset[i] -= limit - portPosition;
		} else if (portPosition > port[i]-limit) {
			offsetChanged = true;
			offset[i] += portPosition - (port[i]-limit);
		}
	}
	
	if (offsetChanged) { 
		this._game.setOffset(offset);
	}
}
