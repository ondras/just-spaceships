/**
 * Singleplayer (local) game
 */
Game.Single = OZ.Class().extend(Game.Client);

Game.Single.prototype.init = function(name, shipOptions, enemies) {
	Game.Client.prototype.init.call(this, name, shipOptions);
	this._initShips(enemies);
}

Game.Single.prototype._initShips = function(enemies) {
	for (var i=0;i<enemies;i++) {
		this._addRandomShip();
	}
}

Game.Single.prototype._shipDeath = function(e) {
	Game.prototype._shipDeath.call(this, e);
	this._addRandomShip();
}

Game.Single.prototype._addRandomPlayer = function() {
	var opt = Ship.random();
	opt.position = [
		Math.random()*this._size[0],
		Math.random()*this._size[1]
	];
	
	var player = this._addPlayer(Player.AI, "Pilot #" + Math.round(100*Math.random()+1), opt);
	player.setRandomTarget();
}

Game.Single.prototype._initPlayer = function(name, shipOptions) {
	Game.Client.prototype._initPlayer.call(this, name, shipOptions);
	
	/* keyboard controls this ship FIXME only when player ship exists */
	new Game.Keyboard(this._player.getControl());
}
