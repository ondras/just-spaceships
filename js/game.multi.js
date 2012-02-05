Game.Multi = OZ.Class().extend(Game.Client);

Game.Multi.prototype.init = function(name) {
	Game.Client.prototype.init.call(this, name);

	this._socket = null;
}

Game.Multi.prototype.start = function() {
	Game.Client.prototype.start.call(this);
	this._socket = new (window.WebSocket || window.MozWebSocket)("ws://obelix:8888/space");
	OZ.Event.add(this._socket, "open", this._open.bind(this));
	OZ.Event.add(this._socket, "message", this._message.bind(this));
}

Game.Multi.prototype._open = function(e) {
}

Game.Multi.prototype._message = function(e) {
	var data = JSON.parse(e.data);
	switch (data.type) {
		case Game.MSG_SYNC:
		case Game.MSG_CHANGE:
			for (var id in data.data) {
				if (!(id in this._ships)) { console.warn("Ship " + id + " not yet created"); }
				var shipData = data.data[id];
				console.log("change for " + id);
				this._merge(id, shipData);
			}
		break;
		
		case Game.MSG_CREATE:
			for (var id in data.data) {
				if (id in this._ships) { continue; } /* skipping existing ship */
				this._addShip({id:id});
				console.log("created id " + id);
				var shipData = data.data[id];
				this._merge(id, shipData);
			}
		break;
		
		default:
			alert("Unknown message type " + data.type);
		break;
	}
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
