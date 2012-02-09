var Player = OZ.Class();

Player.prototype.init = function(game, name, id, score) {
	this._game = game;
	this._name = name;
	this._id = id || Math.random().toString().replace(/\D/g, "");
	this._score = score || 0;
	this._ship = null;
	this._shipOptions = {};

	OZ.Event.add(null, "ship-death", this._shipDeath.bind(this));
}

Player.prototype.setShipOptions = function(options) {
	this._shipOptions = options;
	return this;
}

Player.prototype.getShipOptions = function() {
	return this._shipOptions;
}

Player.prototype.createShip = function() {
	if (this._ship) { return; }
	this._ship = new Ship(this._game, this, this._shipOptions);
	return this._ship;
}

Player.prototype.getScore = function() {
	return this._score;
}

Player.prototype.addKill = function() {
	this._score++;
	if (this._ship) { this._ship.showLabel("+1 kill", {color:"green", size:30}); }
}

Player.prototype.getName = function() {
	return this._name;
}

Player.prototype.getShip = function() {
	return this._ship;
}

Player.prototype.getId = function() {
	return this._id;
}

Player.prototype._shipDeath = function(e) {
	if (e.target == this._ship) { this._ship = null; } /* our ship died */
}
