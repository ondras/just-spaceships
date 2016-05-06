var fs = require('fs')
var base = __dirname + "/..";

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
	var html = fs.readFileSync(base + "/index.html", "utf-8");
	var scripts = html.match(/js\/.*?\.js/g);
	for (var i=0;i<scripts.length;i++) {
		var f = base + "/" + scripts[i];;
		console.log("Loading", f);
		try {
			var str = fs.readFileSync(f, "utf-8");
			eval(str);
		} catch (e) {
			console.log(e);
		}
	}
	/* */

	HAF.Engine.prototype.draw = function() {}
	new Game.Server(ws).start();
}
