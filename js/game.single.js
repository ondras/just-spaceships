/**
 * Singleplayer (local) game
 */
Game.Single = OZ.Class().extend(Game.Client);

Game.Single.prototype.init = function(name) {
	Game.Client.prototype.init.call(this, name);
	this._initShips();
}

Game.Single.prototype._initShips = function() {
	this._addRandomShip();
	this._addRandomShip();
	this._addRandomShip();
	this._addRandomShip();
}

Game.Single.prototype._shipDeath = function(e) {
	Game.prototype._shipDeath.call(this, e);
	this._addRandomShip();
}

Game.Single.prototype._addRandomShip = function() {
	var opt = Ship.random();
	opt.position = [
		Math.random()*this._size[0],
		Math.random()*this._size[1]
	];
	
	var ship = this._addShip(opt);
	var ai = new Game.AI(this, ship);
	ai.setRandomTarget();
}

Game.Single.prototype._initPlayer = function(options) {
	Game.Client.prototype._initPlayer.call(this, options);
	
	/* keyboard controls this ship */
	new Game.Keyboard(this._player.getControl());
}
