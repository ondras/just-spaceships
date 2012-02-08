Player.Human = OZ.Class().extend(Player);

Player.Human.prototype.init = function(game, name, id) {
	Player.prototype.init.call(this, game, name, id);

	this._oldTick = null;
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
	
	this._idleNode = OZ.DOM.elm("div", {innerHTML:"Press Enter to start", className:"idle", position:"absolute"});
	this._idle = false;
	
	this._pan = {
		timeout: null,
		pressed: {
		}
	}

	this.setIdle(true);
}

Player.Human.prototype.setIdle = function(idle) {
	this._idle = idle;
	if (idle) {
		var parent = this._game.getEngine().getContainer();
		parent.appendChild(this._idleNode);
		
		this._idleNode.style.left = Math.round((parent.offsetWidth-this._idleNode.offsetWidth)/2) + "px";
		this._idleNode.style.top = Math.round((parent.offsetHeight-this._idleNode.offsetHeight)/2) + "px";
	} else {
		this._idleNode.parentNode.removeChild(this._idleNode);
	}
}

Player.Human.prototype.createShip = function() {
	this.setIdle(false);
	var ship = Player.prototype.createShip.call(this);
	this._oldTick = ship.tick;
	ship.tick = this._tick.bind(this);
	
	var size = this._game.getSize();
	var port = this._game.getPort();
	var offset = [
		Math.round((size[0]-port[0])/2),
		Math.round((size[1]-port[1])/2),
	];
	this._game.setOffset(offset);
}

Player.Human.prototype._keydown = function(e) {
	if (this._ship) { return; }
	
	switch (e.keyCode) {
		case 13:
			if (this._idle) { this.createShip(); }
		break;
		
		case 37:
		case 39:
		case 38:
		case 40:
			this._pan.pressed[e.keyCode] = true;
			if (!this._pan.timeout) { this._panStep(); }
		break;
	}
}

Player.Human.prototype._keyup = function(e) {
	if (this._ship) { return; }
	
	var kc = e.keyCode;
	if (kc in this._pan.pressed) { delete this._pan.pressed[kc]; }
}

Player.Human.prototype._panStep = function() {
	this._pan.timeout = null;
	var diff = [0, 0];
	for (var code in this._pan.pressed) {
		c = parseInt(code);
		switch (c) {
			case 37:
				diff[0] = -1;
			break;
			case 39:
				diff[0] = 1;
			break;
			case 38:
				diff[1] = -1;
			break;
			case 40:
				diff[1] = 1;
			break;
		}
	}
	
	var offset = this._game.getOffset();
	var changed = false;
	for (var i=0;i<2;i++) {
		if (diff[i]) {
			offset[i] += 10*diff[i];
			changed = true;
		}
	}
	
	if (changed) {
		this._pan.timeout = setTimeout(this._panStep.bind(this), 10);
		this._game.setOffset(offset);
	}
	
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
	
	return tickResult;
}

Player.Human.prototype._shipDeath = function(e) {
	if (e.target == this._ship) { /* our ship died */
		this._ship.tick = this._oldTick;
		this._ship = null; 
		this.setIdle(true);
	} 
}
