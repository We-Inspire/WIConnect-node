Subscription = function(subId, name, params, handler){
	var self = this;
	self.id = subId;
	self.name = name;
	self.params = params || [];
	self.handler = handler;

	self.getInfo = function(){
		return self.handler(params);
	}
}
