const expect         = require('chai').expect;
const extract        = require('../src/extractor/extract');
const cjsFixtures    = require('./extractor-fixtures/cjs.json');
const es6Fixtures    = require('./extractor-fixtures/es6.json');
const amdFixtures    = require('./extractor-fixtures/amd.json');

function runFixture(pFixture) {
    it(pFixture.title, () => {
        expect(
            extract(
                pFixture.input.fileName,
                {
                    baseDir: pFixture.input.baseDir,
                    moduleSystems: pFixture.input.moduleSystems
                }
            )
        ).to.deep.equal(
            pFixture.expected
        );
    });
}

describe('CommonJS - ', () => cjsFixtures.forEach(runFixture));
describe('ES6 - ', () => es6Fixtures.forEach(runFixture));
describe('AMD - ', () => amdFixtures.forEach(runFixture));

describe('Error scenarios - ', () => {
    it('Does not raise an exception on syntax errors (because we\'re on the loose parser)', () => {
        expect(
            () => extract("test/extractor-fixtures/syntax-error.js")
        ).to.not.throw("Extracting dependencies ran afoul of... Unexpected token (1:3)");
    });
    it('Raises an exception on non-existing files', () => {
        expect(
            () => extract("non-existing-file.js")
        ).to.throw(
            "Extracting dependencies ran afoul of...\n\n  ENOENT: no such file or directory, open 'non-existing-file.js'\n"
        );
    });
});

/* eslint max-len: 0*/
