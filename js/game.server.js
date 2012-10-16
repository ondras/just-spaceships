/**
 * Server-side game class
 */
Game.Server = OZ.Class().extend(Game);
Game.Server.prototype.path = "/space";
Game.Server.prototype.init = function(ws, options) {
	Game.prototype.init.call(this);
	
	this._options = {
		idle: 500,
		stats: 5000
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	OZ.Event.add(null, "ship-death", this._shipDeath.bind(this));
	this._ws = ws;
	this._ws.setDebug(false);
	this._ts = { /* last notifications */
		idle: 0,
		stats: 0
	}; 
	
	this._clients = [];
	this._clientPlayers = [];
	
	this._ws.addApplication(this);
}

Game.Server.prototype.start = function() {
	Game.prototype.start.call(this);
	this._ts.idle = Date.now();
	this._ts.stats = Date.now();
}

Game.Server.prototype.onconnect = function(client, headers) {
	this._clients.push(client);
	this._clientPlayers.push(null);

	/* send CREATE_PLAYER */
	var playerData = {};
	for (var id in this._players) {
		var player = this._players[id];
		playerData[id] = {
			name: player.getName(),
			score: player.getScore(),
			shipOptions: player.getShipOptions()
		}
	}
	var data = {
		type: Game.MSG_CREATE_PLAYER,
		data: playerData
	}
	data = JSON.stringify(data);
	this._ws.send(client, data);

	/* send CREATE_SHIP */
	var state = this._getState();
	var data = {
		type: Game.MSG_CREATE_SHIP,
		data: state
	}
	data = JSON.stringify(data);
	this._ws.send(client, data);
}

Game.Server.prototype.ondisconnect = function(client, code, message) {
	var index = this._clients.indexOf(client);
	if (index == -1) { 
		this._debug("Disconnecting non-existant client " + client);
		return;
	}

	this._clients.splice(index, 1); 
	var player = this._clientPlayers[index];
	this._clientPlayers.splice(index, 1);
	if (!player) { 
		this._debug("Disconnecting client with undefined player " + client);
		return; 
	}
	
	this._removePlayer(player.getId());
}

Game.Server.prototype.onmessage = function(client, data) {
	var parsed = JSON.parse(data);
	switch (parsed.type) {
		case Game.MSG_CREATE_PLAYER:
			for (var id in parsed.data) {
				var playerData = parsed.data[id];

				if (id in this._players) {
					this._debug("[create player] cannot re-create player " + this._players[id].getName());
					continue;
				}
				
				var index = this._clients.indexOf(client);
				if (this._clientPlayers[index]) {
					this._debug("[create player] client " + client + " already defined a player");
					continue;
				}
				
				this._debug("[create player] creating player " + JSON.stringify(playerData));
				var player = this._addPlayer(Player, playerData.name, id); 
				player.setShipOptions(playerData.shipOptions); 
				this._clientPlayers[index] = player;	
			}
		break;
	
		case Game.MSG_CREATE_SHIP:
			for (var id in parsed.data) {
				var playerData = parsed.data[id];
				
				var player = this._players[id];
				if (!player) {
					this._debug("[create ship] player " + id + " does not exist");
					continue;
				}
				
				if (player.getShip()) {
					this._debug("[create ship] player "+player.getName()+" already has a ship");
					continue;
				}
				
				this._debug("[create ship] creating ship for " + player.getName());
				var ship = player.createShip();
				this._mergeShip(ship, playerData);
			}
		break;
		
		case Game.MSG_CHANGE:
			for (var id in parsed.data) {
				var playerData = parsed.data[id];
				var player = this._players[id];
				if (!player) {
					this._debug("[change] player "+id+" not available");
					continue;
				}
				
				var ship = player.getShip();
				if (!ship) {
					this._debug("[change] player "+player.getName()+" does not have a ship");
					continue;
				}
				
				this._mergeShip(ship, playerData);
			}
		break;

		default:
			this._debug("Unknown message type " + parsed.type);
		break;
	}
	
	/* forward message to all other clients */
	for (var i=0;i<this._clients.length;i++) {
		var id = this._clients[i];
		this._ws.send(id, data);
	}
}

Game.Server.prototype.onidle = function() {
	this._engine.tick();
	var ts = Date.now();
	
	if (ts - this._ts.idle > this._options.idle) { /* send sync info to all clients */
		this._ts.idle = ts;
		var state = this._getState();
		var data = {
			type: Game.MSG_SYNC,
			data: state
		}
		data = JSON.stringify(data);
		for (var i=0;i<this._clients.length;i++) {
			this._ws.send(this._clients[i], data);
		}
	}
	
	if (ts - this._ts.stats > this._options.stats) { /* show stats */
		this._ts.stats = ts;
		var players = 0;
		var ships = 0;
		for (var id in this._players) { 
			players++; 
			if (this._players[id].getShip()) { ships++; }
		}
		this._debug("[stats] " + players + " players, " + ships + " ships");
	}
}

Game.Server.prototype._getState = function() {
	var obj = {};
	for (var id in this._players) {
		var ship = this._players[id].getShip();
		if (!ship) { continue; }
		
		obj[id] = {
			phys: ship.getPhys(),
			control: ship.getControl()
		}
	}
	return obj;
}

/**
 * Merge ship data with existing ship
 */
Game.Server.prototype._mergeShip = function(ship, data) {
	if (data.control) {
		var control = ship.getControl();
		for (var p in data.control) { control[p] = data.control[p]; }
	}
	if (data.phys) {
		var phys = ship.getPhys();
		for (var p in data.phys) { phys[p] = data.phys[p]; }
	}
}

Game.Server.prototype._shipDeath = function(e) {
	this._debug("Destroyed ship for player " + e.target.getPlayer().getName());
	var data = {
		type: Game.MSG_DESTROY_SHIP,
		data: {
			target: e.target.getPlayer().getId(),
			enemy: null
		}
	}
	if (e.data.enemy) { data.data.enemy = e.data.enemy.getId(); }

	var str = JSON.stringify(data);
	for (var i=0;i<this._clients.length;i++) {
		this._ws.send(this._clients[i], str);
	}
}

Game.Server.prototype._removePlayer = function(id) {
	var player = this._players[id];
	
	/* destroy ship if possible */
	var ship = player.getShip();
	if (ship) { ship.die(null); }

	this._debug("Destroying player " + player.getName());

	/* send DESTROY_PLAYER */
	var data = {
		type: Game.MSG_DESTROY_PLAYER,
		data: player.getId()
	}
	data = JSON.stringify(data);
	
	for (var i=0;i<this._clients.length;i++) {
		var client = this._clients[i];
		this._ws.send(client, data);
	}

	Game.prototype._removePlayer.call(this, id);
}

Game.Server.prototype._debug = function(str) {
	console.log(str);
}
