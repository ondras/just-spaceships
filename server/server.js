#!/usr/bin/env v8cgi

require.paths.unshift("/home/ondras/svn/v8cgi/lib");
var FS = require("fs");

/* FAKE ENVIRONMENT */
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

var files = ["oz", "haf", "game", "../server/game.server", "ship", "ship.mini", "pilot", "weapon"];
for (var i=0;i<files.length;i++) {
	var f = new FS.File("../js/"+files[i]+".js");
	system.stdout.writeLine(f);
	eval(f.open("r").read().toString("utf-8"));
}

HAF.Engine.prototype.draw = function() {}
/* */


var Server = require("websocket").Server;
var ws = new Server("0.0.0.0", 8888);
var game = new Game.Server(ws);
game.start();
