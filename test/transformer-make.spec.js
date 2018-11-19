'use strict'
const assert = require('assert')
const transformer = require('../src/transformer-make')

describe('#make transformer - main', () => {
  it('basic operation on test/fixtures/cjs', () => {
    const lActualDepLines = transformer.getDependencyStrings(
      'test/fixtures/cjs',
      {
        delimiter: '# DO NOT DELETE THIS LINE',
        moduleSystems: ['amd', 'cjs', 'es6']
      }
    )
    const lExpectedDepLines = `
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
`

    assert.strictEqual(lActualDepLines, lExpectedDepLines)
  })

  it('basic operation on test/fixtures/cjs/root_two.js', () => {
    const lActualDepLines = transformer.getDependencyStrings(
      'test/fixtures/cjs/root_two.js',
      {
        delimiter: '# DO NOT DELETE THIS LINE',
        moduleSystems: ['amd', 'cjs', 'es6']
      }
    )
    const lExpectedDepLines = `
# DO NOT DELETE THIS LINE

# amd dependencies
# cjs dependencies
test/fixtures/cjs/root_two.js: \\
\ttest/fixtures/cjs/shared.js \\
\ttest/fixtures/cjs/somedata.json \\
\ttest/fixtures/cjs/two_only_one.js

test/fixtures/cjs/two_only_one.js: \\
\ttest/fixtures/cjs/sub/dir.js

test/fixtures/cjs/sub/dir.js: \\
\ttest/fixtures/cjs/sub/depindir.js

# es6 dependencies
`

    assert.strictEqual(lActualDepLines, lExpectedDepLines)
  })
})
