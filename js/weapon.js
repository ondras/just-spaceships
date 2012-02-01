var Weapon = OZ.Class();

Weapon.prototype.init = function(game) {
	this._game = game;
}

Weapon.prototype.getSpeed = function() {
	return 800;
}

Weapon.prototype.getRange = function() {
	return 800;
}

Weapon.prototype.fire = function(position, orientation) {
	new Weapon.Projectile(this._game, this, position, orientation);
}
