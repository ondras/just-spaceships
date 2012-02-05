Game.Multi = OZ.Class().extend(Game.Client);

Game.Multi.prototype.init = function(name) {
	this._socket = null;
	OZ.Event.add(this._socket, "open", this._open.bind(this));
	OZ.Event.add(this._socket, "message", this._message.bind(this));
}

Game.Multi.prototype.start = function() {
	Game.Client.prototype.start.call(this);
	new (window.WebSocket || window.MozWebSocket)("ws://localhost:8888/space");
}

Game.Multi.prototype._open = function(e) {
	this._engine.start();
}

Game.Multi.prototype._message = function(e) {
}
