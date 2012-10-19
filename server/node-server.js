var fs = require('fs')

var rootDirectory = __dirname.substring(0, __dirname.indexOf('/server')) + '/';
console.log('__dirname: ' + __dirname);
console.log('root directory: ' + rootDirectory);

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
var createjs = {};
global.setTimeout = function() {};

/* read all javascript files */
var html = fs.readFileSync(rootDirectory + 'index.html', 'utf-8');

var scripts = html.match(/js\/.*?\.js/g);
var totalScript = '';
for (var i=0;i<scripts.length;i++) {

    if (scripts[i].indexOf('setup.js') > 0 ||
        scripts[i].indexOf('setup.local.js') > 0) continue;

	console.log('loading: ' + scripts[i]);

	try {
		var scr = fs.readFileSync(rootDirectory + scripts[i], 'utf-8');
		totalScript += scr;
		eval(scr);
	} catch (e) {
		console.log(e);
	}
}
/* */

Game.Server.prototype._debug = function(str) {
    console.log(str);
}

HAF.Engine.prototype.draw = function() {}




/* Wrapper instance to get Game.Server */
var ws = {
	isInitialized: false,
	initialize: function() {
		if (ws.isInitialized) return;


		new Game.Server(ws).start();
	},
	addApplication: function(gameServer) {
		ws.gameServer = gameServer;
		ws.isInitialized = true;

        if (ws.gameServer.onidle) {
            setInterval(ws.gameServer.onidle.bind(ws.gameServer), 15);
        }
	},
	send: function(id, data) {
		if (!(id in clients)) { return; }

		clients[id].send(data);
	},
	setDebug: function() {

	}
}
ws.initialize();




/* Web Server */
var WebSocketServer = require('websocket').server;
var static = require('node-static');
var file = new(static.Server)(rootDirectory);


server = require('http').createServer(function(req, res) {
  	req.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(req, res);
    });
});
server.listen(process.env.PORT || 8888, function() {
    console.log((new Date()) + ' Server is listening on port 8888');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var userTricks = 0;
var clients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    if (!ws.isInitialized) {
    	console.log('ws not initialized yet!');
    	return;
    }

    console.log(JSON.stringify(request.requestedProtocols));
    console.log(JSON.stringify(request.requestedExtensions));
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');



    connection.clientid = Math.random().toString().replace("0.", "");
    clients[connection.clientid] = connection;

    ws.gameServer.onconnect(connection.clientid, request.httpRequest.headers);


    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);

        	ws.gameServer.onmessage(connection.clientid, message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }

    });
    connection.on('close', function(reasonCode, description) {
    	if (connection.clientid in clients) {
    		delete clients[connection.clientid];
    	}

        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    	ws.gameServer.ondisconnect(connection.clientid, '', '');
    });
    connection.on('error', function(err) {
        console.log((new Date()) + ' Error: ' + err);
    });
});





