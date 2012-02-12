var Map = OZ.Class().extend(HAF.Actor);

Map.prototype.init = function(game, size) {
	this._game = game;
	this._size = size;
	this._game.getEngine().addActor(this, Game.LAYER_MAP);
}

Map.prototype.getSize = function() {
	return this._size;
}

Map.prototype.draw = function(context) {
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	var size = this._game.getSize();
	
	context.fillStyle = "#000";
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	var lt = [0, 0];
	var rb = [0, 0];
	var mid1 = [0, 0];
	var mid2 = [0, 0];
	
	for (var i=0;i<2;i++) {
		var scale = this._size[i]/size[i]; 
		lt[i] = Math.round(offset[i]*scale);
		rb[i] = Math.round((offset[i]+port[i]).mod(size[i])*scale);
		mid1[i] = Math.round(lt[i] < rb[i] ? (lt[i]+rb[i])/2 : size[i]*scale);
		mid2[i] = Math.round(lt[i] < rb[i] ? (lt[i]+rb[i])/2 : 0);
	}
	
	context.fillStyle = "#888";
	
	context.fillRect(lt[0], lt[1], mid1[0]-lt[0], mid1[1]-lt[1]); /* left top */
	context.fillRect(lt[0], mid2[1], mid1[0]-lt[0], rb[1]-mid2[1]); /* left bottom */
	context.fillRect(mid2[0], lt[1], rb[0]-mid2[0], mid1[1]-lt[1]); /* right top */
	context.fillRect(mid2[0], mid2[1], rb[0]-mid2[0], rb[1]-mid2[1]); /* right bottom */
}
