Ship.Player = OZ.Class().extend(Ship);
Ship.Player.prototype.init = function(game) {
	Ship.prototype.init.call(this, game);
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
	
	this._tmp = 0;
}

Ship.Player.prototype.tick = function(dt) {
	var visualChanged = Ship.prototype.tick.call(this, dt);
	
	var limit = 200;
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	
	var offsetChanged = false;
	for (var i=0;i<2;i++) {
		var portPosition = (this._sprite.position[i] - offset[i]).mod(this._size[i]);

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
	switch (e.keyCode) {
		case 17:
			this._tmp = (this._tmp+1)%2;
			var angle = (this._tmp ? -1 : 1) * Math.PI/2;
			angle += this._phys.orientation;
			var dist = 15;
			
			var pos = [
				this._phys.position[0] + dist * Math.cos(angle),
				this._phys.position[1] + dist * Math.sin(angle)
			];
			var vel = [
				this._phys.velocity[0],
				this._phys.velocity[1]
			]
			this._weapon.fire(pos, this._phys.orientation, vel);
		break;
		case 37:
			this._control.torque = -1;
		break;
		case 39:
			this._control.torque = 1;
		break;
		
		case 38:
			this._control.engine = 1;
		break;
		case 40:
			this._control.engine = -1;
		break;
		
	}
}

Ship.Player.prototype._keyup = function(e) {
	switch (e.keyCode) {
		case 37:
		case 39:
			this._control.torque = 0;
		break;
		
		case 38:
		case 40:
			this._control.engine = 0;
		break;
		
	}
}
