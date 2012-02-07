Player.Human = OZ.Class().extend(Player);

Player.Human.prototype.init = function(game, name, shipOptions) {
	Player.prototype.init.call(this, game, name, shipOptions);

	OZ.Event.add(window, "keydown", this._keydown.bind(this));
	OZ.Event.add(window, "keyup", this._keyup.bind(this));
}

Player.Human.prototype._keydown = function(e) {
	if (this._ship) { return; }
}

Player.Human.prototype._keyup = function(e) {
	if (this._ship) { return; }
}
