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
	var angle = Math.PI/2 + Math.atan2(this._phys.velocity[1], this._phys.velocity[0]);
	
	var image = HAF.Sprite.get("img/plasma3.png", size, angle, false);
//	var image = HAF.Sprite.get("img/plasma3.png", size, 0, true);
	HAF.Sprite.prototype.init.call(this, image, size);
	
	this._game.getEngine().addActor(this, "fx");
	
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
		this._game.getEngine().removeActor(this, "fx");
		changed = true;
	} else { /* check targets */
		var thisShip = this._weapon.getShip();
		var ships = this._game.getShips();
		for (var i=0;i<ships.length;i++) {
			var ship = ships[i];
			if (ship == thisShip) { continue; }
			if (ship.collidesWith(this._phys.position)) {
				ship.damage(this._weapon);
				this._game.getEngine().removeActor(this, "fx");
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
