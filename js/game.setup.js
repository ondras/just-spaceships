Game.Setup = OZ.Class();
Game.Setup.prototype.init = function() {
	this._dom = {};
	this._ship = null;
	
	this._build();
	this._clickSingle();
	this._selectColor("yellow");
	this._selectShip(1);
}

Game.Setup.prototype._build = function() {
	var container = OZ.DOM.elm("div", {id:"setup"});
	
	this._dom.single = this._buildButton("Singleplayer", this._clickSingle);
	this._dom.multi = this._buildButton("Multiplayer", this._clickMulti);
	container.appendChild(this._buildSet([this._dom.single, this._dom.multi]));
	
	container.appendChild(OZ.DOM.elm("hr"));
	
	var label = OZ.DOM.elm("label", {innerHTML:"Name: "});
	this._dom.name = OZ.DOM.elm("input", {type:"text", value:"Human pilot #" + Math.round(Math.random()*100)});
	label.appendChild(this._dom.name);
	container.appendChild(label);
	
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
	container.appendChild(play);

	document.body.appendChild(container);
}

Game.Setup.prototype._buildButton = function(innerHTML, cb) {
	var button = OZ.DOM.elm("button");
	button.innerHTML = innerHTML;
	OZ.Event.add(button, "click", cb.bind(this));
	return button;
}

Game.Setup.prototype._buildSet = function(buttons) {
	var set = OZ.DOM.elm("div", {className:"button-set"});
	for (var i=0;i<buttons.length;i++) { set.appendChild(buttons[i]); }
	return set;
}

Game.Setup.prototype._activateButton = function(button) {
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

Game.Setup.prototype._clickSingle = function(e) {
	this._activateButton(this._dom.single);
}

Game.Setup.prototype._clickMulti = function(e) {
	this._activateButton(this._dom.multi);
}

Game.Setup.prototype._changeColor = function(e) {
	this._selectColor(OZ.Event.target(e).value);
}

Game.Setup.prototype._selectColor = function(color) {
	this._dom.color.value = color;
	this._shipColor = color;
	
	for (var i=0;i<Ship.types.length;i++) {
		var image = Ship.getImageName(color, i) + "_000.png";
		this._dom.ships.getElementsByTagName("button")[i].getElementsByTagName("img")[0].src = image;
	}
}

Game.Setup.prototype._play = function(e) {
	OZ.DOM.clear(document.body);
	var game = null;
	var ship = {name:"FIXME"};
	
	if (OZ.DOM.hasClass(this._dom.single, "active")) {
		game = new Game.Single(ship);
	} else {
		game = new Game.Multi(ship);
	}
	
	game.start();
}

Game.Setup.prototype._clickShip = function(e) {
	var button = OZ.Event.target(e);
	var buttons = button.parentNode.getElementsByTagName("button");
	for (var i=0;i<buttons.length;i++) {
		if (button == buttons[i]) { this._selectShip(i); }
	}
}

Game.Setup.prototype._selectShip = function(index) {
	var buttons = this._dom.ships.getElementsByTagName("button");
	this._activateButton(buttons[index]);
	this._ship = index;
}
