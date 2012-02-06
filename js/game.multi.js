Game.Multi = OZ.Class().extend(Game.Client);

Game.Multi.prototype.init = function(name, url) {
	Game.Client.prototype.init.call(this, name);

	this._socket = null;
	this._url = url;
	this._control = {
		torque: {}
	}
}

Game.Multi.prototype.start = function() {
	Game.Client.prototype.start.call(this);
	this._socket = new (window.WebSocket || window.MozWebSocket)(this._url);
	OZ.Event.add(this._socket, "open", this._open.bind(this));
	OZ.Event.add(this._socket, "close", this._close.bind(this));
	OZ.Event.add(this._socket, "message", this._message.bind(this));
}

Game.Multi.prototype._close = function(e) {
	alert("Connection closed: " + e.code + " " + e.reason);
}

Game.Multi.prototype._open = function(e) {
	/* bind keyboard to a dummy control object */
	var kb = new Game.Keyboard(this._control);
	OZ.Event.add(kb, "keyboard-change", this._keyboardChange.bind(this));
	
	/* send CREATE of player's ship */
	var player = this._player;
	var data = {};
	data[player.getId()] = {
		options: {
			color: player.getColor(),
			type: player.getType(),
			name: player.getName()
		},
		phys: player.getPhys()
	}
	
	this._send(Game.MSG_CREATE, data);
}

Game.Multi.prototype._message = function(e) {
	var data = JSON.parse(e.data);
	switch (data.type) {
		case Game.MSG_SYNC:
		case Game.MSG_CHANGE:
			for (var id in data.data) {
				if (!(id in this._ships)) { console.warn("Ship " + id + " not yet created"); }
				var shipData = data.data[id];
				this._merge(id, shipData);
			}
		break;
		
		case Game.MSG_CREATE:
			for (var id in data.data) {
				if (id in this._ships) { continue; } /* skipping existing ship */
				var shipData = data.data[id];
				shipData.options.id = id;
				this._addShip(shipData.options);
				this._merge(id, shipData);
			}
		break;
		
		default:
			alert("Unknown message type " + data.type);
		break;
	}
}

Game.Multi.prototype._send = function(type, data) {
	var obj = {
		type: type,
		data: data
	}
	this._socket.send(JSON.stringify(obj));
}

Game.Multi.prototype._keyboardChange = function() {
	var data = {};
	data[this._player.getId()] = {control:this._control};
	this._send(Game.MSG_CHANGE, data);
}

/**
 * Merge ship data with existing ship
 */
Game.Multi.prototype._merge = function(id, data) {
	var ship = this._ships[id];
	if (data.control) {
		var control = ship.getControl();
		for (var p in data.control) { control[p] = data.control[p]; }
	}
	if (data.phys) {
		var phys = ship.getPhys();
		for (var p in data.phys) { phys[p] = data.phys[p]; }
	}
}
