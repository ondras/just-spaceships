var A = [];

Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

var Game = OZ.Class();
Game.prototype.init = function() {
	this._size = [1000, 1000];
	this._port = [500, 500];
	this._offset = [0, 0];
	
	this._engine = new HAF.Engine(this._port);
	document.body.appendChild(this._engine.getContainer());
	this._engine.addCanvas("bg");
	this._engine.addCanvas("ships");
	
	this._engine.addActor(new Background(this), "bg");
	this._engine.addActor(new Ship.Player(this), "ships");
	
	var ai = new Ship(this);
	ai._phys.engine = 100;
	this._engine.addActor(ai, "ships");
	
	this._engine.start();
}

Game.prototype.getSize = function() {
	return this._size;
}

Game.prototype.getPort = function() {
	return this._port;
}

Game.prototype.getOffset = function() {
	return this._offset;
}

Game.prototype.setOffset = function(offset) {
	this._offset[0] = offset[0].mod(this._size[0]);
	this._offset[1] = offset[1].mod(this._size[1]);
	return this._offset;
}
