var Score = OZ.Class();

Score.prototype.init = function(game) {
	this._game = game;
	this._node = OZ.DOM.elm("div", {className:"score"});
	this._game.getEngine().getContainer().appendChild(this._node);

	OZ.Event.add(null, "player-create", this._change.bind(this));
	OZ.Event.add(null, "player-death", this._change.bind(this));
	OZ.Event.add(null, "ship-death", this._change.bind(this));
}

Score.prototype._change = function() {
	var lines = [];
	var maxName = 20;

	var players = this._game.getPlayers();
	for (var id in players) {
		var player = players[id];
		var name = player.getName().substring(0, maxName);
		var score = player.getScore();
		var line = name;
		for (var i=name.length;i<maxName+1;i++) { line = line + " "; }
		line += score;
		lines.push(line);
	}
	
	this._node.innerHTML = lines.join("\n");
}
