var Map = OZ.Class().extend(HAF.Actor);

Map.prototype.init = function(game, size) {
	this._game = game;
	this._size = size;
}

Map.prototype.getSize = function() {
	return this._size;
}

Map.prototype.draw = function(context) {
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	var size = this._game.getSize();

	var w = this._size[0] + 2;;
	var h = this._size[1] + 2;

	context.save();

	context.translate(port[0] - w, port[1] - h);
	
	context.fillStyle = "#fff";
	context.fillRect(0, 0, w, h);
	
	context.translate(2, 2);
	w -= 2;
	h -= 2;
	context.fillStyle = "#000";
	context.fillRect(0, 0, w, h);
	
	var scale = [0, 0];
	var lt = [0, 0];
	var rb = [0, 0];
	var mid1 = [0, 0];
	var mid2 = [0, 0];
	
	for (var i=0;i<2;i++) {
		scale[i] = this._size[i]/size[i];
		lt[i] = offset[i]*scale[i];
		rb[i] = (offset[i]+port[i]).mod(size[i])*scale[i];
		mid1[i] = (lt[i] < rb[i] ? (lt[i]+rb[i]+1)/2 : size[i]*scale[i]);
		mid2[i] = (lt[i] < rb[i] ? (lt[i]+rb[i]-1)/2 : 0);
	}
	
	context.fillStyle = "#888";
	
	context.fillRect(lt[0], lt[1], mid1[0]-lt[0], mid1[1]-lt[1]); /* left top */
	context.fillRect(lt[0], mid2[1], mid1[0]-lt[0], rb[1]-mid2[1]); /* left bottom */
	context.fillRect(mid2[0], lt[1], rb[0]-mid2[0], mid1[1]-lt[1]); /* right top */
	context.fillRect(mid2[0], mid2[1], rb[0]-mid2[0], rb[1]-mid2[1]); /* right bottom */

	context.restore();
}
