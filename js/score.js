var Score = OZ.Class().extend(HAF.Actor);

Score.prototype.init = function(game) {
	this._game = game;

	OZ.Event.add(null, "ship-create", this._change.bind(this));
	OZ.Event.add(null, "ship-death", this._change.bind(this));
}

Score.prototype.tick = function(dt) {
	return this._dirty;
}

Score.prototype.draw = function(context) {
	var size = 20;
	context.font = size + "px monospace";
	context.fillStyle = "white";
	var players = this._game.getPlayers();
	var maxName = 20;
	var y = context.canvas.height-size;
	for (var id in players) {
		var player = players[id];
		var name = player.getName().substring(0, maxName);
		var score = player.getScore();
		var line = name;
		for (var i=name.length;i<maxName+1;i++) { line = line + " "; }
		line += score;
		context.fillText(line, 5, y);
		y -= 1.5*size;
	}
}

Score.prototype._change = function() {
	this._dirty = true;
}
