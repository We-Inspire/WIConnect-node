_ = require('underscore');
Fiber = require('fibers');
sockjs = require('sockjs');
crypto = require('crypto');
EJSON = require('meteor-ejson');

require('./lib/Random.js');
require('./lib/ddp/DDP.js');
require('./lib/SockJSServer.js');
require('./lib/ddp/Subscription.js');
require('./lib/ddp/Session.js');
require('./lib/ddp/DDPServer.js');
require('./lib/log/ConnectionLogServer.js');
require('./lib/dnode/DNode.js');


module.exports = function(httpServer){
	var sockjsServer = new SockJSServer(httpServer);
	//var conLogServer = new ConnectionLogServer(sockjsServer);
	var ddpServer = new DDPServer(sockjsServer);
	var dnode = new DNode;

	return {
		sockjsServer: sockjsServer,
		ddpServer: ddpServer,
		dnode: dnode
	};
}