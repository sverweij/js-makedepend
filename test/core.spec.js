var assert = require("assert");
var core = require("../src/core.js");

describe('#core - main', function() {
    it("basic operation on cli.js' src/", function() {
        var lActualDepLines = core.getDependencyStrings("src", "", "# DO NOT DELETE THIS LINE");
        var lExpectedDepLines = [ '\n# DO NOT DELETE THIS LINE\n\n',
            '# amd dependencies\n',
            '',
            '# commonJS dependencies\n',
            'src/chewy.js: \\\n\tsrc/core.js \\\n\tsrc/utl.js\n\nsrc/cli.js: \\\n\tnode_modules/commander/index.js \\\n\tsrc/chewy.js\n\nsrc/core.js: \\\n\tnode_modules/madge/lib/madge.js \\\n\tsrc/utl.js\n\nsrc/utl.js:\n\n',
            '# ES6 dependencies\n',
            ''
        ];

        lExpectedDepLines.forEach(function(pExpectedLine, pNr){
            assert.equal(lActualDepLines[pNr], pExpectedLine);
        });
    });
    
    it("basic operation on cli.js' src/chewy.js", function() {
        var lActualDepLines = core.getDependencyStrings("src/chewy.js", "", "# DO NOT DELETE THIS LINE");
        var lExpectedDepLines = [
             "\n# DO NOT DELETE THIS LINE\n\n",
             "# amd dependencies\n",
             "",
             "# commonJS dependencies\n",
             "src/chewy.js: \\\n\tsrc/core.js \\\n\tsrc/utl.js\n\n",
             "# ES6 dependencies\n",
             ""
        ];

        lExpectedDepLines.forEach(function(pExpectedLine, pNr){
            assert.equal(lActualDepLines[pNr], pExpectedLine);
        });
    });

});
