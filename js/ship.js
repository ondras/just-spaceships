var Ship = OZ.Class().extend(HAF.AnimatedSprite);

Ship.types = {
	yellow: {
		image: "Gaalian_Ranger_64",
		color: "#cc0",
		frames: 82
	},
	blue: {
		image: "People_Ranger_64",
		color: "#00f",
		frames: 99
	},
	red: {
		image: "Maloc_Pirate_64",
		color: "#f00",
		frames: 99
	}
}

Ship.prototype.init = function(game, options) {
	this._game = game;
	this._options = {
		type: "yellow",
		size: [64, 64],
		maxForce: 500, /* pixels per weight per second^2 in vacuum */
		maxTorque: 150 * Math.PI/180 /* degrees per second */
	};
	for (var p in options) { this._options[p] = options[p]; }

	var def = Ship.types[this._options.type];

	var largeSize = [this._options.size[0], this._options.size[1]*def.frames];
	var image = HAF.Sprite.get("img/"+def.image+".png", largeSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, this._options.size, def.frames);
	
	this._animation.fps = 10;

	this._weapon = new Weapon(this._game, this);	
	this._size = game.getSize();
	this._alive = true;

	this._control = {
		engine: 0,
		torque: 0
	}

	this._phys = {
		mass: 1,
		orientation: 0,
		position: [this._size[0]/2, this._size[1]/2],
		velocity: [0, 0] /* pixels per second */
	}
	
	this._mini = new Ship.Mini(game, def.color);
	game.getEngine().addActor(this, "ships");
}

Ship.prototype.tick = function(dt) {
	var changed = HAF.AnimatedSprite.prototype.tick.call(this, dt);
	if (!this._alive) { return changed; } /* FIXME */

	dt /= 1000;

	if (this._control.torque) {
		this._phys.orientation = (this._phys.orientation + this._options.maxTorque * this._control.torque * dt / this._phys.mass).mod(2*Math.PI);
		changed = true;
	}
	
	for (var i=0;i<2;i++) {
		if (this._control.engine) { /* engines add force => velocity */
			var force = (this._control.engine > 0 ? 1 : 0.5) * this._options.maxForce * this._control.engine;
			force *= (i ? Math.sin : Math.cos)(this._phys.orientation);
			this._phys.velocity[i] += force * dt / this._phys.mass;
		}
		
		/* drag => decay of velocity */ 
		this._phys.velocity[i] -= this._phys.velocity[i] * Math.min(1, dt * 0.5 / this._phys.mass);

		/* move ship */
		this._phys.position[i] = (this._phys.position[i] + this._phys.velocity[i] * dt).mod(this._size[i]);
		
		var px = Math.round(this._phys.position[i]);
		if (px != this._sprite.position[i]) {
			this._sprite.position[i] = px;
			changed = true;
		}
		
	}
	
	if (!this._control.engine) { /* too slow => stop */
		var v = this._phys.velocity;
		if (v[0]*v[0] + v[1]*v[1] < 50) { 
			this._phys.velocity[0] = 0;
			this._phys.velocity[1] = 0;
		}
	}
	
	if (changed) { this._mini.setPosition(this._sprite.position); }

	return changed;
}

Ship.prototype.draw = function(context) {
	/* FIXME ne kdyz neni v portu */
	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._sprite.position[i] - offset[i]).mod(this._size[i]);
	}

/*
	var a = this._phys.orientation; 
	var b = (this._phys.orientation + Math.PI/2); 
	context.beginPath();
	
	context.moveTo(tmp[0] + 10*Math.cos(b), tmp[1] + 10*Math.sin(b));
	context.lineTo(tmp[0] + 10*Math.cos(a), tmp[1] + 10*Math.sin(a));
	context.lineTo(tmp[0] - 10*Math.cos(b), tmp[1] - 10*Math.sin(b));
	
	context.lineWidth = this._phys.mass;
	context.strokeStyle = this._options.color;
	context.stroke();
*/

	var angle = Math.PI/2 + this._phys.orientation;

	context.save();
	
	context.translate(tmp[0], tmp[1]);
	context.rotate(angle);
	context.translate(-tmp[0], -tmp[1]);
/*
	context.drawImage(
		this._sprite.image, 
		tmp[0]-this._sprite.size[0]/2, tmp[1]-this._sprite.size[1]/2
	);
*/

	context.drawImage(
		this._sprite.image, 
		0, this._animation.frame*this._sprite.size[1], this._sprite.size[0], this._sprite.size[1],
		tmp[0]-this._sprite.size[0]/2, tmp[1]-this._sprite.size[1]/2, this._sprite.size[0], this._sprite.size[1]
	);

	context.restore();
}

Ship.prototype.collidesWith = function(position) {
	var dx = position[0]-this._phys.position[0];
	var dy = position[1]-this._phys.position[1];
	var r = this._sprite.size[0]/2; /* FIXME cachovat */
	return (dx*dx+dy*dy < r*r);
}

Ship.prototype.damage = function(weapon) {
	var amount = weapon.getDamage();
	/* FIXME hitpoints */
	
	this.die();
}

Ship.prototype.die = function() {
	this._alive = false;
	this._mini.die();
	this.dispatch("ship-death");
	new Explosion(this._game, this._sprite.position);
	
	/* FIXME!! */
	setTimeout(function() {
		this._game.getEngine().removeActor(this, "ships");
	}.bind(this), 1000);
}

