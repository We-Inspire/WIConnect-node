Session = function(ddpserver, socket){
	var self = this;

	self.ddpserver = ddpserver;
	self.socket = socket;

	self.id = Random.id() + new Date().getTime(); 
	self.user_id = null;

	/*
		connected (server->client)
			session: string (an identifier for the DDP session)
	*/

	self.subscriptions = {};

	self.send = function(message){
		if(self.socket){
			self.socket.send(DDP.stringify(message));
		}
	}

	self.send({msg: 'connected', session: self.id});
	/*
		The error message contains the following fields:
			reason: string describing the error
			offendingMessage: if the original message parsed properly, it is included here
	*/
	self.sendError = function(reason, offendingMessage){
		var errormsg = {msg: 'error', reason: reason};
		if(offendingMessage){
			errormsg.offendingMessage = offendingMessage;
		}
		self.send(DDP.stringify(msg));
	}

	/*
		nosub (server -> client):
			id: string (the id passed to 'sub')
			error: optional Error (an error raised by the subscription as it concludes, or sub-not-found)
	*/
	self.sendNosub = function(id, error){
		var msg = {
			msg: 'nosub',
			id: id,
		}

		if(error){
			msg.error = error;
		}
			
		self.send(msg);
	}

	/*
		added (server -> client):
			collection: string (collection name)
			id: string (document ID)
			fields: optional object with EJSON values
	*/
	self.sendAdded = function(collection_name, id, fields){
		var msg = {
			msg: 'added',
			collection: collection_name,
			id: id
		};

		if(fields){
			msg.fields = fields;
		}

		self.send(msg);
	}
	
	/*
		changed (server -> client):
			collection: string (collection name)
			id: string (document ID)
			fields: optional object with EJSON values
			cleared: optional array of strings (field names to delete)
	*/
	self.sendChanged = function(collection_name, id, fields, cleared_fields){
		var msg = {
			msg: 'changed',
			collection: collection_name,
			id: id
		};

		if(fields){
			msg.fields = fields;
		}

		if(cleared_fields){
			msg.cleared = cleared_fields;
		}


		self.send(msg);
	}

	/*
		removed (server -> client):
			collection: string (collection name)
			id: string (document ID)
	*/
	self.sendRemoved = function(collection_name, id){
		var msg = {
			msg: 'removed',
			collection: collection_name,
			id: id
		}
		self.send(msg);
	}

	/*
		ready (server -> client):
			subs: array of strings (ids passed to 'sub' which have sent their initial batch of data)
	*/
	self.sendReady = function(sub_ids){
		var msg = {
			msg: 'ready',
			subs: sub_ids
		}
		self.send(msg);
	}

	/*
		addedBefore (server -> client):
			collection: string (collection name)
			id: string (document ID)
			fields: optional object with EJSON values
			before: string or null (the document ID to add the document before, or null to add at the end)
	*/
	self.sendAddedBefore = function(){

	}

	/*	
		movedBefore (server -> client):
			collection: string
			id: string (the document ID)
			before: string or null (the document ID to move the document before, or null to move to the end)
	*/
	self.sendMovedBefore = function(){

	}

	/************************UPDATE RECEIVING FROM DNODE***************************/
	self.dataChanged = function(data){
		switch(data.type){
			case 'create':
				self.sendAdded(data.model.table,data.model.item.id,data.model.item);
				break;
			case 'update':
				self.sendChanged(data.model.table,data.model.item.id,data.model.item);
				break;
			case 'delete':
				self.sendRemoved(data.model.table,data.model.item.id);
				break;
		}
	}

	self.setUserId = function(sessionid){
		self.user_id = sessionid;
	}


	/**************************Get Message from DDP-Server******************************/
	self.putMessage = function(message){
		switch(message.msg){
			case 'sub':
				self.addSub(message);
				break;
			case 'unsub':
				self.removeSub(message);
				break;
			case 'method':
				break;
			case 'subBroadcast':
				self.addBroadcastSub(message);	
				break;
			case 'unsubBroadcast':
				self.removeBroadcastSub(message);
				break;
			case 'broadcast':
				self.receiveBroadcast(message);
				break;
		}
	}

	/**
		sub (client -> server):
			id: string (an arbitrary client-determined identifier for this subscription)
			name: string (the name of the subscription)
			params: optional array of EJSON items (parameters to the subscription)
	*/
	self.addSub = function(message){
		if(typeof message.id !== "string" || typeof message.name !== "string" || (('params' in message) && !(message.params instanceof Array))) {
			self.sendError("subscription has the wrong format", message);
			return;
		}

		if(!self.ddpserver.published_subscriptions[message.name]){
			self.sendNosub(message.id, "Subscription not found");
			return;
		}

		if(_.has(self.subscriptions,message.id)){
			return;
		}

		self.subscriptions[message.id] = new Subscription(message.id, message.name, message.params, self.ddpserver.published_subscriptions[message.name]);
	}

	/*
		unsub (client -> server):
			id: string (the id passed to 'sub')
	*/
	self.removeSub = function(message){
		if(message.id && self.subscriptions[message.id]) {
			delete self.subscriptions[message.id];
		}

		self.sendNosub(message.id);
	}



	/*DDP-Extension Broadcasting*/
	self.broadcastChannels = {};

	self.sendBroadcast = function(channel, data, user){
		var msg = {
			msg: 'broadcast',
			channel: channel,
			data: data,
			user: user
		}
		self.send(msg);
	}


	self.receiveBroadcast = function(message){
		_.each(self.ddpserver.sessions, function(session) {
			if(session.id != self.id) {
				_.each(session.broadcastChannels, function(broadcastchannel) {
					if(broadcastchannel == message.channel)
						session.sendBroadcast(message.channel, message.data, self.id);
				});	
			}
		});
	}

	self.addBroadcastSub = function(message){
		if(typeof message.id !== "string" || typeof message.channel !== "string" ) {
			self.sendError("Broadcast subscription has the wrong format", message);
			return;
		}

		if(_.has(self.broadcastChannels,message.id)){
			return;
		}

		self.broadcastChannels[message.id] = message.channel;

	}

	self.removeBroadcastSub = function(message){
		if(message.id && self.broadcastChannels[message.id]) {
			delete self.broadcastChannels[message.id];
		}

		self.sendNosubBroadcast(message.id);
	}

	self.sendNosubBroadcast = function(id, error){
		var msg = {
			msg: 'nosubBroadcasat',
			id: id,
		}

		if(error){
			msg.error = error;
		}
			
		self.send(msg);
	}

	self.kill = function(){
		if(self.socket){
			self.socket.close();
			self.socket.session = null;
		}
	}
}
