Player.AI = OZ.Class().extend(Player);

Player.AI.prototype.init = function(game, name, id) {
	Player.prototype.init.call(this, game, name, id);

	this._size = game.getSize();
	this._phys = null;
	this._control = null;
	this._oldTick = null;
	
	this._target = null;
	this._targetPhys = null;

	OZ.Event.add(null, "ship-purge", this._shipPurge.bind(this));
}

Player.AI.prototype._tick = function(dt) {
	if (this._target) { 
		var dx = this._targetPhys.position[0]-this._phys.position[0];
		var dy = this._targetPhys.position[1]-this._phys.position[1];
		
		if (Math.abs(dx) > this._size[0]/2) { dx += (dx > 0 ? -1 : 1) * this._size[0]; }
		if (Math.abs(dy) > this._size[1]/2) { dy += (dy > 0 ? -1 : 1) * this._size[1]; }
		
		var dist = Math.sqrt(dx*dx+dy*dy);

		var angle = Math.atan2(dy, dx);
		this._control.torque.mode = 1;
		this._control.torque.target = angle;
		
		var range = this._ship.getWeapon().getRange();

		this._control.engine = (dist < range/2 ? -.7 : .7);
		
		var diff = this._phys.orientation.angleDiff(angle);
		this._control.fire = (this._target.getHP()) && (dx*dx+dy*dy < range*range && Math.abs(diff) < Math.PI/8);
	}
	
	return this._oldTick.call(this._ship, dt);
}

Player.AI.prototype.setTarget = function(target) {
	this._target = target;
	this._targetPhys = target.getPhys();
}

Player.AI.prototype.setRandomTarget = function() {
	var players = this._game.getPlayers();
	var avail = [];
	for (var id in players) {
		var ship = players[id].getShip();
		if (!ship || ship == this._ship) { continue; }
		avail.push(ship);
	}
	if (!avail.length) { return; }
	this.setTarget(avail.random());
}

Player.AI.prototype.createShip = function() {
	var ship = Player.prototype.createShip.call(this);
	this._oldTick = ship.tick;
	ship.tick = this._tick.bind(this);
	
	this._phys = ship.getPhys();
	this._control = ship.getControl();
}

Player.AI.prototype._shipDeath = function(e) {
	if (e.target == this._ship) { /* our ship died */
		this._ship.tick = this._oldTick;
		this._ship = null;
		this.createShip(); /* create new ship */
	}
}

Player.AI.prototype._shipPurge = function(e) {
	if (e.target == this._target) { 
		this._target = null;
		this.setRandomTarget(); 
	}
}
