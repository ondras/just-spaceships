/**
 * Client-side (browser) game class
 */
Game.Client = OZ.Class().extend(Game);

Game.Client.setup = function() {
	var single = OZ.$("mode-single");
	var multi = OZ.$("mode-multi");
	var name = OZ.$("name").value;
	OZ.DOM.clear(document.body);
	var game = null;
	if (single.checked) {
		game = new Game.Single(name);
	} else {
		game = new Game.Multi(name);
	}
	
	game.start();
}

Game.Client.prototype.init = function(name) {
	this._port = [0, 0];
	this._offset = [0, 0];
	Game.prototype.init.call(this);

	document.body.appendChild(this._engine.getContainer());
	this._player = null;
	this._initPlayer(name);
	this._initDebug(true);
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

Game.Client.prototype.setOffset = function(offset) {
	this._offset[0] = offset[0].mod(this._size[0]);
	this._offset[1] = offset[1].mod(this._size[1]);
	this._engine.setDirty("bg");
	this._engine.setDirty("ships");
	this._engine.setDirty("map");
	return this._offset;
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

	this._resize();

	this._offset[0] = Math.round((this._size[0]-this._port[0])/2);
	this._offset[1] = Math.round((this._size[1]-this._port[1])/2);

	this._map = new Map(this, [100, 100]);
	this._engine.addActor(this._map, "map");
	this._engine.addActor(new Background(this), "bg");
	OZ.Event.add(window, "resize", this._resize.bind(this));
}

Game.Client.prototype._resize = function() {
	var win = OZ.DOM.win();
	for (var i=0;i<win.length;i++) {
		this._port[i] = Math.max(500, Math.min(win[i], this._size[i]));
	}
	this._engine.setSize(this._port);
}

Game.Client.prototype._initDebug = function(chart) {
	var monitor1 = new HAF.Monitor.Sim(this._engine, [220, 100], {textColor:"#aaa", chart:chart}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.left = "0px";
	monitor1.style.top = "0px";
	document.body.appendChild(monitor1);

	var monitor2 = new HAF.Monitor.Draw(this._engine, [220, 100], {textColor:"#aaa", chart:chart}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.left = "0px";
	monitor2.style.top = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
}

Game.Client.prototype._initPlayer = function(name) {
	this._player = this._addShip(Ship.Player);
	this._player.setPilot(new Pilot.UI(this, this._player, name));

}

