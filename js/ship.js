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
	},
	purple: {
		image: "Feiyan_Ranger_64",
		color: "#f0f",
		frames: 100
	},
	green: {
		image: "Peleng_Pirate_64",
		color: "#0f0",
		frames: 149
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
	this._deathTime = 0;
	
	this._tmp = 0; /* FIXME */

	this._weapon = new Weapon(this._game, this);	
	this._size = game.getSize();
	this._alive = true;
	this._control = {
		engine: 0, /* -1 = full back, 1 = full forward */
		torque: {
			mode: 0, /* 0 = nothing, 1 = target angle, 2 = forever */
			target: 0 /* angle or +- Infinity */
		},
		fire: false
	}
	this._phys = {
		mass: 1,
		orientation: 0,
		decay: 0.5,
		position: [this._size[0]/2, this._size[1]/2],
		velocity: [0, 0] /* pixels per second */
	}
	
	this._pilot = new Pilot.AI("", this);
	this._mini = new Ship.Mini(game, def.color);
	game.getEngine().addActor(this, "ships");
}

Ship.prototype.getPilot = function() {
	return this._pilot;
}

Ship.prototype.getWeapon = function() {
	return this._weapon;
}

Ship.prototype.getControl = function() {
	return this._control;
}

Ship.prototype.getPhys = function() {
	return this._phys;
}

Ship.prototype.tick = function(dt) {
	var changed = HAF.AnimatedSprite.prototype.tick.call(this, dt);
	this._pilot.act();

	dt /= 1000;

	changed = this._tickWeapons(dt) || changed;
	changed = this._tickRotation(dt) || changed;
	changed = this._tickMovement(dt) || changed;

	if (this._alive && changed) { this._mini.setPosition(this._sprite.position); } /* update mini */

	return changed;
}

Ship.prototype.draw = function(context) {
	if (!this._game.inPort(this._sprite.position, 100)) { if (this instanceof Ship.Player) return; } /* do not draw outside of port */
		
	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._sprite.position[i] - offset[i]).mod(this._size[i]);
	}

	var angle = Math.PI/2 + this._phys.orientation;

	context.save();
	
	if (!this._alive) {
		var dt = Date.now() - this._deathTime;
		var limit = 2000; /* FIXME constant? */
		if (dt > limit) {
			this._game.getEngine().removeActor(this, "ships");
			context.globalAlpha = 0;
		} else {
			context.globalAlpha = (limit-dt) / limit;
		}
	}
	context.translate(tmp[0], tmp[1]);
	context.rotate(angle);
	context.translate(-tmp[0], -tmp[1]);

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
	var r = this._sprite.size[0]/3; /* FIXME cachovat? */
	return (dx*dx+dy*dy < r*r);
}

Ship.prototype.damage = function(weapon) {
	var amount = weapon.getDamage();
	
	var labelPos = this._sprite.position.clone();
	labelPos[1] -= this._sprite.size[1]/2;
	new Label(this._game, "-" + amount, labelPos);
	/* FIXME hitpoints */
	
	//this.die();
}

Ship.prototype.die = function() {
	this._alive = false;
	this._deathTime = Date.now();
	this._mini.die();
	this._phys.decay *= 5;
	this.dispatch("ship-death");
	new Explosion(this._game, this._sprite.position);
}

Ship.prototype._tickWeapons = function() {
	if (this._alive && this._control.fire && this._weapon.isReady()) { /* fire */
		this._tmp = (this._tmp+1)%2;
		var angle = (this._tmp ? -1 : 1) * Math.PI/4;
		angle += this._phys.orientation;
		var dist = 25; /* FIXME sprite size */
		
		var pos = [
			this._phys.position[0] + dist * Math.cos(angle),
			this._phys.position[1] + dist * Math.sin(angle)
		];
		var vel = this._phys.velocity.clone();
		this._weapon.fire(pos, this._phys.orientation, vel);
	}
	
	return false;
}

Ship.prototype._tickRotation = function(dt) {
	if (this._alive && this._control.torque.mode) { /* rotate */
		var orientationDiff = 0;
		switch (this._control.torque.mode) {
			case 1: /* target angle */
				var diff = this._phys.orientation.angleDiff(this._control.torque.target);
				
				var maxAmount = this._options.maxTorque * dt / this._phys.mass; /* we can rotate up to this amount */
				
				if (maxAmount >= Math.abs(diff)) { /* we can rotate further; cutoff at target */
					orientationDiff = diff;
				} else {
					orientationDiff = maxAmount * (diff < 0 ? -1 : 1);
				}
			break;
			
			case 2: /* forever */
				orientationDiff = (this._control.torque.target < 0 ? -1 : 1) * this._options.maxTorque * dt / this._phys.mass;
			break;
		}
	
		this._phys.orientation = (this._phys.orientation + orientationDiff).mod(2*Math.PI);
		return true;
	}
	
	return false;
}

Ship.prototype._tickMovement = function(dt) {
	var changed = false;

	for (var i=0;i<2;i++) { /* adjust position */
		if (this._control.engine && this._alive) { /* engines add force => velocity */
			var force = (this._control.engine > 0 ? 1 : 0.5) * this._options.maxForce * this._control.engine;
			force *= (i ? Math.sin : Math.cos)(this._phys.orientation);
			this._phys.velocity[i] += force * dt / this._phys.mass;
		}
		
		/* drag => decay of velocity */ 
		this._phys.velocity[i] -= this._phys.velocity[i] * Math.min(1, dt * this._phys.decay / this._phys.mass);

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
	
	return changed;
}
