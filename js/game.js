Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

/**
 * If this number represents an angle, what is its difference to another angle?
 */
Number.prototype.angleDiff = function(target) {
	var diff = target - this;
	if (Math.abs(diff) > Math.PI) { diff += (diff < 0 ? 1 : -1) * 2 * Math.PI; }
	return diff;
}

Array.prototype.clone = function() {
	var c = [];
	var len = this.length;
	for (var i=0;i<len;i++) { c.push(this[i]); }
	return c;
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

/**
 * Base abstract game class
 */
var Game = OZ.Class();
Game.MSG_SYNC			= 0; /* player/ship state sync */
Game.MSG_CREATE_PLAYER	= 1; /* new player(s) created */
Game.MSG_CREATE_SHIP	= 2; /* new ship(s) created */
Game.MSG_CHANGE			= 3; /* ship params changed */
Game.MSG_DESTROY_SHIP	= 4; /* player's ship destroyed */
Game.MSG_DESTROY_PLAYER	= 5; /* player left game */

Game.LAYER_BG			= "bg";
Game.LAYER_SHIPS		= "ships";
Game.LAYER_FX			= Game.LAYER_SHIPS;
Game.LAYER_MAP			= "map";

Game.prototype.init = function(name) {
	this._size = [3000, 3000];
	this._players = {};
	
	this._initEngine();
}

Game.prototype.start = function() {
	this._engine.start();
}

Game.prototype.getEngine = function() {
	return this._engine;
}

Game.prototype.getSize = function() {
	return this._size;
}

Game.prototype.getPlayers = function() {
	return this._players;
}

Game.prototype.inPort = function() {
	return false;
}

Game.prototype._initEngine = function() {
	this._engine = new HAF.Engine(this._size, {debug:false});
	this._engine.addLayer(Game.LAYER_BG, {clear:HAF.CLEAR_NONE});
	this._engine.addLayer(Game.LAYER_SHIPS, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this._engine.addLayer(Game.LAYER_FX, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this._engine.addLayer(Game.LAYER_MAP, {sync:false, clear:HAF.CLEAR_NONE});
}

Game.prototype._addPlayer = function(ctor, name, id, score) {
	var player = new ctor(this, name, id, score);
	this._players[player.getId()] = player;
	this.dispatch("player-create");
	return player;
}

Game.prototype._removePlayer = function(id) {
	delete this._players[id];
	this.dispatch("player-death");
}
