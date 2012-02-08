if (!Date.now) {
	Date.now = function() { return +(new Date); }
}

var HAF = {};

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
	
	this._ts = {
		tick: 0,
		draw: 0
	}

	this._running = false;
	this._container = OZ.DOM.elm("div", {id:this._options.id, position:"relative"});
	this._layers = {};
	this.draw = this.draw.bind(this);
	this.tick = this.tick.bind(this);
	
	this.setSize(size || [0, 0]);

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
	if (!ok) { 
		this._schedule = function(cb) {
			setTimeout(cb, 1000/60); /* 60 fps */
		}
	}
}

/**
 * @param {int[]} size
 * @param {id || null} layer layer to resize; when null, whole container is resized
 */
HAF.Engine.prototype.setSize = function(size, layerId) {
	if (layerId) {
		var layer = this._layers[layerId];
		layer.canvas.width = size[0];
		layer.canvas.height = size[1];
		layer.dirty = true;
	} else {
		this._size = size;
		
		this._container.style.width = size[0]+"px";
		this._container.style.height = size[1]+"px";
		
		for (var id in this._layers) {
			var layer = this._layers[id];
			layer.canvas.width = this._size[0];
			layer.canvas.height = this._size[1];
			layer.dirty = true;
		}
	}
}

HAF.Engine.prototype.isRunning = function() {
	return this._running;
}

HAF.Engine.prototype.getContainer = function() {
	return this._container;
}

HAF.Engine.prototype.addLayer = function(id) {
	var canvas = OZ.DOM.elm("canvas", {position:"absolute", className:id});
	canvas.width = this._size[0];
	canvas.height = this._size[1];
	var layer = {
		canvas: canvas,
		ctx: canvas.getContext("2d"),
		id: id,
		dirty: false,
		actors: []
	}
	this._layers[id] = layer;
	this._container.appendChild(canvas);
	return canvas;
}

HAF.Engine.prototype.addActor = function(actor, layerId) {
	var layer = this._layers[layerId];
	layer.actors.unshift(actor); 
	layer.dirty = true;
	actor.tick(0);
}

HAF.Engine.prototype.removeActor = function(actor, layerId) {
	var layer = this._layers[layerId];
	var index = layer.actors.indexOf(actor);
	if (index != -1) { layer.actors.splice(index, 1); }
	layer.dirty = true;
}

HAF.Engine.prototype.removeActors = function(layerId) {
	var layer = this._layers[layerId];
	layer.actors = [];
	layer.dirty = true;
}

HAF.Engine.prototype.setDirty = function(layerId) {
	this._layers[layerId].dirty = true;
}

HAF.Engine.prototype.start = function() {
	this._running = true;
	this.dispatch("start");
	var ts = Date.now();
	this._ts.tick = ts;
	this._ts.draw = ts;
	this.tick();
	this.draw();
}

HAF.Engine.prototype.stop = function() {
	this._running = false;
	this.dispatch("stop");
}

/**
 * (Physics) Time step
 */
HAF.Engine.prototype.tick = function() {
	if (!this._running) { return; }
	
	setTimeout(this.tick, 1000/this._options.fps);

	var ts1 = Date.now();
	var dt = ts1 - this._ts.tick;
	this._ts.tick = ts1;
	var allActors = 0;
	var changedActors = 0;
	
	for (var id in this._layers) { /* for all layers */
		var layer = this._layers[id];
		var dirty = layer.dirty;
		var actors = layer.actors;
		var i = actors.length;
		allActors += i;
		while (i--) { /* tick all actors, remember if any actor changed */
			var changed = actors[i].tick(dt);
			if (changed) { changedActors++; }
			dirty = changed || dirty;
		}
		layer.dirty = dirty;
	}
	
	var ts2 = Date.now();
	this.dispatch("tick", {delay:dt, time:ts2-ts1, all:allActors, changed:changedActors});
}

/**
 * Drawing time step
 */
HAF.Engine.prototype.draw = function() {
	if (!this._running) { return; }
	
	this._schedule.call(window, this.draw); /* schedule next tick */
	var ts1 = Date.now();
	var dt = ts1 - this._ts.draw;
	this._ts.draw = ts1;
	
	for (var id in this._layers) { /* for all layers */
		var layer = this._layers[id];
		if (!layer.dirty) { continue; }

		/* at least one actor changed; redraw canvas */
		layer.dirty = false;
		var actors = layer.actors;
		var i = actors.length; 
		layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height); /* clear canvas */
		while (i--) { actors[i].draw(layer.ctx); }
	}
	
	var ts2 = Date.now();
	this.dispatch("draw", {delay:dt, time:ts2-ts1});
}

/**
 * Abstract FPS monitor
 */
HAF.Monitor = OZ.Class();
HAF.Monitor.prototype.init = function(engine, size, event, options) {
	this._size = size;
	this._options = {
		textColor: "#000",
		chart: true
	};
	for (var p in options) { this._options[p] = options[p]; }
	this._canvas = OZ.DOM.elm("canvas", {width:size[0], height:size[1], className:"monitor"});
	this._ctx = this._canvas.getContext("2d");
	this._ctx.textBaseline = "top";
	this._ctx.font = "10px monospace";
	
	this._data = [];
	this._avg = [];
	
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, event, this._event.bind(this));
}

HAF.Monitor.prototype.getContainer = function() {
	return this._canvas;
}

HAF.Monitor.prototype._start = function(e) {
	this._data = [];
}

HAF.Monitor.prototype._event = function(e) {
	if (this._data.length > this._size[0]) { this._data.shift(); }
	this._avg.push(this._data[this._data.length-1]);
	if (this._avg.length > 30) { this._avg.shift(); }
	this._draw();	
}

HAF.Monitor.prototype._draw = function() {
	this._ctx.clearRect(0, 0, this._size[0], this._size[1]);
}

HAF.Monitor.prototype._drawSet = function(index, color) {
	if (!this._options.chart) { return; }
	this._ctx.beginPath();
	var i = this._data.length;
	var w = this._size[0];
	var h = this._size[1]-0.5;
	while (i--) {
		this._ctx.lineTo(w--, h-this._data[i][index]);
	}
	this._ctx.strokeStyle = color;
	this._ctx.stroke();
}

/**
 * Draw monitor
 */
HAF.Monitor.Draw = OZ.Class().extend(HAF.Monitor);
HAF.Monitor.Draw.prototype.init = function(engine, size, options) {
	HAF.Monitor.prototype.init.call(this, engine, size, "draw", options);
}

HAF.Monitor.Draw.prototype._event = function(e) {
	this._data.push([e.data.delay, e.data.time]);
	HAF.Monitor.prototype._event.call(this, e);
}

HAF.Monitor.Draw.prototype._draw = function() {
	HAF.Monitor.prototype._draw.call(this);
	
	this._drawSet(0, "#88f");
	this._drawSet(1, "#00f");
	
	var avg = [0, 0];
	for (var i=0;i<this._avg.length;i++) {
		avg[0] += this._avg[i][0];
		avg[1] += this._avg[i][1];
	}
	var fps1 = (1000 * this._avg.length / avg[0]).toFixed(1);
	var fps2 = (1000 * this._avg.length / avg[1]).toFixed(1);
	
	var text = "Draw: " + fps1 + "/" + fps2 + " FPS";
	this._ctx.fillStyle = this._options.textColor;
	this._ctx.fillText(text, 5, 5);
}

/**
 * Sim monitor
 */
HAF.Monitor.Sim = OZ.Class().extend(HAF.Monitor);
HAF.Monitor.Sim.prototype.init = function(engine, size, options) {
	HAF.Monitor.prototype.init.call(this, engine, size, "tick", options);
}

HAF.Monitor.Sim.prototype._event = function(e) {
	var frac = e.data.changed/e.data.all;
	frac *= (this._size[1]-1);
	this._data.push([e.data.delay, e.data.time, Math.round(frac), e.data.changed, e.data.all]);
	HAF.Monitor.prototype._event.call(this, e);
}

HAF.Monitor.Sim.prototype._draw = function() {
	HAF.Monitor.prototype._draw.call(this);
	
	this._drawSet(0, "#f88");
	this._drawSet(1, "#f00");
	this._drawSet(2, "#4f4");

	var avg = [0, 0];
	for (var i=0;i<this._avg.length;i++) {
		avg[0] += this._avg[i][0];
		avg[1] += this._avg[i][1];
	}
	var fps1 = (1000 * this._avg.length / avg[0]).toFixed(1);
	var fps2 = (1000 * this._avg.length / avg[1]).toFixed(1);
	
	var changed = this._data[this._data.length-1][3];
	var all = this._data[this._data.length-1][4];
	
	var text = "Sim: " + fps1 + "/" + fps2 + " FPS, " + changed + "/" + all + " changed";
	this._ctx.fillStyle = this._options.textColor;
	this._ctx.fillText(text, 5, 5);
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
 * Static image builder
 */
HAF.Sprite.get = function(url, size, rotation, cache) {
	var item = null;
	
	if (!this._cache[url]) { /* image not ready yet */
		item = {
			img: OZ.DOM.elm("img", {src:url}),
			event: null,
			versions: {}
		}
		item.event = OZ.Event.add(item.img, "load", function(e) {
			OZ.Event.remove(item.event);
			item.event = null;
			for (var p in item.versions) { HAF.Sprite._render(url, p); }
		});
		this._cache[url] = item;
	} else { /* this image was already requested */
		item = this._cache[url];
	}
	
	if (!size) { return; } /* just pre-cache */
	var key = size.join(",") + "," + (rotation % (2*Math.PI)) + "," + (cache ? 1 : 0);
	if (item.versions[key]) { return item.versions[key]; } /* we already have this */
	
	item.versions[key] = OZ.DOM.elm("canvas", {width:size[0], height:size[1]});
	if (!item.event) { return this._render(url, key); } /* image loaded, render & return */

	return item.versions[key]; /* not loaded yet, wait please */
}
HAF.Sprite._cache = {};
/**
 * Render a pre-requested variant of an image
 */
HAF.Sprite._render = function(url, key) {
	var item = this._cache[url];
	var canvas = item.versions[key];
	var context = canvas.getContext("2d");
	var parts = key.split(",");
	var angle = parseFloat(parts[2]);
	
	if (angle) { /* add rotation if requested */
		context.translate(canvas.width/2, canvas.height/2);
		context.rotate(angle);
		context.translate(-canvas.width/2, -canvas.height/2);
	}
	
	context.drawImage(item.img, 0, 0, canvas.width, canvas.height);
	if (parts[3] == "0") { delete item.versions[key]; } /* not to be cached */
	return canvas;
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
