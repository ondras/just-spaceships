var Ship = OZ.Class().extend(HAF.Actor);
Ship.prototype.init = function(game) {
	this._game = game;
	this._size = game.getSize();
	this._pxPosition = [0, 0];
	this._portPosition = [0, 0];
	this._phys = {
		mass: 1,
		engine: 0,
		torque: 0,
		orientation: 0,
		position: [this._size[0]/2, this._size[1]/2],
		velocity: [0, 0] /* pixels per second */
	}
}

Ship.prototype.tick = function(dt) {
	dt /= 1000;
	var changed = false;

	if (this._phys.torque) {
		this._phys.orientation = (this._phys.orientation + this._phys.torque * dt / this._phys.mass).mod(360);
		changed = true;
	}
	
	for (var i=0;i<2;i++) {
		/* engines add force => velocity */
		var force = (i ? Math.sin : Math.cos)(this._phys.orientation * Math.PI/180) * this._phys.engine;
		this._phys.velocity[i] += force * dt / this._phys.mass;
		
		/* drag => decay of velocity */ 
		this._phys.velocity[i] -= this._phys.velocity[i] * Math.min(1, dt * 0.5 / this._phys.mass);

		/* move ship */
		this._phys.position[i] = (this._phys.position[i] + this._phys.velocity[i] * dt).mod(this._size[i]);
		
		var px = Math.round(this._phys.position[i]);
		if (px != this._pxPosition[i]) {
			this._pxPosition[i] = px;
			changed = true;
		}
		
	}

	return changed;
}

Ship.prototype.draw = function(context) {
	var offset = this._game.getOffset();
	var tmp = [0, 0];
	for (var i=0;i<2;i++) {
		tmp[i] = (this._pxPosition[i] - offset[i]).mod(this._size[i]);
	}

	var a = this._phys.orientation * Math.PI /180; 
	var b = (this._phys.orientation + 90) * Math.PI /180; 
	context.beginPath();
	
	context.moveTo(tmp[0] + 10*Math.cos(b), tmp[1] + 10*Math.sin(b));
	context.lineTo(tmp[0] + 10*Math.cos(a), tmp[1] + 10*Math.sin(a));
	context.lineTo(tmp[0] - 10*Math.cos(b), tmp[1] - 10*Math.sin(b));
	
	context.lineWidth = this._phys.mass;
	context.stroke();
}
