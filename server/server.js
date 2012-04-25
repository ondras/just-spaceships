#!/usr/bin/env v8cgi

var Server = require("websocket").Server;
var ws = new Server(system.args[1] || "0.0.0.0", system.args[2] || 8888);

require("./wrapper").init(ws);

ws.run();
