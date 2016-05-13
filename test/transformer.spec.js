"use strict";
const assert      = require("assert");
const transformer = require("../src/transformer.js");

describe("#transformer - main", () => {
    // TODO xit because platform (npm) dependent fixture
    xit("basic operation on test/fixtures/cjs", () => {
        let lActualDepLines = transformer.getDependencyStrings("test/fixtures/cjs", {delimiter:"# DO NOT DELETE THIS LINE", moduleSystems:["amd", "cjs", "es6"]});
        let lExpectedDepLines =`
# DO NOT DELETE THIS LINE

# amd dependencies
# cjs dependencies
test/fixtures/cjs/root_one.js: \\
	node_modules/commander/index.js \\
	test/fixtures/cjs/one_only_one.js \\
	test/fixtures/cjs/one_only_two.js \\
	test/fixtures/cjs/shared.js \\
	test/fixtures/cjs/sub/dir.js

test/fixtures/cjs/sub/dir.js: \\
	test/fixtures/cjs/sub/depindir.js

node_modules/commander/index.js: \\
	node_modules/graceful-readlink/index.js

test/fixtures/cjs/root_two.js: \\
	test/fixtures/cjs/shared.js \\
	test/fixtures/cjs/somedata.json \\
	test/fixtures/cjs/two_only_one.js

test/fixtures/cjs/two_only_one.js: \\
	test/fixtures/cjs/sub/dir.js

# es6 dependencies
`;

        assert.equal(lActualDepLines, lExpectedDepLines);
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
