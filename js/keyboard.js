Game.Keyboard = OZ.Class();

Game.Keyboard.prototype.init = function(control) {
	this._control = control;
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Game.Keyboard.prototype._keydown = function(e) {
	switch (e.keyCode) {
		case 17:
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

Game.Keyboard.prototype._keyup = function(e) {
	switch (e.keyCode) {
		case 17:
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
