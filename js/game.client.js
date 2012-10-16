/**
 * Client-side (browser) game class
 */
Game.Client = OZ.Class().extend(Game);
Game.Client.prototype.init = function(playerName, playerShipOptions) {
	this._port = [0, 0];
	this._offset = [0, 0];
	this._player = null;

	Game.prototype.init.call(this);

	OZ.Event.add(null, "ship-create", this._shipCreate.bind(this));
	OZ.Event.add(null, "ship-death", this._shipDeath.bind(this));

	this._keyboard = new Keyboard();
	this._initDebug(true);
	this._initPlayer(playerName, playerShipOptions);

	// Load audio files
	var manifest = [
				{ id:"shot", src:"sfx/shot.mp3|sfx/shot.ogg", data:20 },
				{ id:"explosion", src:"sfx/explosion.mp3|sfx/explosion.ogg", data:6 },
				{ id:"neointro", src:"sfx/neointro.mp3|sfx/neointro.ogg" }
			];

	preload = new createjs.PreloadJS();
	preload.installPlugin(createjs.SoundJS);
	preload.loadManifest(manifest);
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

Game.Client.prototype.setOffset = function(offset) {
	this._offset[0] = offset[0].mod(this._size[0]);
	this._offset[1] = offset[1].mod(this._size[1]);
	this._engine.setDirty(Game.LAYER_BG);
	this._engine.setDirty(Game.LAYER_SHIPS);
	this._engine.setDirty(Game.LAYER_FX);
	this._engine.setDirty(Game.LAYER_MAP);
}

Game.Client.prototype._initEngine = function() {
	Game.prototype._initEngine.call(this);
	document.body.appendChild(this._engine.getContainer());

	this._map = new Map(this, [100, 100]);

	this._resize();

	this._offset[0] = Math.round((this._size[0]-this._port[0])/2);
	this._offset[1] = Math.round((this._size[1]-this._port[1])/2);

	new Background(this);
	new Score(this);

	OZ.Event.add(window, "resize", this._resize.bind(this));
}

Game.Client.prototype._resize = function() {
	var win = OZ.DOM.win();
	for (var i=0;i<win.length;i++) {
		this._port[i] = Math.min(win[i], this._size[i]);
	}

	this._engine.setSize(this._port);
	this._engine.setSize(this._map.getSize(), Game.LAYER_MAP);
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

Game.Client.prototype._initPlayer = function(name, shipOptions) {
	this._player = this._addPlayer(Player.Human, name).setShipOptions(shipOptions);
}

Game.Client.prototype._shipCreate = function(e) {}
Game.Client.prototype._shipDeath = function(e) {}
