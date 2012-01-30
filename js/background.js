var Background = OZ.Class().extend(HAF.Actor);

Background.prototype.init = function(game) {
	this._game = game;
}

Background.prototype.draw = function(context) {
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	
	var sx = Math.floor(offset[0]/100)*100;
	var sy = Math.floor(offset[1]/100)*100;
	var ex = Math.ceil((offset[0]+port[0])/100)*100;
	var ey = Math.ceil((offset[1]+port[1])/100)*100;
/*	
	context.fillStyle = "#aaa";
	for (var i=sx;i<=ex;i+=100) {
		for (var j=sy;j<=ey;j+=100) {
			context.fillRect(i - offset[0], j - offset[1], 10, 10);
		}
	}
*/

	context.strokeStyle = "#ccc";
	context.beginPath();
	for (var i=sx;i<=ex;i+=100) { /* vertical lines */	
		context.moveTo(i-offset[0]+.5, sy-offset[1]);
		context.lineTo(i-offset[0]+.5, ey-offset[1]);
	}	
	for (var j=sy;j<=ey;j+=100) { /* horizontal lines */	
		context.moveTo(sx-offset[0], j-offset[1]+.5);
		context.lineTo(ex-offset[0], j-offset[1]+.5);
	}
	context.stroke();

}
