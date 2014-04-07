DDPServer = function(server) {
	var self = this;
	
	self.server = server;
	self.sessions = {};
	self.published_subscriptions = {};
	
	//Listen for a new socket
	self.server.on('open',function(socket) {	
		socket.session = null;

		socket.on('data',function(message) {
			self.handleMessage(message, socket);
		});

		socket.on('close',function() {
			if(socket.session && self.sessions[socket.session.id]){
				delete self.sessions[socket.session.id];
				socket.session.kill();
			}
		});
	});

	self.handleMessage = function(message, socket){
		
		try{
			var msg = DDP.parse(message);
		}catch(error){
			self.sendError(socket, 'Could not parse message correctly');
			return;
		}

		//Has the message a valid DDP form?
		if(msg === null || !msg.msg){
			self.sendError(socket, 'Bad Request',msg);
			return;
		}

		//If user sends a connect message
		if(msg.msg === 'connect'){
			if(socket.session){
				self.sendError(socket, 'You are already connected', msg);
				return;
			}
			//Connect the user 
			self.connect(msg, socket);
			return;
		}

		//If user does not send a connect message and is not connected
		if(!socket.session){
			self.sendError(socket, 'You have to send a connect-Message first',msg);
		}

		//All correct? Send Message to session
		socket.session.putMessage(msg);
	}

	//offendingMessage = Error, but correctly parsed message
	self.sendError = function(socket, reason, offendingMessage){
		var errormsg = {msg: 'error', reason: reason};
		if(offendingMessage){
			errormsg.offendingMessage = offendingMessage;
		}
		socket.send(DDP.stringify(msg));
	}

	//Connects either to the client or fails, if protocol version is not supported
	self.connect = function(message, socket) {
		if(message.version == DDP.version) {
			socket.session = new Session(self,socket);
			self.sessions[socket.session.id] = socket.session;
		}else {
			socket.send(DDP.stringify({msg:'failed', version: DDP.version}));
			socket.close();
		}
	}

	//Identify user 
	self.setUserSession = function(data) {
		_.each(self.sessions, function(session) {
			if(session.id == data.nodeid) {
				session.setUserId(data.laravelid);
			}
		});
	}

	//Data has been changed on php side
	self.dataSetChanged = function(data) {
		var data = JSON.parse(data);
		_.each(self.sessions, function(session) {
			_.each(session.subscriptions, function(subscription) {
				var subInfo = subscription.getInfo();
				if(subInfo.table == data.model.table){
					session.dataChanged(data);
				}
			});
		});
	}

	self.publishSubscription = function(name, handler){
		if(name && name in self.published_subscriptions){
			return;
		}

		if(name){
			self.published_subscriptions[name] = handler;
		}
	}
}
