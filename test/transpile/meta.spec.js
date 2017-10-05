"use strict";

const expect = require("chai").expect;
const meta   = require("../../src/extractor/transpile/meta");
const jsWrap = require("../../src/extractor/transpile/javaScriptWrap");
const lsWrap = require("../../src/extractor/transpile/liveScriptWrap");

describe("transpiler meta", () => {
    it("tells which extensions can be scanned", () => {
        expect(
            meta.scannableExtensions
        ).to.deep.equal([".js", ".ts", ".tsx", ".coffee", ".litcoffee", ".coffee.md"]);
    });

    it("returns the 'js' wrapper for unknown extensions", () => {
        expect(
            meta.getWrapper("")
        ).to.deep.equal(jsWrap);
    });

    it("returns the 'ls' wrapper for livescript", () => {
        expect(
            meta.getWrapper(".ls")
        ).to.deep.equal(lsWrap);
    });
});
