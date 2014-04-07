var dnode = require('dnode')

DNode = function() {

	var self = this;
	
	self.callbacks = [];

	self.server = dnode({
		getData: function(data, cb) {

			_.each(self.callbacks.getData, function(callback) {
				callback(data);
			});
			
			cb("Data received successfully");	

		},

		getUserSession: function(data, cb) {

			_.each(self.callbacks.getUserSession, function(callback) {
				callback(data);
			});

			cb("Session received successfully");
		}

	});

	self.send = function(functionname, data) {
		dnode.connect(CONFIG.dnode_send_port, function(remote, connection) {
			remote[functionname](data, function(status) {
				connection.end();
			});
		});
	};
	
	self.on = function(name, callback) {

		if(!self.callbacks[name]) {
			self.callbacks[name] = [];
		}

		self.callbacks[name].push(callback);
		
	}

	self.server.listen(CONFIG.dnode_listen_port);
	console.log("DNode server listen on port: " + CONFIG.dnode_listen_port);

};
