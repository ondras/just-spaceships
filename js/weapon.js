var Weapon = OZ.Class();

Weapon.prototype.init = function(game) {
	this._game = game;
	this._speed = 800;
}

Weapon.prototype.getRange = function() {
	return 800;
}

/**
 * Fire this weapon
 * @param {number[]} position initial projectile's position
 * @param {number} orientation ship's orientation (degrees)
 * @param {number[]} velocity ship's velocity
 */
Weapon.prototype.fire = function(position, orientation, velocity) {
	var k = 0.5;
	var v = [
		k*velocity[0] + this._speed * Math.cos(orientation*Math.PI/180),
		k*velocity[1] + this._speed * Math.sin(orientation*Math.PI/180)
	];
	
	new Weapon.Projectile(this._game, this, position, v);
}
