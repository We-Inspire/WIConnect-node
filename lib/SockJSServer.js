var sockjs = require('sockjs');

/**
	SockJSServer initialises a SockJS connection
	It saves all sockets
*/

SockJSServer = function(httpServer){
	var self = this;

	//Array of all sockets
	self.sockets = [];
	
	//Array of all listeners
	self.callbacks = [];

	var serverOptions = {
	    prefix: CONFIG.wsprefix,
	    log: function() {},
	    // this is the default, but we code it explicitly because we depend
	    // on it in stream_client:HEARTBEAT_TIMEOUT
	    heartbeat_delay: 25000,
	    // The default disconnect_delay is 5 seconds, but if the server ends up CPU
	    // bound for that much time, SockJS might not notice that the user has
	    // reconnected because the timer (of disconnect_delay ms) can fire before
	    // SockJS processes the new connection. Eventually we'll fix this by not
	    // combining CPU-heavy processing with SockJS termination (eg a proxy which
	    // converts to Unix sockets) but for now, raise the delay.
	    disconnect_delay: 60 * 1000,
	};

	//Create sockjs server
	self.server = sockjs.createServer(serverOptions);

	//Add Listeners to the socksjs connection
	self.server.on('connection', function(socket){

		socket.send = function(data){
			socket.write(data);
			_.each(self.callbacks.send, function(callback) {
				callback(socket, data);
			});
		};
	
		socket.on('data', function(data){
			_.each(self.callbacks.data, function(callback) {
				callback(socket, data);
			});
		});
	
		socket.on('close', function() {
			self.sockets = _.without(self.sockets,socket);
			//Send message to close callbacks
			_.each(self.callbacks.close, function(callback) {
				callback(socket);
			});
		});

		self.sockets.push(socket);

		socket.send(JSON.stringify({msg:'hello'}));

		//Send socket open message to all registered callbacks
		_.each(self.callbacks.open, function(callback) {
			callback(socket);
		});
	});

	//Returns an array of all sockets
	self.getSockets = function() {
		return _.values(self.sockets);
	}

	//Add a listener to callbacks
	self.on = function(name, callback) {
		if(!self.callbacks[name]){
			self.callbacks[name] = [];
		}
		self.callbacks[name].push(callback);
	}

	self.server.installHandlers(httpServer, {prefix:CONFIG.wsprefix});

}
