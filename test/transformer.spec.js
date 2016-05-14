"use strict";
const assert      = require("assert");
const transformer = require("../src/transformer.js");

describe("#transformer - main", () => {
    it("basic operation on test/fixtures/cjs", () => {
        let lActualDepLines = transformer.getDependencyStrings("test/fixtures/cjs", {delimiter:"# DO NOT DELETE THIS LINE", moduleSystems:["amd", "cjs", "es6"]});
        let lExpectedDepLines =`
# DO NOT DELETE THIS LINE

# amd dependencies
# cjs dependencies
test/fixtures/cjs/node_modules/somemodule/src/somemodule.js: \\
\ttest/fixtures/cjs/node_modules/somemodule/node_modules/someothermodule/main.js \\
\ttest/fixtures/cjs/node_modules/somemodule/src/moar-javascript.js

test/fixtures/cjs/root_one.js: \\
\ttest/fixtures/cjs/node_modules/somemodule/src/somemodule.js \\
\ttest/fixtures/cjs/one_only_one.js \\
\ttest/fixtures/cjs/one_only_two.js \\
\ttest/fixtures/cjs/shared.js \\
\ttest/fixtures/cjs/sub/dir.js

test/fixtures/cjs/sub/dir.js: \\
\ttest/fixtures/cjs/sub/depindir.js

test/fixtures/cjs/root_two.js: \\
\ttest/fixtures/cjs/shared.js \\
\ttest/fixtures/cjs/somedata.json \\
\ttest/fixtures/cjs/two_only_one.js

test/fixtures/cjs/two_only_one.js: \\
\ttest/fixtures/cjs/sub/dir.js

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
