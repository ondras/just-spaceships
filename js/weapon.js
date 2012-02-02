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
	return 1;
}

Weapon.prototype.isReady = function() {
	var ts = Date.now();
	return (ts - this._ts >= this._delay);
}

/**
 * Fire this weapon
 * FIXME nemohly by se ty hodnoty ziskat od lodi?
 * @param {number[]} position initial projectile's position
 * @param {number} orientation ship's orientation (degrees)
 * @param {number[]} velocity ship's velocity
 * @returns {Weapon.Projectile} projectile or false (unable to fire)
 */
Weapon.prototype.fire = function(position, orientation, velocity) {
	this._ts = Date.now();
	
	var k = 0.5;
	var v = [
		k*velocity[0] + this._speed * Math.cos(orientation),
		k*velocity[1] + this._speed * Math.sin(orientation)
	];
	
	return new Weapon.Projectile(this._game, this, position, v);
}
