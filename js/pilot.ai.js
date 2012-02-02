Pilot.AI = OZ.Class().extend(Pilot);

Pilot.AI.prototype.init = function(control, phys) {
	Pilot.prototype.init.call(this, control, phys);
	this._target = null;
}

Pilot.AI.prototype.act = function() {
	if (!this._target) { return; }
	
	var dx = this._target.position[0]-this._phys.position[0];
	var dy = this._target.position[1]-this._phys.position[1];
	var dist = Math.sqrt(dx*dx+dy*dy);

	var angle = Math.atan2(dy, dx);
	this._control.torque.mode = 1;
	this._control.torque.target = angle;
	
	/* FIXME nejaka konstanta */
	this._control.engine = (dist < 300 ? 0 : 1);
	
	/* FIXME use weapon range */
//	this._control.fire = (dx*dx+dy*dy < 800*800);
	
	
}

Pilot.AI.prototype.setTarget = function(target) {
	this._target = target._phys; /* FIXME */
}
