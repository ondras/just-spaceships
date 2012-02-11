var Setup = OZ.Class();
Setup.URL = "ws://" + location.hostname + ":8888/space";
Setup.prototype.init = function() {
	this._dom = {};
	this._ship = null;
	
	this._build();
	if (localStorage.mode == "multi") {
		this._clickMulti();
	} else {
		this._clickSingle();
	}
	
	this._selectColor(localStorage.color || Ship.random().color);
	this._selectShip(typeof(localStorage.type) == "string" ? localStorage.type : 1);
}

Setup.prototype._build = function() {
	var container = OZ.DOM.elm("div", {id:"setup"});
	
	var h1 = OZ.DOM.elm("h1", {innerHTML:"Just Spaceships!"});
	container.appendChild(h1);
	
	var label = OZ.DOM.elm("label", {innerHTML:"Name: "});
	this._dom.name = OZ.DOM.elm("input", {type:"text"});
	this._dom.name.value = localStorage.name || "Human pilot #" + Math.round(Math.random()*100+1);
	label.appendChild(this._dom.name);
	container.appendChild(label);
	
	container.appendChild(OZ.DOM.elm("hr"));

	this._dom.single = this._buildButton("Singleplayer", this._clickSingle);
	this._dom.multi = this._buildButton("Multiplayer", this._clickMulti);
	container.appendChild(this._buildSet([this._dom.single, this._dom.multi]));
	this._dom.variable = OZ.DOM.elm("div");
	container.appendChild(this._dom.variable);
	
	container.appendChild(OZ.DOM.elm("hr"));
	
	var label = OZ.DOM.elm("label", {innerHTML:"Ship color: "});
	this._dom.color = OZ.DOM.elm("select");
	var colors = ["red", "green", "yellow", "blue", "purple"];
	for (var i=0;i<colors.length;i++) {
		var c = colors[i];
		var o = OZ.DOM.elm("option", {value:c, innerHTML:c});
		this._dom.color.appendChild(o);
	}
	OZ.Event.add(this._dom.color, "change", this._changeColor.bind(this));
	label.appendChild(this._dom.color);
	container.appendChild(label);

	var labels = ["More maneuverable", "Normal", "More hitpoints"];
	var buttons = [];
	for (var i=0;i<labels.length;i++) {
		var button = this._buildButton(labels[i], this._clickShip);
		var img = OZ.DOM.elm("img", {width:"64px", height:"64px"});
		button.insertBefore(img, button.firstChild);
		buttons.push(button);
	}
	this._dom.ships = this._buildSet(buttons);
	container.appendChild(this._dom.ships);

	container.appendChild(OZ.DOM.elm("hr"));
	
	var play = this._buildButton("Play!", this._play);
	play.className = "play";
	container.appendChild(play);

	this._dom.singleDetails = OZ.DOM.elm("div");
	var label = OZ.DOM.elm("label", {innerHTML:"Enemies: "});
	this._dom.enemies = OZ.DOM.elm("input", {type:"text", value:"3", size:"2"});
	label.appendChild(this._dom.enemies);
	this._dom.singleDetails.appendChild(label);

	this._dom.multiDetails = OZ.DOM.elm("div");
	var label = OZ.DOM.elm("label", {innerHTML:"Server URL: "});
	this._dom.url = OZ.DOM.elm("input", {type:"text"});
	this._dom.url.value = localStorage.url || this.constructor.URL;
	label.appendChild(this._dom.url);
	this._dom.multiDetails.appendChild(label);


	document.body.appendChild(container);
	
	this._buildTips();
}

Setup.prototype._buildTips = function() {
	var tips = OZ.DOM.elm("div", {id:"tips"});
	var handle = OZ.DOM.elm("h2", {innerHTML:"gameplay&nbsp;tips"});
	var content = OZ.DOM.elm("ul");
	
	var list = [
		"Use arrow keys to control your ship; hold Ctrl or Spacebar to shoot",
		"Reduce browser window size to increase frame rate",
		"Ship's color and size has no effect on its performance",
		"In order to play multiplayer, your browser must support Web Sockets (Firefox, Chrome)",
		"Audio does not work well in Firefox/Linux, but other combinations are okay - put on your headphones!",
		"Graphic sprites are &copy;&nbsp;Elemental Games",
		"This game was created by <a href='http://ondras.zarovi.cz/'>Ondřej Žára</a>",
	];
	
	while (list.length) { content.appendChild(OZ.DOM.elm("li", {innerHTML:list.shift()})); }
	
	
	OZ.DOM.append(
		[tips, handle, content],
		[document.body, tips]
	);
}

Setup.prototype._buildButton = function(innerHTML, cb) {
	var button = OZ.DOM.elm("button");
	button.innerHTML = innerHTML;
	OZ.Event.add(button, "click", cb.bind(this));
	return button;
}

Setup.prototype._buildSet = function(buttons) {
	var set = OZ.DOM.elm("div", {className:"button-set"});
	for (var i=0;i<buttons.length;i++) { set.appendChild(buttons[i]); }
	return set;
}

Setup.prototype._activateButton = function(button) {
	var buttons = button.parentNode.getElementsByTagName("button");
	for (var i=0;i<buttons.length;i++) {
		var b = buttons[i];
		if (b == button) {
			OZ.DOM.addClass(b, "active");
		} else {
			OZ.DOM.removeClass(b, "active");
		}
	}
}

Setup.prototype._clickSingle = function(e) {
	this._activateButton(this._dom.single);
	OZ.DOM.clear(this._dom.variable);
	this._dom.variable.appendChild(this._dom.singleDetails);
}

Setup.prototype._clickMulti = function(e) {
	this._activateButton(this._dom.multi);
	OZ.DOM.clear(this._dom.variable);
	this._dom.variable.appendChild(this._dom.multiDetails);
}

Setup.prototype._changeColor = function(e) {
	this._selectColor(OZ.Event.target(e).value);
}

Setup.prototype._selectColor = function(color) {
	this._dom.color.value = color;
	this._shipColor = color;
	
	for (var i=0;i<Ship.types.length;i++) {
		var image = Ship.getImageName(color, i) + "_000.png";
		this._dom.ships.getElementsByTagName("button")[i].getElementsByTagName("img")[0].src = image;
	}
}

Setup.prototype._clickShip = function(e) {
	var button = OZ.Event.target(e);
	while (button.tagName.toLowerCase() != "button") { button = button.parentNode; }
	var buttons = button.parentNode.getElementsByTagName("button");
	for (var i=0;i<buttons.length;i++) {
		if (button == buttons[i]) { this._selectShip(i); }
	}
}

Setup.prototype._selectShip = function(index) {
	var buttons = this._dom.ships.getElementsByTagName("button");
	this._activateButton(buttons[index]);
	this._ship = index;
}

Setup.prototype._play = function(e) {
	OZ.DOM.clear(document.body);
	var game = null;
	var name = this._dom.name.value;
	var ship = {
		color:this._dom.color.value,
		type:this._ship
	};
	localStorage.name = name;
	localStorage.color = ship.color;
	localStorage.type = ship.type;
	
	if (OZ.DOM.hasClass(this._dom.single, "active")) {
		var enemies = parseInt(this._dom.enemies.value) || 3;
		game = new Game.Single(name, ship, enemies);
		localStorage.mode = "single";
	} else {
		var url = this._dom.url.value;
		localStorage.url = url;
		game = new Game.Multi(name, ship, url);
		localStorage.mode = "multi";
	}
	
	game.start();
	
	window.g = game;
}

