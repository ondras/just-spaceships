if (!Date.now) {
	Date.now = function() { return +(new Date); }
}

var HAF = {};

HAF.MODE_DIRECT			= 0;
HAF.MODE_OFFSCREEN		= 1;
HAF.MODE_DOUBLEBUFFER	= 2;

/**
 * @class Base animation director
 */
HAF.Engine = OZ.Class();
HAF.Engine.prototype.init = function(size,  options) {
	this._size = null;
	this._options = {
		fps: 60,
		id: "haf"
	};
	for (var p in options) { this._options[p] = options[p]; }

	this._running = false;
	this._container = OZ.DOM.elm("div", {id:this._options.id, position:"relative"});
	this._canvases = {};
	this._draw = this._draw.bind(this);
	this._tick = this._tick.bind(this);
	
	this._mode = HAF.MODE_DIRECT;

	var prefixes = ["", "moz", "webkit", "ms"];
	var ok = false;
	for (var i=0;i<prefixes.length;i++) {
		var name = prefixes[i] + (prefixes[i] ? "R" : "r") + "equestAnimationFrame";
		if (name in window) {
			this._schedule = window[name];
			ok = true;
			break;
		}
	}
	
	this.setSize(size || [0, 0]);

	if (!ok) { 
		this._schedule = function(cb) {
			setTimeout(cb, 1000/60); /* 60 fps */
		}
	}
}

HAF.Engine.prototype.setSize = function(size) {
	this._size = size;
	
	this._container.style.width = size[0]+"px";
	this._container.style.height = size[1]+"px";
	
	for (var id in this._canvases) {
		var canvas = this._canvases[id];
		canvas.canvas.width = this._size[0];
		canvas.canvas.height = this._size[1];
		canvas.dirty = true;
	}
}

HAF.Engine.prototype.isRunning = function() {
	return this._running;
}

HAF.Engine.prototype.setMode = function(mode) {
	this._mode = mode;
	return this;
}

HAF.Engine.prototype.getContainer = function() {
	return this._container;
}

HAF.Engine.prototype.addCanvas = function(id) {
	var canvas = OZ.DOM.elm("canvas", {position:"absolute"});
	canvas.width = this._size[0];
	canvas.height = this._size[1];
	var second = canvas.cloneNode(false);
	var obj = {
		canvas: canvas,
		ctx: canvas.getContext("2d"),
		second: second,
		secondCtx: second.getContext("2d"),
		id: id,
		dirty: false,
		actors: []
	}
	this._canvases[id] = obj;
	this._container.appendChild(canvas);
	return canvas;
}

HAF.Engine.prototype.addActor = function(actor, canvasId) {
	var obj = this._canvases[canvasId];
	obj.actors.unshift(actor); 
	obj.dirty = true;
	actor.tick(0);
}

HAF.Engine.prototype.removeActor = function(actor, canvasId) {
	var obj = this._canvases[canvasId];
	var index = obj.actors.indexOf(actor);
	if (index != -1) { obj.actors.splice(index, 1); }
	obj.dirty = true;
}

HAF.Engine.prototype.removeActors = function(canvasId) {
	var obj = this._canvases[canvasId];
	obj.actors = [];
	obj.dirty = true;
}

HAF.Engine.prototype.setDirty = function(canvasId) {
	this._canvases[canvasId].dirty = true;
}

HAF.Engine.prototype.start = function() {
	this._running = true;
	this.dispatch("start");
	this._ts = Date.now();
	this._tick();
	this._draw();
}

HAF.Engine.prototype.stop = function() {
	this._running = false;
	this.dispatch("stop");
}

/**
 * (Physics) Time step
 */
HAF.Engine.prototype._tick = function() {
	if (!this._running) { return; }
	
	setTimeout(this._tick, 1000/this._options.fps);

	var ts1 = Date.now();
	var dt = ts1 - this._ts;
	this._ts = ts1;
	var allActors = 0;
	var changedActors = 0;
	
	for (var id in this._canvases) { /* for all canvases */
		var obj = this._canvases[id];
		var dirty = obj.dirty;
		var actors = obj.actors;
		var i = actors.length;
		allActors += i;
		while (i--) { /* tick all actors, remember if any actor changed */
			var changed = actors[i].tick(dt);
			if (changed) { changedActors++; }
			dirty = changed || dirty;
		}
		obj.dirty = dirty;
	}
	
	var ts2 = Date.now();
	this.dispatch("tick", {time:ts2-ts1, all:allActors, changed:changedActors});
}

/**
 * Drawing time step
 */
HAF.Engine.prototype._draw = function() {
	if (!this._running) { return; }
	
	this._schedule.call(window, this._draw); /* schedule next tick */
	var ts1 = Date.now();
	
	for (var id in this._canvases) { /* for all canvases */
		var obj = this._canvases[id];
		if (!obj.dirty) { continue; }

		/* at least one actor changed; redraw canvas */
		obj.dirty = false;
		var actors = obj.actors;
		
		switch (this._mode) {
			case HAF.MODE_DIRECT:
				obj.ctx.clearRect(0, 0, this._size[0], this._size[1]); /* clear canvas */
				var i = actors.length; 
				while (i--) { actors[i].draw(obj.ctx); }
			break;
			
			case HAF.MODE_OFFSCREEN:
				obj.ctx.clearRect(0, 0, this._size[0], this._size[1]); /* clear canvas */
				var i = actors.length; 
				var canvas = obj.canvas;
				var next = canvas.nextSibling;
				var parent = canvas.parentNode;
				parent.removeChild(canvas);
				while (i--) { actors[i].draw(obj.ctx); }
				parent.insertBefore(canvas, next);
			break;

			case HAF.MODE_DOUBLEBUFFER:
				obj.secondCtx.clearRect(0, 0, this._size[0], this._size[1]); /* clear canvas */
				var i = actors.length; 
				while (i--) { actors[i].draw(obj.secondCtx); }
				obj.canvas.parentNode.replaceChild(obj.second, obj.canvas);
				
				var tmp = obj.canvas;
				obj.canvas = obj.second;
				obj.second = tmp;
				
				tmp = obj.ctx;
				obj.ctx = obj.secondCtx;
				obj.secondCtx = tmp;
			break;
		}
		
	}
	
	var ts2 = Date.now();
	this.dispatch("frame", {time:ts2-ts1});
}

/**
 * @class FPS measurement & display
 */
HAF.FPS = OZ.Class();
HAF.FPS.prototype.init = function(engine) {
	this._interval = null;
	this._intervalLength = 500;
	
	this._ts = null;

	this._frames = { /* absolute frames */
		tick: null,
		draw: null 
	}
	this._localFrames = {
		tick: null,
		draw: null
	}
	this._localTime = {
		tick: null,
		draw: null
	}

	this._dom = {
		container: OZ.DOM.elm("div", {whiteSpace:"pre", fontFamily:"monospace"}),
		frames: {
			tick: OZ.DOM.elm("span"),
			draw: OZ.DOM.elm("span")
		},
		pot: OZ.DOM.elm("span"),
		cur: OZ.DOM.elm("span")
	}
	
	OZ.DOM.append([
		this._dom.container,
		OZ.DOM.text("Total frames (sim/draw): "),
		this._dom.frames.tick,
		OZ.DOM.text("/"),
		this._dom.frames.draw,
		OZ.DOM.text(" • Potential FPS: "),
		this._dom.pot,
		OZ.DOM.text(" • Current FPS: "),
		this._dom.cur
	]);
	
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, "stop", this._stop.bind(this));
	OZ.Event.add(engine, "frame", this._frame.bind(this));
	OZ.Event.add(engine, "tick", this._tick.bind(this));
}

HAF.FPS.prototype.getContainer = function() {
	return this._dom.container;
}

HAF.FPS.prototype._start = function(e) {
	this._frames.tick = 0;
	this._frames.draw = 0;

	this._localFrames.tick = 0;
	this._localFrames.draw = 0;

	this._localTime.tick = 0;
	this._localTime.draw = 0;
	
	this._ts = Date.now();

	this._interval = setInterval(this._check.bind(this), this._intervalLength);
}

HAF.FPS.prototype._stop = function(e) {
	clearInterval(this._interval);
	this._interval = null;
}

HAF.FPS.prototype._tick = function(e) {
	this._frames.tick++;
	this._dom.frames.tick.innerHTML = this._pad(this._frames.tick + "", 7);

	this._localFrames.tick++;
	this._localTime.tick += e.data.time;
}

HAF.FPS.prototype._frame = function(e) {
	this._frames.draw++;
	this._dom.frames.draw.innerHTML = this._pad(this._frames.draw + "", 7);

	this._localFrames.draw++;
	this._localTime.draw += e.data.time;
}


HAF.FPS.prototype._pad = function(str, len) {
	while (str.length < len) { str = " " + str; }
	return str;
}

HAF.FPS.prototype._check = function() {
	var ts = Date.now();
	var dt = ts - this._ts;

	/* potential simulation FPS */
	var avgFrame = 1000 * this._localFrames.tick / this._localTime.tick;
	/* potential drawing FPS */
	var avgDraw = 1000 * this._localFrames.draw / this._localTime.draw;

	this._dom.pot.innerHTML = this._pad(avgFrame.toFixed(2), 7) + "/" + this._pad(avgDraw.toFixed(2), 7);
	
	/* current simulation FPS */
	var curFrame = 1000 * this._localFrames.tick / dt;
	/* current drawing FPS */
	var curDraw = 1000 * this._localFrames.draw / dt;

	this._dom.cur.innerHTML = this._pad(curFrame.toFixed(2), 7) + "/" + this._pad(curDraw.toFixed(2), 7);

	this._ts = ts;
	this._localFrames.tick = 0;
	this._localFrames.draw = 0;
	this._localTime.tick = 0;
	this._localTime.draw = 0;
}

HAF.Monitor = OZ.Class();
HAF.Monitor.prototype.init = function(engine, size) {
	this._size = size;
	this._canvas = OZ.DOM.elm("canvas", {className:"monitor"});
	this._ctx = this._canvas.getContext("2d");

	this._dataTick = [];
	this._dataFrame = [];
	
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, "tick", this._tick.bind(this));
	OZ.Event.add(engine, "frame", this._frame.bind(this));
}

HAF.Monitor.prototype.getContainer = function() {
	return this._canvas;
}

HAF.Monitor.prototype._start = function(e) {
	this._canvas.width = this._size[0];
	this._canvas.height = this._size[1];

	this._dataTick = [];
	this._dataFrame = [];
	this._dataChanged = [];
}

HAF.Monitor.prototype._tick = function(e) {
	this._dataTick.push(e.data.time);
	this._dataChanged.push(e.data.changed/e.data.all);
	if (this._dataTick.length > this._size[0]) { 
		this._dataTick.shift(); 
		this._dataChanged.shift(); 
	}
	this._draw();	
}

HAF.Monitor.prototype._frame = function(e) {
	this._dataFrame.push(e.data.time);
	if (this._dataFrame.length > this._size[0]) { this._dataFrame.shift(); }
	this._draw();	
}

HAF.Monitor.prototype._draw = function() {
	this._canvas.width = this._canvas.width;
	
	this._ctx.beginPath();
	var i = this._dataTick.length;
	var w = this._size[0];
	var h = this._size[1]-0.5;
	while (i--) {
		this._ctx.lineTo(w--, h-this._dataTick[i]);
	}
	this._ctx.strokeStyle = "blue";
	this._ctx.stroke();

	this._ctx.beginPath();
	var i = this._dataFrame.length;
	var w = this._size[0];
	var h = this._size[1]-0.5;
	while (i--) {
		this._ctx.lineTo(w--, h-this._dataFrame[i]);
	}
	this._ctx.strokeStyle = "red";
	this._ctx.stroke();

	this._ctx.beginPath();
	var i = this._dataChanged.length;
	var w = this._size[0];
	var h = this._size[1]-1;
	while (i--) {
		this._ctx.lineTo(w--, 0.5+Math.round(h*(1-this._dataChanged[i])));
	}
	this._ctx.strokeStyle = "green";
	this._ctx.stroke();
}

/**
 * Abstract actor
 */
HAF.Actor = OZ.Class();
HAF.Actor.prototype.tick = function(dt) { return false; }
HAF.Actor.prototype.draw = function(context) { }

/**
 * Image sprite actor
 */
HAF.Sprite = OZ.Class().extend(HAF.Actor);
HAF.Sprite.prototype.init = function(image, size) {
	this._sprite = {
		size: size,
		position: [0, 0],
		image: image
	}
}
HAF.Sprite.prototype.draw = function(context) {
	var position = this._getSourceImagePosition();
	position[0] *= this._sprite.size[0];
	position[1] *= this._sprite.size[1];

	context.drawImage(
		this._sprite.image, 
		position[0], position[1], this._sprite.size[0], this._sprite.size[1], 
		this._sprite.position[0]-this._sprite.size[0]/2, this._sprite.position[1]-this._sprite.size[1]/2, this._sprite.size[0], this._sprite.size[1]
	);
}
HAF.Sprite.prototype._getSourceImagePosition = function() {
	return [0, 0];
}

/**
 * Animated image sprite, consists of several frames
 */
HAF.AnimatedSprite = OZ.Class().extend(HAF.Sprite);
HAF.AnimatedSprite.prototype.init = function(image, size, frames) {
	HAF.Sprite.prototype.init.call(this, image, size);
	this._animation = {
		fps: 10,
		time: 0,
		frame: 0,
		frames: frames
	}
	
}
HAF.AnimatedSprite.prototype.tick = function(dt) {
	this._animation.time += dt;
	var oldFrame = this._animation.frame;
	this._animation.frame = Math.floor(this._animation.time * this._animation.fps / 1000) % this._animation.frames;
	return (oldFrame != this._animation.frame);
}

/**
 * Particle, suitable for particle fx
 */
HAF.Particle = OZ.Class().extend(HAF.Actor);
HAF.Particle.SQUARE	= 0;
HAF.Particle.CIRCLE	= 1;
HAF.Particle.prototype.init = function(position, options) {
	options = options || {};
	this._particle = {
		position: position,
		pxPosition: [0, 0],
		velocity: options.velocity || [0, 0], /* pixels per second */
		opacity: options.opacity || 1,
		size: options.size || 2,
		color: options.color || [0, 0, 0],
		type: options.type || HAF.Particle.SQUARE,
		decay: options.decay || 0 /* opacity per second */
	}

}

HAF.Particle.prototype.tick = function(dt) {
	var changed = false;

	/* adjust position */
	for (var i=0;i<2;i++) {
		var pos = this._particle.position[i] + this._particle.velocity[i] * dt / 1000;
		this._particle.position[i] = pos;
		var px = Math.round(pos);
		if (px != this._particle.pxPosition[i]) {
			this._particle.pxPosition[i] = px;
			changed = true;
		}
	}
	
	/* adjust opacity */
	if (this._particle.decay) {
		this._particle.opacity = Math.max(0, this._particle.opacity - this._particle.decay * dt / 1000);
		changed = true;
	}
	return changed;
}

HAF.Particle.prototype.draw = function(context) {
	context.fillStyle = "rgba("+this._particle.color.join(",")+","+this._particle.opacity+")";
	var half = this._particle.size/2;
	switch (this._particle.type) {
		case HAF.Particle.SQUARE:
			context.fillRect(this._particle.pxPosition[0]-half, this._particle.pxPosition[1]-half, this._particle.size, this._particle.size);
		break;

		case HAF.Particle.CIRCLE:
			context.beginPath();
			context.arc(this._particle.pxPosition[0], this._particle.pxPosition[1], this._particle.size/2, 0, 2*Math.PI, false);
			context.fill();
		break;
	}
}
