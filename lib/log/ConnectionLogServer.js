ConnectionLogServer = function(server) {
	var self = this;
	
	self.server = server;
	
	//Listen for a new socket
	self.server.on('open',function(socket) {	
		console.log("Connection opened");
	});

	self.server.on('data', function(socket, message){
		console.log("Received message" + message);
	});

	self.server.on('close', function(socket){
		console.log("Connection closed");			
	});

	self.server.on('send',function(socket, data){
		console.log("Data send:" + data);
	});
}
