"use strict";
const expect      = require('chai').expect;
const transformer = require("../src/transformer-json");

describe("#json transformer - main", () => {
    it("basic operation on test/fixtures/cjs", () => {
        const lActualDepLines = transformer.getDependencyStrings(
            "test/fixtures/cjs",
            {
                delimiter:"# DO NOT DELETE THIS LINE",
                moduleSystems:["cjs", "es6"]
            }
        );

        expect(
            JSON.parse(lActualDepLines)
        ).to.deep.equal(
            require('./expected-json-on-dir.json')
        );
    });

    it("basic operation on test/fixtures/cjs/root_two.js", () => {
        const lActualDepLines = transformer.getDependencyStrings(
            "test/fixtures/cjs/root_two.js",
            {
                delimiter:"# DO NOT DELETE THIS LINE",
                moduleSystems:["amd", "cjs", "es6"]
            }
        );

        expect(
            JSON.parse(lActualDepLines)
        ).to.deep.equal(
            require('./expected-json-on-file.json')
        );
    });

});

/* eslint global-require: 0 */
