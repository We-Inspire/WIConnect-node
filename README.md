WIConnect-node
==============


You have to use the Node.js package in combination with the Laravel package.
#Installation
npm install wiconnect

#How to use
Copy the index.js from the example folder to your main application and adapt it.


##Necessary steps:
1. Set the path to the npm module
	```javascript
	var weinspire = require("wiconnect");
	```

2. Adapt the CONFIG-Array
	```javascript
	CONFIG = [];
	CONFIG.wsprefix = "/sockjs";
	CONFIG.wsport = 3000;
	CONFIG.dnode_listen_port = 5004;
	CONFIG.dnode_send_port = 5005;
	```

3. Create a http-Server
	```javascript
	var httpServer = http.createServer();
	httpServer.listen(CONFIG.wsport,'0.0.0.0');
	```

4. Start the package
	```javascript
	var serverinterface = weinspire(httpServer);
	```

5. Replace and set the tables, which should accessable via publishSubscriptionns.
	```javascript
	serverinterface.ddpServer.publishSubscription("posts",function(){
		var obj = {};
		obj.table = "posts";
		return obj;
	});
	```

	NOTICE: Take care of security issues 

6. Connect DDP with dNode-functions
	```javascript
	serverinterface.dnode.on("getUserSession",serverinterface.ddpServer.setUserSession);
	serverinterface.dnode.on("getData",serverinterface.ddpServer.dataSetChanged);
	```

#Client:
You will get a client with the laravel package. You can send packages to the Node.js-Server with javascript-commands.

* Subscribe to a subscription published on the server
```javascript
	var handle = connection.subscribe("table")
```

* Cancel a subscription
```javascript
	handle.stop();
```

* Send a broadcast
```javascript
	connection.subscribeBroadcast("channel",dadaobj);
```

* Subscribe to a broadcast-channel
```javascript
	connection.subscribeBroadcast("channel");
```

* Cancel broadcast-subscription
```javascript
	handle.stop();
```

* Receive messages
```javascript
	connection.on('chats', function(doc, messagetype){});
```

* Receive broadcasts
```javascript
	connection.on('broadcast', function(message){});
```
