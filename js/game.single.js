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
	var color = ["purple", "green", "red", "blue"].random();
	var mass = 0.5 + Math.random();
	var position = [
		Math.random()*this._size[0],
		Math.random()*this._size[1]
	];
	
	var ship = this._addShip({type:color, mass:mass, position:position});
	var pilot = new Pilot.AI(this, ship, "");
	ship.setPilot(pilot);
	pilot.setRandomTarget();
}

