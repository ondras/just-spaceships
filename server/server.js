#!/usr/bin/env v8cgi

require.paths.unshift("/home/ondras/svn/v8cgi/lib");

var Server = require("websocket").Server;
var ws = new Server("0.0.0.0", 8888);

var clients = [];

var app = {
	onmessage: function(client, data) {
		data = JSON.parse(data);

		var index = -1;
		for (var i=0;i<clients.length;i++) { if (clients[i].client == client) { index = i; } }
		
		var c = clients[index];
		for (var id in data) {
			c.ships[id] = data[id];
		}
		
		for (var i=0;i<clients.length;i++) {
			if (i == index) { continue; }
			ws.send(clients[i].client, data);
		}
	},
	onconnect: function(client, headers) {
		var otherShips = {};
		for (var i=0;i<clients.length;i++) {
			for (var id in clients[i].ships) {
				otherShips[id] = clients[i].ships[id];
			}
		}
		clients.push({
			client: client,
			ships: {}
		});
		ws.send(client, JSON.stringify(otherShips)); 
	},

	ondisconnect: function(client, code, message) {
		var index = -1;
		for (var i=0;i<clients.length;i++) { if (clients[i].client == client) { index = i; } }
		
		if (index != -1) { 
			var data = clients[index];
			clients.splice(index, 1); 
			for (var id in data.ships) { data.ships[id] = null; }
			for (var i=0;i<clients.length;i++) {
				ws.send(clients[i].client, JSON.stringify(data.ships));
			}
		}
	},
	
	onidle: function() { 
/*		system.stdout.write(".");
		system.stdout.flush(); */
	},

	path: "/space"
};

ws.addApplication(app);
ws.run();
