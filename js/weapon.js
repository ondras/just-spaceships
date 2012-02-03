var Weapon = OZ.Class();

Weapon.prototype.init = function(game, ship) {
	this._game = game;
	this._ship = ship;
	this._speed = 800;
	this._ts = 0; /* timestamp of last shot */
	this._delay = 200;
}

Weapon.prototype.getRange = function() {
	return 800;
}

Weapon.prototype.getShip = function() {
	return this._ship;
}

Weapon.prototype.getDamage = function() {
	return 50;
}

Weapon.prototype.isReady = function() {
	var ts = Date.now();
	return (ts - this._ts >= this._delay);
}

/**
 * Fire this weapon
 * @param {number[]} position initial projectile's position
 * @returns {Weapon.Projectile}
 */
Weapon.prototype.fire = function(position) {
	this._ts = Date.now();
	var phys = this._ship.getPhys();
	var o = phys.orientation;
	var v = phys.velocity.clone();
	
	var k = 0.5;
	v[0] = k*v[0] + this._speed * Math.cos(o);
	v[1] = k*v[1] + this._speed * Math.sin(o);
	
	return new Weapon.Projectile(this._game, this, position, v);
}
