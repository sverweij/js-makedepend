var assert = require("assert");
var core = require("../src/core.js");

describe('#core - main', function() {
    it("basic operation on test/fixtures/cjs", function() {
        var lActualDepLines = core.getDependencyStrings("test/fixtures/cjs", {delimiter:"# DO NOT DELETE THIS LINE"});
        var lExpectedDepLines = [
             "\n# DO NOT DELETE THIS LINE\n\n",
             "# amd dependencies\n",
             "",
             "# commonJS dependencies\n",
             "test/fixtures/cjs/root_one.js: \\\n\tnode_modules/commander/index.js \\\n\ttest/fixtures/cjs/one_only_one.js \\\n\ttest/fixtures/cjs/one_only_two.js \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/sub/dir.js\n\ntest/fixtures/cjs/root_two.js: \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/two_only_one.js\n\ntest/fixtures/cjs/sub/dir.js: \\\n\ttest/fixtures/cjs/sub/depindir.js\n\ntest/fixtures/cjs/two_only_one.js: \\\n\ttest/fixtures/cjs/sub/dir.js\n\n",
             "# ES6 dependencies\n",
             ""
        ];

        lExpectedDepLines.forEach(function(pExpectedLine, pNr){
            assert.equal(lActualDepLines[pNr], pExpectedLine);
        });
    });
    
    it("basic operation on test/fixtures/cjs/root_two.js", function() {
        var lActualDepLines = core.getDependencyStrings("test/fixtures/cjs/root_two.js", {delimiter:"# DO NOT DELETE THIS LINE"});
        var lExpectedDepLines = [
             "\n# DO NOT DELETE THIS LINE\n\n",
             "# amd dependencies\n",
             "",
             "# commonJS dependencies\n",
             "test/fixtures/cjs/root_two.js: \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/two_only_one.js\n\ntest/fixtures/cjs/two_only_one.js: \\\n\ttest/fixtures/cjs/sub/dir.js\n\ntest/fixtures/cjs/sub/dir.js: \\\n\ttest/fixtures/cjs/sub/depindir.js\n\n",
             "# ES6 dependencies\n",
             ""
        ];
        
        lExpectedDepLines.forEach(function(pExpectedLine, pNr){
            assert.equal(lActualDepLines[pNr], pExpectedLine);
        });
    });

});
