Ship.Player = OZ.Class().extend(Ship);
Ship.Player.prototype.init = function(game) {
	Ship.prototype.init.call(this, game);
	
	this._pressed = {};
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Ship.Player.prototype.tick = function(dt) {
	var visualChanged = Ship.prototype.tick.call(this, dt);
	
	var limit = 200;
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	
	var offsetChanged = false;
	for (var i=0;i<2;i++) {
		var portPosition = (this._pxPosition[i] - offset[i]).mod(this._size[i]);

		if (portPosition < limit) {
			offsetChanged = true;
			offset[i] -= limit - portPosition;
		} else if (portPosition > port[i]-limit) {
			offsetChanged = true;
			offset[i] += portPosition - (port[i]-limit);
		}
	}
	if (offsetChanged) { this._game.setOffset(offset); }
	
	return visualChanged;
}

Ship.Player.prototype._keydown = function(e) {
	if (e.keyCode in this._pressed) { return; }
	this._pressed[e.keyCode] = true;

	var amount = 150;
	switch (e.keyCode) {
		case 37:
			this._phys.torque -= amount;
		break;
		case 39:
			this._phys.torque += amount;
		break;
		
		case 38:
			this._phys.engine = 300;
		break;
		case 40:
			this._phys.engine = -300;
		break;
		
	}
}

Ship.Player.prototype._keyup = function(e) {
	delete this._pressed[e.keyCode];
	
	var amount = 150;
	switch (e.keyCode) {
		case 37:
			this._phys.torque += amount;
		break;
		case 39:
			this._phys.torque -= amount;
		break;
		
		case 38:
		case 40:
			this._phys.engine = 0;
		break;
		
	}
}
