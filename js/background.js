var Background = OZ.Class().extend(HAF.Actor);

Background.prototype.init = function(game) {
	this._game = game;
}

Background.prototype.draw = function(context) {
	context.fillStyle = "#aaa";
	var port = this._game.getPort();
	var offset = this._game.getOffset();
	
	var sx = Math.floor(offset[0]/100)*100;
	var sy = Math.floor(offset[1]/100)*100;
	var ex = Math.ceil((offset[0]+port[0])/100)*100;
	var ey = Math.ceil((offset[1]+port[1])/100)*100;
	
	for (var i=sx;i<=ex;i+=100) {
		for (var j=sy;j<=ey;j+=100) {
			context.fillRect(i - offset[0], j - offset[1], 10, 10);
		}
	}
}
