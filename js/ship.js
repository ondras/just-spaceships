var Ship = OZ.Class().extend(HAF.Sprite);

Ship.types = {
	yellow: {
		image: "Gaalian_Ranger_000",
		color: "#cc0"
	},
	blue: {
		image: "People_Ranger_000",
		color: "#00f"
	},
	red: {
		image: "Maloc_Pirate_000",
		color: "#f00"
	}
}

Ship.prototype.init = function(game, options) {
	this._game = game;
	this._options = {
		type: "yellow",
		size: [48, 48],
		maxForce: 500, /* pixels per weight per second^2 in vacuum */
		maxTorque: 150 /* degrees per second */
	};
	for (var p in options) { this._options[p] = options[p]; }

	var def = Ship.types[this._options.type];

	var image = Game.Image.get(def.image, this._options.size);
	HAF.Sprite.prototype.init.call(this, image, this._options.size);

	
	this._size = game.getSize();

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
	dt /= 1000;
	var changed = false;

	if (this._control.torque) {
		this._phys.orientation = (this._phys.orientation + this._options.maxTorque * this._control.torque * dt / this._phys.mass).mod(360);
		changed = true;
	}
	
	for (var i=0;i<2;i++) {
		if (this._control.engine) { /* engines add force => velocity */
			var force = (this._control.engine > 0 ? 1 : 0.5) * this._options.maxForce * this._control.engine;
			force *= (i ? Math.sin : Math.cos)(this._phys.orientation * Math.PI/180);
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
	
	if (changed) { this._mini.setPosition(this._sprite.position); }

	return changed;
}

Ship.prototype.draw = function(context) {
	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._sprite.position[i] - offset[i]).mod(this._size[i]);
	}

/*
	var a = this._phys.orientation * Math.PI /180; 
	var b = (this._phys.orientation + 90) * Math.PI /180; 
	context.beginPath();
	
	context.moveTo(tmp[0] + 10*Math.cos(b), tmp[1] + 10*Math.sin(b));
	context.lineTo(tmp[0] + 10*Math.cos(a), tmp[1] + 10*Math.sin(a));
	context.lineTo(tmp[0] - 10*Math.cos(b), tmp[1] - 10*Math.sin(b));
	
	context.lineWidth = this._phys.mass;
	context.strokeStyle = this._options.color;
	context.stroke();
*/

	var angle = 90 + this._phys.orientation;

	context.save();
	
	context.translate(tmp[0], tmp[1]);
	context.rotate(angle*Math.PI/180);
	context.translate(-tmp[0], -tmp[1]);

	context.drawImage(
		this._sprite.image, 
		tmp[0]-this._sprite.size[0]/2, tmp[1]-this._sprite.size[1]/2
	);

	context.restore();
}
