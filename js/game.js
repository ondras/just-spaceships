Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

var Game = OZ.Class();
Game.prototype.init = function() {
	this._port = [0, 0];
	this._offset = [0, 0];
	this._size = [3000, 3000];
	this._images = {};
	this._ships = [];
	
	this._engine = new HAF.Engine(this._port);
	document.body.appendChild(this._engine.getContainer());
	this._engine.addCanvas("bg");
	this._engine.addCanvas("ships");
	this._engine.addCanvas("map").style.opacity = 0.75;
	
	this._resize();
	
	this._offset[0] = Math.round((this._size[0]-this._port[0])/2);
	this._offset[1] = Math.round((this._size[1]-this._port[1])/2);
	
	this._map = new Map(this, [100, 100]);
	this._engine.addActor(this._map, "map");

	this._engine.addActor(new Background(this), "bg");
	this._ships.push(new Ship.Player(this));

	var ai = new Ship(this, {type:"red"});
	this._ships.push(ai);
	ai._control.engine = 0.5;
	ai._phys.position[1] += -200;
	
	var ai = new Ship(this, {type:"blue"});
	this._ships.push(ai);
	ai._phys.mass = 2;
	ai._control.engine = 0.5;
	ai._phys.position[1] += 200;

	/* */
	var fps = new HAF.FPS(this._engine).getContainer();
	var monitor = new HAF.Monitor(this._engine, [200, 100]).getContainer();
	fps.style.position = "absolute";
	fps.style.left = "0px";
	fps.style.top = "0px";
	fps.style.color = "#999";
	document.body.appendChild(fps);
	monitor.style.position = "absolute";
	monitor.style.left = "0px";
	monitor.style.top = fps.offsetHeight + "px";
	document.body.appendChild(monitor);
	/* */
	
	this._engine.start();
	
	OZ.Event.add(window, "resize", this._resize.bind(this));
	
	if (window.Audio) {
		var bg = new Audio();
		var ext = (bg.canPlayType("audio/ogg") ? "ogg" : "mp3");
		bg.src = "sfx/neointro." + ext;
		bg.play();
	}
	
}

Game.prototype.getEngine = function() {
	return this._engine;
}

Game.prototype.getSize = function() {
	return this._size;
}

Game.prototype.getPort = function() {
	return this._port;
}

Game.prototype.getOffset = function() {
	return this._offset;
}

Game.prototype.getMap = function() {
	return this._map;
}

Game.prototype.setOffset = function(offset) {
	this._offset[0] = offset[0].mod(this._size[0]);
	this._offset[1] = offset[1].mod(this._size[1]);
	this._engine.setDirty("bg");
	this._engine.setDirty("ships");
	this._engine.setDirty("map");
	return this._offset;
}

Game.prototype.getShips = function() {
	return this._ships;
}

Game.prototype._resize = function() {
	var win = OZ.DOM.win();
	for (var i=0;i<win.length;i++) {
		this._port[i] = Math.min(win[i], this._size[i]);
	}
	this._engine.setSize(this._port);
}
