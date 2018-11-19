const expect = require('chai').expect
const extractor = require('../src/extractor')
const cjsRecursiveFixtures = require('./extractor-fixtures/cjs-recursive.json')
const cjsFlatFixtures = require('./extractor-fixtures/cjs-flat.json')
const amdRecursiveFixtures = require('./extractor-fixtures/amd-recursive.json')
const amdRecursiveFlattenedFixtures = require('./extractor-fixtures/amd-recursive-flattened.json')

function runRecursiveFixture (pFixture) {
  it(pFixture.title, () => {
    expect(
      extractor.extractRecursive(
        pFixture.input.fileName,
        pFixture.input.options
      )
    ).to.deep.equal(pFixture.expected)
  })
}
function runRecursiveFlattenedFixture (pFixture) {
  it(pFixture.title, () => {
    expect(
      extractor.extractRecursiveFlattened(
        pFixture.input.fileName,
        pFixture.input.options
      )
    ).to.deep.equal(pFixture.expected)
  })
}

describe('CommonJS recursive - ', () => cjsRecursiveFixtures.forEach(runRecursiveFixture))
describe('CommonJS recursive flattened - ', () => cjsFlatFixtures.forEach(runRecursiveFlattenedFixture))
describe('AMD recursive - ', () => amdRecursiveFixtures.forEach(runRecursiveFixture))
describe('AMD recursive flattened - ', () => amdRecursiveFlattenedFixtures.forEach(runRecursiveFlattenedFixture))
