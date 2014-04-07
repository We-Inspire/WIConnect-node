http = require('http');
var weinspire = require("../../WIConnect");


CONFIG = [];
CONFIG.wsprefix = "/sockjs";
CONFIG.wsport = 3000;
CONFIG.dnode_listen_port = 5004;
CONFIG.dnode_send_port = 5005;

var httpServer = http.createServer();
httpServer.listen(CONFIG.wsport,'0.0.0.0');

var serverinterface = weinspire(httpServer);

serverinterface.ddpServer.publishSubscription("posts",function(){
	var obj = {};
	obj.table = "posts";
	return obj;
});

serverinterface.dnode.on("getUserSession",serverinterface.ddpServer.setUserSession);
serverinterface.dnode.on("getData",serverinterface.ddpServer.dataSetChanged);

