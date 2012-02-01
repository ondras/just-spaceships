Weapon.Projectile = OZ.Class().extend(HAF.Sprite);
Weapon.Projectile.prototype.init = function(game, weapon, position, orientation) {
	this._game = game;
	this._size = game.getSize();
	this._weapon = weapon;
	this._distance = 0;
	
	var size = [96, 96];
	var image = Game.Image.get("plasma", size);
	HAF.Sprite.prototype.init.call(this, image, size);
	
	var speed = weapon.getSpeed();
	var angle = orientation*Math.PI/180;
	this._phys = {
		position: position,
		velocity: [Math.cos(angle)*speed, Math.sin(angle)*speed]
	}
	
	this._game.getEngine().addActor(this, "ships"); /* fixme ships? */
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
		this._game.getEngine().removeActor(this, "ships");
		changed = true;
	}
	
	return changed;
}

Weapon.Projectile.prototype.draw = function(context) {
	/* FIXME ne kdyz neni v portu */

	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._sprite.position[i] - offset[i]).mod(this._size[i]);
	}
	
	/* FIXME predpocitat natoceni */
	var angle = Math.atan2(this._phys.velocity[1], this._phys.velocity[0]);
	
	context.save();
	context.translate(tmp[0], tmp[1]);
	context.rotate(angle + Math.PI/2);
	context.translate(-tmp[0], -tmp[1]);
	
	context.drawImage(this._sprite.image, tmp[0]-this._sprite.size[0]/2, tmp[1]-this._sprite.size[1]/2);
	
	context.restore();
}
