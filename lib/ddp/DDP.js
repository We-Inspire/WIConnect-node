var DDPLogic = function(){
    var self = this;
    self.version = "pre1";

    self.parse = function(message){
        try{
                var msg = JSON.parse(message);
        }catch (e){
                return null;
        }

        if(msg === null || typeof msg !== 'object'){
                return null;
        }

        if (_.has(msg, 'cleared')) {
                if (!_.has(msg, 'fields')){
                         msg.fields = {};
                }
                _.each(msg.cleared, function (clearKey) {
                        msg.fields[clearKey] = undefined;
                });
        }

        /*_.each(['fields', 'params', 'result'], function (field) {
                if(msg[field] !== 'undefined'){
                        console.log(msg[field]);
                }
        });*/


        return msg;
    }
    

    self.stringify = function(obj){
        var copy = self._clone(obj);
        if (_.has(obj, 'fields')) {
                var cleared = [];
            _.each(obj.fields, function (value, key) {
              if (value === undefined) {
                cleared.push(key);
                delete copy.fields[key];
              }
            });
            if (!_.isEmpty(cleared))
                copy.cleared = cleared;
        if (_.isEmpty(copy.fields))
                delete copy.fields;
        }

        return JSON.stringify(obj);
    }

    self._clone = function(obj){
        if(typeof obj !== "object"){
                return obj;
        }
        if(obj === null){
                return null;
        }

        if(obj instanceof Date){
                return new Date(obj.getTime());
        }

        var clonedobj;
        if (obj instanceof Array) {
                clonedobj = [];
                for (var i = 0; i < obj.length; i++) {
        clonedobj[i] = self._clone(obj[i]);
        }
        }

        if(typeof obj.clone === 'function'){
                return obj.clone();
        }

        clonedobj = {};
        _.each(obj, function(value, key){
                clonedobj[key]=self._clone(value);
        });

        return clonedobj;
    }

}

DDP = new DDPLogic();
