var Ship = OZ.Class().extend(HAF.AnimatedSprite);

Ship.colors = {
	yellow: {
		image: "Gaalian",
		color: "#cc0",
		frames: [100, 82, 100]
	},
	blue: {
		image: "People",
		color: "#00f",
		frames: [88, 99, 100]
	},
	red: {
		image: "Maloc",
		color: "#f00",
		frames: [99, 149, 137]
	},
	purple: {
		image: "Feiyan",
		color: "#f0f",
		frames: [100, 100, 100]
	},
	green: {
		image: "Peleng",
		color: "#0f0",
		frames: [149, 100, 100]
	}
};
Ship.types = [
	{
		image: "Pirate",
		mass: 0.7
	},
	{
		image: "Ranger",
		mass: 1
	},
	{
		image: "Liner",
		mass: 1.3
	}
];
Ship.getImageName = function(color, type) {
	return "img/ships/" + this.colors[color].image + "_" + this.types[type].image;
}
Ship.random = function() {
	var colors = [];
	for (var p in this.colors) { colors.push(p); }
	var color = colors.random();
	
	var type = Math.floor(this.types.length * Math.random());

	var ship = {
		color: color,
		type: type
	}
	return ship;
}

Ship.prototype.init = function(game, options) {
	this._game = game;
	this._size = game.getSize();

	this._options = {
		color: "yellow",
		type: 1,
		size: [64, 64],
		maxForce: 500, /* pixels per weight per second^2 in vacuum */
		maxTorque: 150 * Math.PI/180, /* degrees per second */
		mass: null,
		name: "Pilot #" + Math.round(Math.random()*100+1),
		position: [this._size[0]/2, this._size[1]/2],
		id: Math.random().toString().replace(/\D/g, "")
	};
	for (var p in options) { this._options[p] = options[p]; }
	
	/* take mass from type */
	if (!this._options.mass) { this._options.mass = Ship.types[this._options.type].mass; }
	
	var def = Ship.colors[this._options.color];
	var frames = def.frames[this._options.type];
	var largeSize = [this._options.size[0], this._options.size[1]*frames];
	var image = Ship.getImageName(this._options.color, this._options.type) + "_64.png";

	image = HAF.Sprite.get(image, largeSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, this._options.size, frames);
	
	this._animation.fps = 10;
	this._deathTime = 0;
	
	this._weapon = new Weapon(this._game, this);	
	this._alive = true;
	this._control = {
		engine: 0, /* -1 = full back, 1 = full forward */
		torque: {
			mode: 0, /* 0 = nothing, 1 = target angle, 2 = forever */
			target: 0 /* angle or +- 1 for mode = 2 */
		},
		fire: false
	}
	this._phys = {
		mass: this._options.mass,
		orientation: 0,
		decay: 0.5,
		position: this._options.position,
		velocity: [0, 0] /* pixels per second */
	}
	this._hp = Math.round(this._phys.mass * 1000);
	
	this._mini = new Ship.Mini(game, def.color);
	game.getEngine().addActor(this, "ships");
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

Ship.prototype.getId = function() {
	return this._options.id;
}

Ship.prototype.getName = function() {
	return this._options.name;
}

Ship.prototype.getColor = function() {
	return this._options.color;
}

Ship.prototype.getType = function() {
	return this._options.type;
}

Ship.prototype.tick = function(dt) {
	var changed = HAF.AnimatedSprite.prototype.tick.call(this, dt);

	dt /= 1000;

	changed = this._tickWeapons(dt) || changed;
	changed = this._tickRotation(dt) || changed;
	changed = this._tickMovement(dt) || changed;

	if (this._alive && changed) { this._mini.setPosition(this._sprite.position); } /* update mini */

	this.dispatch("ship-tick");

	return changed;
}

Ship.prototype.draw = function(context) {
	if (!this._game.inPort(this._sprite.position, 100)) { return; } /* do not draw outside of port */
		
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
	this._hp -= amount;
	
	var labelPos = this._sprite.position.clone();
	labelPos[1] -= this._sprite.size[1]/2;
	new Label(this._game, "-" + amount, labelPos);
	
	if (this._hp <= 0) {
		this.die();
		var labelPos = this._sprite.position.clone();
		var enemy = weapon.getShip();
		enemy.addKill();
		this.showLabel(this.getName() + " killed by " + enemy.getName(), {size:30});
	}
}

Ship.prototype.die = function() {
	this._alive = false;
	this._deathTime = Date.now();
	this._mini.die();
	this._phys.decay *= 5;
	this.dispatch("ship-death");
	new Explosion(this._game, this._sprite.position);
}

Ship.prototype.showLabel = function(text, options) {
	new Label(this._game, text, this._sprite.position.clone(), options);
}

Ship.prototype.addKill = function() {
	this.showLabel("+1 kill", {color:"green", size:30});
}

Ship.prototype._tickWeapons = function() {
	if (this._alive && this._control.fire && this._weapon.isReady()) { /* fire */
		var dist = this._sprite.size[0]/3;
		
		var pos = [
			this._phys.position[0] + dist * Math.cos(this._phys.orientation),
			this._phys.position[1] + dist * Math.sin(this._phys.orientation)
		];
		this._weapon.fire(pos);
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
