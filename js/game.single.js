/**
 * Singleplayer (local) game
 */
Game.Single = OZ.Class().extend(Game.Client);

Game.Single.prototype.init = function(name, shipOptions, enemies) {
	Game.Client.prototype.init.call(this, name, shipOptions);

	for (var i=0;i<enemies;i++) { 
		this._addRandomPlayer(); 
	}
	
	for (var id in this._players) {
		var player = this._players[id];
		if (player != this._player) { player.setRandomTarget(); }
	}
}

Game.Single.prototype._shipCreate = function(e) {
	if (e.target.getPlayer() == this._player) {
		this._keyboard.setControl(e.target.getControl());
	}
}

Game.Single.prototype._shipDeath = function(e) {
	if (e.target.getPlayer() == this._player) {
		this._keyboard.setControl(null);
	}
}

Game.Single.prototype._addRandomPlayer = function() {
	var opt = Ship.random();
	opt.position = [
		Math.random()*this._size[0],
		Math.random()*this._size[1]
	];
	opt.weaponType = Math.floor(Math.random()*3);
	
	var player = this._addPlayer(Player.AI, "AI #" + Math.round(100*Math.random()+1)).setShipOptions(opt);
	player.createShip();
}
