/**
 * Server-side game class
 */
Game.Server = OZ.Class().extend(Game);
Game.Server.prototype.path = "/space";
Game.Server.prototype.init = function(ws) {
	Game.prototype.init.call(this);
	
	this._ws = ws;
	this._ts = 0; /* last idle notification */
	this._clients = [];
	this._clientShips = [];
	
	this._ws.addApplication(this);
	
	/* testing ship */
	var ship = this._addShip(Ship);
	ship.getControl().engine = 1;
}

Game.Server.prototype.start = function() {
	Game.prototype.start.call(this);
	this._ts = Date.now();
	this._ws.run();
}

Game.Server.prototype.onconnect = function(client, headers) {
	this._clients.push(client);
}

Game.Server.prototype.ondisconnect = function(client, code, message) {
	var index = this._clients.indexOf(client);
	if (index != -1) { this._clients.splice(index, 1); }
}

Game.Server.prototype.onmessage = function(client, data) {
}

Game.Server.prototype.onidle = function() {
	this._engine.tick();
	var ts = Date.now();
	
	if (ts - this._ts > 500) {
		this._ts = ts;
		var state = this._stringifyState();
		for (var i=0;i<this._clients.length;i++) {
			this._ws.send(this._clients[i], state);
		}
	}
	
}

Game.Server.prototype._stringifyState = function() {
	var obj = {};
	for (var id in this._ships) {
		var ship = this._ships[id];
		obj[id] = {
			phys: ship.getPhys(),
			control: ship.getControl(),
		}
	}
	var str = JSON.stringify(obj);
	system.stdout.writeLine(str);
	return str;
}
