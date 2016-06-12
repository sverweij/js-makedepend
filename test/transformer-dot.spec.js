/* eslint max-len:0 */
"use strict";
const assert      = require("assert");
const expect      = require("chai").expect;
const transformer = require("../src/transformer-dot");

describe("#transformer - main", () => {
    it("basic operation on test/fixtures/cjs", () => {
        const lActualDepLines = transformer.getDependencyStrings(
            "test/fixtures/cjs",
            {
                delimiter:"# DO NOT DELETE THIS LINE",
                moduleSystems:["amd", "cjs", "es6"]
            }
        );
        const lExpectedDepLines = `
# DO NOT DELETE THIS LINE

digraph {
    ordering=out
    rankdir=LR
    splines=true
    overlap=false
    node [shape=box, style="rounded, filled",
          color="#999999", fillcolor="#ffffdd", fontcolor="#999999",
          fontname=Helvetica, fontsize=9]
    edge [color=black, arrowhead=vee, fontname="Helvetica", fontsize="9"]

    "test/fixtures/cjs/node_modules/somemodule/node_modules/someothermodule/main.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/node_modules/somemodule/src/moar-javascript.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/node_modules/somemodule/src/somemodule.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/one_only_one.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/one_only_two.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/root_one.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/shared.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/sub/dir.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/sub/depindir.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/root_two.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/two_only_one.js" [color=black, fontcolor=black]


    "test/fixtures/cjs/node_modules/somemodule/src/somemodule.js" -> "test/fixtures/cjs/node_modules/somemodule/src/moar-javascript.js" [color=black]
    "test/fixtures/cjs/node_modules/somemodule/src/somemodule.js" -> "test/fixtures/cjs/node_modules/somemodule/node_modules/someothermodule/main.js" [color=black]
    "test/fixtures/cjs/one_only_one.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/one_only_two.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/root_one.js" -> "test/fixtures/cjs/one_only_one.js" [color=black]
    "test/fixtures/cjs/root_one.js" -> "test/fixtures/cjs/one_only_two.js" [color=black]
    "test/fixtures/cjs/root_one.js" -> "test/fixtures/cjs/shared.js" [color=black]
    "test/fixtures/cjs/root_one.js" -> "test/fixtures/cjs/sub/dir.js" [color=black]
    "test/fixtures/cjs/root_one.js" -> "fs" [color="#999999"]
    "test/fixtures/cjs/root_one.js" -> "test/fixtures/cjs/node_modules/somemodule/src/somemodule.js" [color=black]
    "test/fixtures/cjs/shared.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/sub/dir.js" -> "test/fixtures/cjs/sub/depindir.js" [color=black]
    "test/fixtures/cjs/sub/dir.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/sub/depindir.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/shared.js" [color=black]
    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/somedata.json" [color=black]
    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/two_only_one.js" [color=black]
    "test/fixtures/cjs/root_two.js" -> "http" [color="#999999"]
    "test/fixtures/cjs/two_only_one.js" -> "test/fixtures/cjs/sub/dir.js" [color=black]

}
`;

        assert.equal(lActualDepLines.replace(/ /g, ''), lExpectedDepLines.replace(/ /g, ''));
    });

    it("basic operation on test/fixtures/cjs/root_two.js", () => {
        const lActualDepLines = transformer.getDependencyStrings(
            "test/fixtures/cjs/root_two.js",
            {
                delimiter:"# DO NOT DELETE THIS LINE",
                moduleSystems:["amd", "cjs", "es6"]
            }
        );
        const lExpectedDepLines = `
# DO NOT DELETE THIS LINE

digraph {
    ordering=out
    rankdir=LR
    splines=true
    overlap=false
    node [shape=box, style="rounded, filled",
          color="#999999", fillcolor="#ffffdd", fontcolor="#999999",
          fontname=Helvetica, fontsize=9]
    edge [color=black, arrowhead=vee, fontname="Helvetica", fontsize="9"]

    "test/fixtures/cjs/root_two.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/shared.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/two_only_one.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/sub/dir.js" [color=black, fontcolor=black]
    "test/fixtures/cjs/sub/depindir.js" [color=black, fontcolor=black]


    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/shared.js" [color=black]
    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/somedata.json" [color=black]
    "test/fixtures/cjs/root_two.js" -> "test/fixtures/cjs/two_only_one.js" [color=black]
    "test/fixtures/cjs/root_two.js" -> "http" [color="#999999"]
    "test/fixtures/cjs/shared.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/two_only_one.js" -> "test/fixtures/cjs/sub/dir.js" [color=black]
    "test/fixtures/cjs/sub/dir.js" -> "test/fixtures/cjs/sub/depindir.js" [color=black]
    "test/fixtures/cjs/sub/dir.js" -> "path" [color="#999999"]
    "test/fixtures/cjs/sub/depindir.js" -> "path" [color="#999999"]

}
`;

        assert.equal(lActualDepLines.replace(/ /g, ''), lExpectedDepLines.replace(/ /g, ''));
    });

    it('throws an error when presented with --dot + --flat-define and a folder', () => {
        expect(
            () => transformer.getDependencyStrings(".", {flatDefine: "WONTWORK"})
        ).to.throw();
    });
});
