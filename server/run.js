#!/usr/bin/env node

var Server = require("./ws-proxy").Server;
var ws = new Server(process.argv[2] || "0.0.0.0", process.argv[3] || 8888);

require("./server").init(ws);

ws.run();
