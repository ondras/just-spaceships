/**
 * Client-side (browser) game class
 */
Game.Client = OZ.Class().extend(Game);
Game.Client.prototype.init = function(playerShipOptions) {
	this._port = [0, 0];
	this._offset = [0, 0];
	Game.prototype.init.call(this);

	document.body.appendChild(this._engine.getContainer());
	this._player = null;
	this._initDebug(true);
	this._initPlayer(playerShipOptions);
}

Game.Client.prototype.start = function() {
	Game.prototype.start.call(this);
	Game.Audio.play("neointro");
}

Game.Client.prototype.getPort = function() {
	return this._port;
}

Game.Client.prototype.getOffset = function() {
	return this._offset;
}

Game.Client.prototype.getMap = function() {
	return this._map;
}

/**
 * Detect if given coordinates are within a certain distance from the viewport
 */
Game.Client.prototype.inPort = function(coords, distance) {
	for (var i=0;i<2;i++) {
		var first = (this._offset[i] - distance).mod(this._size[i]);
		var second = (this._offset[i] + this._port[i] + distance).mod(this._size[i]);

		if (first < second) { /* normal port position */
			if (coords[i] < first || coords[i] > second) { return false; }
		} else { /* wrapped port */
			if (coords[i] < first && coords[i] > second) { return false; }
		}
	}
	
	return true;
}

Game.Client.prototype._initEngine = function() {
	Game.prototype._initEngine.call(this);
	this._map = new Map(this, [100, 100]);

	this._resize();

	this._offset[0] = Math.round((this._size[0]-this._port[0])/2);
	this._offset[1] = Math.round((this._size[1]-this._port[1])/2);

	/* FIXME melo by to byt tady? nemely by to delat ty tridy samy? */
	this._engine.addActor(new Background(this), "bg");
	this._engine.addActor(this._map, "map");
	this._engine.addActor(new Score(this), "score");

	OZ.Event.add(window, "resize", this._resize.bind(this));
}

Game.Client.prototype._resize = function() {
	var win = OZ.DOM.win();
	for (var i=0;i<win.length;i++) {
		this._port[i] = Math.max(500, Math.min(win[i], this._size[i]));
	}

	this._engine.setSize(this._port);
	this._engine.setSize(this._map.getSize(), "map");
}

Game.Client.prototype._initDebug = function(chart) {
	var monitor1 = new HAF.Monitor.Sim(this._engine, [220, 100], {textColor:"#888", chart:chart}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.left = "0px";
	monitor1.style.top = "0px";
	document.body.appendChild(monitor1);

	var monitor2 = new HAF.Monitor.Draw(this._engine, [220, 100], {textColor:"#888", chart:chart}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.left = "0px";
	monitor2.style.top = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
}

Game.Client.prototype._initPlayer = function(options) {
	this._player = this._addShip(options);

	/* adjust viewport when position changes */
	OZ.Event.add(this._player, "ship-tick", this._playerTick.bind(this));
}

Game.Client.prototype._playerTick = function(e) {
	var position = this._player.getPhys().position;
	var limit = 200;

	var offsetChanged = false;

	for (var i=0;i<2;i++) {
		var portPosition = Math.round(position[i] - this._offset[i]).mod(this._size[i]);

		if (portPosition < limit) {
			offsetChanged = true;
			this._offset[i] -= limit - portPosition;
		} else if (portPosition > this._port[i]-limit) {
			offsetChanged = true;
			this._offset[i] += portPosition - (this._port[i]-limit);
		}
	}
	
	if (offsetChanged) { 
		this._offset[0] = this._offset[0].mod(this._size[0]);
		this._offset[1] = this._offset[1].mod(this._size[1]);
		this._engine.setDirty("bg");
		this._engine.setDirty("ships");
		this._engine.setDirty("map");
	}
}
