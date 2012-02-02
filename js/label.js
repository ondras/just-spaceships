var Label = OZ.Class().extend(HAF.Actor);
Label.prototype.init = function(game, text, position, options) {
	this._game = game;
	this._text = text;
	this._position = position;
	this._options = {
		color: "red"
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	this._game.getEngine().addActor(this, "fx");
}

Label.prototype.tick = function(dt) {
}

Label.prototype.draw = function(context) {
}
