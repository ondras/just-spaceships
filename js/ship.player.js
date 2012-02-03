/**
 * Player's ship adjusts viewport and has an UI pilot
 */
Ship.Player = OZ.Class().extend(Ship);
Ship.Player.prototype.init = function(game) {
	Ship.prototype.init.call(this, game);
	this._pilot = new Pilot.UI("", this);
}

Ship.Player.prototype.tick = function(dt) {
	var visualChanged = Ship.prototype.tick.call(this, dt);
	
	var limit = 200;
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	
	var offsetChanged = false;
	for (var i=0;i<2;i++) {
		var portPosition = (this._sprite.position[i] - offset[i]).mod(this._size[i]);

		if (portPosition < limit) {
			offsetChanged = true;
			offset[i] -= limit - portPosition;
		} else if (portPosition > port[i]-limit) {
			offsetChanged = true;
			offset[i] += portPosition - (port[i]-limit);
		}
	}
	if (offsetChanged) { this._game.setOffset(offset); }
	
	return visualChanged;
}
