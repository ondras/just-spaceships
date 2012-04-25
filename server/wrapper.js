var FS = require("fs");

exports.init = function(ws) {
	/* mininal DOM environment */
	var nullElm = {
		style: {},
		appendChild: function() {},
		getContext: function() {}
	}
	var window = {};
	var location = {};
	var document = {
		createElement: function() { return nullElm; }
	};
	var navigator = {userAgent:""};
	global.setTimeout = function() {};

	/* read all javascript files */
	var index = new FS.File("../index.html").open("r");
	var html = index.read().toString("utf-8");
	index.close();
	var scripts = html.match(/js\/.*?\.js/g);
	for (var i=0;i<scripts.length;i++) {
		var f = new FS.File("../"+scripts[i]);
		system.stdout.writeLine("Loading " + f);
		try {
			eval(f.open("r").read().toString("utf-8"));
		} catch (e) {
			system.stdout.writeLine(e);
		}
	}
	/* */

	HAF.Engine.prototype.draw = function() {}
	new Game.Server(ws).start();
}
