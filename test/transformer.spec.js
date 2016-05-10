const assert      = require("assert");
const transformer = require("../src/transformer.js");

describe("#transformer - main", () => {
    xit("basic operation on test/fixtures/cjs", () => {
        let lActualDepLines = transformer.getDependencyStrings("test/fixtures/cjs", {delimiter:"# DO NOT DELETE THIS LINE", system:["amd", "cjs", "es6"]});
        let lExpectedDepLines =
             "\n# DO NOT DELETE THIS LINE\n\n" +
             "# amd dependencies\n" +
             "" +
             "# cjs dependencies\n" +
             "test/fixtures/cjs/root_one.js: \\\n\tnode_modules/commander/index.js \\\n\ttest/fixtures/cjs/one_only_one.js \\\n\ttest/fixtures/cjs/one_only_two.js \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/sub/dir.js\n\ntest/fixtures/cjs/root_two.js: \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/somedata.json \\\n\ttest/fixtures/cjs/two_only_one.js\n\ntest/fixtures/cjs/sub/dir.js: \\\n\ttest/fixtures/cjs/sub/depindir.js\n\ntest/fixtures/cjs/two_only_one.js: \\\n\ttest/fixtures/cjs/sub/dir.js\n\n" +
             "# es6 dependencies\n" +
             "";

        lExpectedDepLines.forEach(function(pExpectedLine, pNr) {
            assert.equal(lActualDepLines[pNr], pExpectedLine);
        });
    });

    it("basic operation on test/fixtures/cjs/root_two.js", () => {
        let lActualDepLines = transformer.getDependencyStrings("test/fixtures/cjs/root_two.js", {delimiter:"# DO NOT DELETE THIS LINE", moduleSystems:["amd", "cjs", "es6"]});
        let lExpectedDepLines =
             "\n# DO NOT DELETE THIS LINE\n\n" +
             "# amd dependencies\n" +
             "" +
             "# cjs dependencies\n" +
             "test/fixtures/cjs/root_two.js: \\\n\ttest/fixtures/cjs/shared.js \\\n\ttest/fixtures/cjs/somedata.json \\\n\ttest/fixtures/cjs/two_only_one.js\n\ntest/fixtures/cjs/two_only_one.js: \\\n\ttest/fixtures/cjs/sub/dir.js\n\ntest/fixtures/cjs/sub/dir.js: \\\n\ttest/fixtures/cjs/sub/depindir.js\n\n" +
             "# es6 dependencies\n" +
             "";

        assert.equal(lActualDepLines, lExpectedDepLines);
    });

});
