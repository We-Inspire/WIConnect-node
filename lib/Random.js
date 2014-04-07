/*This is a shorter version of Meteor's random class*/

var UNMISTAKABLE_CHARS = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";


var RandomGenerator = function(){
        var self = this;

        self.id = function(){
                var digits = []; 
                for(var i = 0; i < 17; i++){
                        digits[i] = self.choice(UNMISTAKABLE_CHARS);
                }   

                return digits.join("");    
        };  

        self.choice = function(arrayOrString){
                var index = Math.floor(self.fraction() * arrayOrString.length);
                if(typeof arrayOrString === "string")
                        return arrayOrString.substr(index,1);
                else
                        return arrayOrString[index];
        };  

        self.fraction = function(){
                var numerator = parseInt(self.hexString(8), 16);
                return numerator *  2.3283064365386963e-10;
        }   

        self.hexString = function(digits){
                var numBytes = Math.ceil(digits / 2); 
                var bytes;
                // Try to get cryptographically strong randomness. Fall back to
                // non-cryptographically strong if not available.
                try {
                        bytes = crypto.randomBytes(numBytes);
                } catch (e) {
                        // XXX should re-throw any error except insufficient entropy
                        bytes = crypto.pseudoRandomBytes(numBytes);
                }   
                var result = bytes.toString("hex");
                // If the number of digits is odd, we'll have generated an extra 4 bits
                // of randomness, so we need to trim the last digit.
                return result.substring(0, digits);
        }   
}

Random = new RandomGenerator();
