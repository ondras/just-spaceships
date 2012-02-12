Weapon.Projectile = OZ.Class().extend(HAF.Sprite);
Weapon.Projectile.prototype.init = function(game, weapon, position, velocity) {
	this._game = game;
	this._size = game.getSize();
	this._weapon = weapon;
	this._distance = 0;
	
	this._phys = {
		position: position,
		velocity: velocity
	}

	var size = [106, 106];
	var angle = 90 + 180 * Math.atan2(this._phys.velocity[1], this._phys.velocity[0]) / Math.PI;
	angle = 10*Math.round(angle/10);
	
	var image = HAF.Sprite.get("img/plasma3.png", size, angle, true);
	HAF.Sprite.prototype.init.call(this, image, size);
	
	this._game.getEngine().addActor(this, Game.LAYER_FX);
	
	if (this._game.inPort(position, 0)) { Game.Audio.play("shot"); }
}

Weapon.Projectile.prototype.tick = function(dt) {
	var changed = false;
	dt /= 1000;
	var dist = 0;
	
	for (var i=0;i<2;i++) {
		var delta = dt*this._phys.velocity[i];
		dist += delta*delta;
		this._phys.position[i] = (this._phys.position[i] + delta).mod(this._size[i]);
		var px = Math.round(this._phys.position[i]);
		if (px != this._sprite.position[i]) {
			this._sprite.position[i] = px;
			changed = true;
		}
	}
	
	this._distance += Math.sqrt(dist);
	if (this._distance >= this._weapon.getRange()) {
		this._game.getEngine().removeActor(this, Game.LAYER_FX);
		changed = true;
	} else { /* check targets */
		var thisShip = this._weapon.getShip();
		var players = this._game.getPlayers();
		for (var id in players) {
			var ship = players[id].getShip();
			if (!ship || ship == thisShip) { continue; }
			if (ship.collidesWith(this._phys.position)) {
				ship.damage(this._weapon);
				this._game.getEngine().removeActor(this, Game.LAYER_FX);
				changed = true;
				break;
			}
		}
	}
	
	return changed;
}

Weapon.Projectile.prototype.draw = function(context) {
	if (!this._game.inPort(this._sprite.position, 100)) { return; } /* do not draw outside of port */

	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._sprite.position[i] - offset[i]).mod(this._size[i]);
	}
	
	context.drawImage(this._sprite.image, tmp[0]-this._sprite.size[0]/2, tmp[1]-this._sprite.size[1]/2);
}
