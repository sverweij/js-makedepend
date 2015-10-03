var assert = require("assert");
var fs     = require('fs');
var crypto = require('crypto');

var gHashToUse = [ 'ripemd160', 'md5', 'sha1'].filter(function(h){
    return crypto.getHashes().indexOf(h) > -1;
})[0];

module.exports = (function() {
    
    function hashit(pString){
        return crypto.createHash(gHashToUse).update(pString).digest('hex');
    }
    
    return {
        assertFileEqual : function(pActualFileName,pExpectedFileName) {
            assert.equal(
                hashit(fs.readFileSync(pActualFileName, {"encoding": "utf8"})), 
                hashit(fs.readFileSync(pExpectedFileName, {"encoding": "utf8"}))
            );
        }
    };
})();
