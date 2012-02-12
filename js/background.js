var Background = OZ.Class().extend(HAF.Actor);

Background.prototype.init = function(game) {
	this._game = game;
	this._size = game.getSize();

	this._canvas = OZ.DOM.elm("canvas", {width:this._size[0], height:this._size[1]});
	
	var context = this._canvas.getContext("2d");
	
	context.fillStyle = "#000";
	context.fillRect(0, 0, this._size[0], this._size[1]);

	/* starfield */
	var colors = ["#fff", "#ddd", "#bbb", "#999"];
	var sizes = [[1, 1], [2, 2]];
	
	for (var i=0;i<1e4;i++) {
		var x = Math.random() * this._canvas.width;
		var y = Math.random() * this._canvas.height;
		var size = sizes.random();
		context.fillStyle = colors.random();
		context.fillRect(x, y, size[0], size[1]);
	}
	
	/*	
	context.strokeStyle = "#333";
	context.beginPath();
	for (var i=0;i<this._size[0];i+=100) { // vertical lines 
		context.moveTo(i+0.5, 0);
		context.lineTo(i+0.5, this._size[1]);
	}	
	for (var j=0;j<this._size[1];j+=100) { // horizontal lines
		context.moveTo(0, j+0.5);
		context.lineTo(this._size[0], j+0.5);
	}
	context.stroke();
	*/

	this._game.getEngine().addActor(this, Game.LAYER_BG);
}

Background.prototype.draw = function(context) {
	
	var port = this._game.getPort();
	var offset = this._game.getOffset();

	var lt = [0, 0];
	var rb = [0, 0];
	var mid1 = [0, 0];
	var mid2 = [0, 0];
	
	for (var i=0;i<2;i++) {
		lt[i] = offset[i];
		rb[i] = (offset[i]+port[i]).mod(this._size[i]);
		mid1[i] = (lt[i] < rb[i] ? Math.round((lt[i]+rb[i])/2) : this._size[i]);
		mid2[i] = (lt[i] < rb[i] ? Math.round((lt[i]+rb[i])/2) : 0);
	}
	
	// left top
	var w = mid1[0]-lt[0]; var h = mid1[1]-lt[1];
	context.drawImage(
		this._canvas, 
		lt[0], lt[1], w, h,
		0, 0, w, h
	);
	
	// left bottom
	var w = mid1[0]-lt[0]; var h = rb[1]-mid2[1];
	context.drawImage(
		this._canvas, 
		lt[0], mid2[1], w, h,
		0, port[1]-h, w, h
	);
	
	// right top
	var w = rb[0]-mid2[0]; var h = mid1[1]-lt[1];
	context.drawImage(
		this._canvas, 
		mid2[0], lt[1], w, h,
		port[0]-w, 0, w, h
	);

	// right bottom
	var w = rb[0]-mid2[0]; var h = rb[1]-mid2[1];
	context.drawImage(
		this._canvas, 
		mid2[0], mid2[1], w, h,
		port[0]-w, port[1]-h, w, h
	);
	
	/*
	var sx = Math.floor(offset[0]/100)*100;
	var sy = Math.floor(offset[1]/100)*100;
	var ex = Math.ceil((offset[0]+port[0])/100)*100;
	var ey = Math.ceil((offset[1]+port[1])/100)*100;

	context.fillStyle = "#000";
	context.fillRect(0, 0, port[0], port[1]);

	context.strokeStyle = "#333";
	context.beginPath();
	for (var i=sx;i<=ex;i+=100) { // vertical lines
		context.moveTo(i-offset[0]+.5, sy-offset[1]);
		context.lineTo(i-offset[0]+.5, ey-offset[1]);
	}	
	for (var j=sy;j<=ey;j+=100) { // horizontal lines
		context.moveTo(sx-offset[0], j-offset[1]+.5);
		context.lineTo(ex-offset[0], j-offset[1]+.5);
	}
	context.stroke();
	*/
}
