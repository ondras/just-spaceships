Player.UI = OZ.Class().extend(Keyboard);

Player.UI.prototype.init = function(game, name, shipOptions) {
	Player.prototype.init.call(this, game, name, shipOptions);

	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Player.UI.prototype._keydown = function(e) {
	if (!this._ship) { return; }
	var control = this._ship.getControl();

	switch (e.keyCode) {
		case 17:
			control.fire = true;
		break;
		case 37:
			control.torque.mode = 2;
			control.torque.target = -1;
		break;
		case 39:
			control.torque.mode = 2;
			control.torque.target = +1;
		break;
		
		case 38:
			control.engine = 1;
		break;
		case 40:
			control.engine = -1;
		break;
	}
}

Player.UI.prototype._keyup = function(e) {
	if (!this._ship) { return; }
	var control = this._ship.getControl();

	switch (e.keyCode) {
		case 17:
			control.fire = false;
		break;
		
		case 37:
		case 39:
			control.torque.mode = 0;
		break;
		
		case 38:
		case 40:
			control.engine = 0;
		break;
		
	}
}
