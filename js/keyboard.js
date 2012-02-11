var Keyboard = OZ.Class();

Keyboard.prototype.init = function() {
	this._control = null;
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Keyboard.prototype.setControl = function(control) {
	this._control = control;
}

Keyboard.prototype._keydown = function(e) {
	if (!this._control) { return; }

	switch (e.keyCode) {
		case 17:
		case 32:
			this._control.fire = true;
		break;
		case 37:
			this._control.torque.mode = 2;
			this._control.torque.target = -1;
		break;
		case 39:
			this._control.torque.mode = 2;
			this._control.torque.target = +1;
		break;
		
		case 38:
			this._control.engine = 1;
		break;
		case 40:
			this._control.engine = -1;
		break;
	}
	/* FIXME jen pri zmene? */
	this.dispatch("keyboard-change");
}

Keyboard.prototype._keyup = function(e) {
	if (!this._control) { return; }

	switch (e.keyCode) {
		case 17:
		case 32:
			this._control.fire = false;
		break;
		
		case 37:
		case 39:
			this._control.torque.mode = 0;
		break;
		
		case 38:
		case 40:
			this._control.engine = 0;
		break;
		
	}
	/* FIXME jen pri zmene? */
	this.dispatch("keyboard-change");
}
