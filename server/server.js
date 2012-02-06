#!/usr/bin/env v8cgi

require.paths.unshift("/home/ondras/svn/v8cgi/lib");
var FS = require("fs");

/* mininal DOM environment */
var nullElm = {
	style: {},
	appendChild: function() {},
	getContext: function() {}
}
var window = {};
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
	eval(f.open("r").read().toString("utf-8"));
}
/* */

HAF.Engine.prototype.draw = function() {}

var Server = require("websocket").Server;
var ws = new Server("0.0.0.0", 8888);
new Game.Server(ws).start();

