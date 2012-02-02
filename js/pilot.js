var Pilot = OZ.Class();
Pilot.prototype.init = function(name, ship) {
	this._name = name || "Pilot #" + Math.ceil(Math.random()*100);
	this._ship = ship;
	this._control = this._ship.getControl();
	this._phys = this._ship.getPhys();
}

Pilot.prototype.getName = function() {
	return this._name;
}

Pilot.prototype.act = function() {
}
