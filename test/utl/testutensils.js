var assert = require("assert");
var fs     = require("fs");
var crypto = require("crypto");

module.exports = (function() {

  function getBestAvailableHash() {
    return ["ripemd160", "md5", "sha1"].filter(function(h) {
      return crypto.getHashes().indexOf(h) > -1;
    })[0];
  }

  function hashString(pString) {
    return crypto
            .createHash(getBestAvailableHash())
            .update(pString)
            .digest("hex")
    ;
  }

  return {
    assertFileEqual: function(pActualFileName, pExpectedFileName) {
      assert.equal(
          hashString(fs.readFileSync(pActualFileName, {encoding: "utf8"})),
          hashString(fs.readFileSync(pExpectedFileName, {encoding: "utf8"}))
      );
    },
  };
})();
