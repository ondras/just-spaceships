var Pilot = OZ.Class();
Pilot.prototype.init = function(game, ship, name) {
	this._game = game;
	this._ship = ship;
	this._name = name || "Pilot #" + Math.ceil(Math.random()*100);
	this._control = this._ship.getControl();
	this._phys = this._ship.getPhys();
	this._score = 0;
}

Pilot.prototype.getName = function() {
	return this._name;
}

Pilot.prototype.addKill = function() {
	this._ship.showLabel("+1 kill", {color:"green", size:30});
}

Pilot.prototype.act = function() {
}
