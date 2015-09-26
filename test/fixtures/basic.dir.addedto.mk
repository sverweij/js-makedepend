Here is some content
It's not ended by a linebreak
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
# commonJS dependencies
test/fixtures/cjs/one_only_one.js:

test/fixtures/cjs/one_only_two.js:

test/fixtures/cjs/root_one.js: \
	node_modules/commander/index.js \
	test/fixtures/cjs/one_only_one.js \
	test/fixtures/cjs/one_only_two.js \
	test/fixtures/cjs/shared.js \
	test/fixtures/cjs/sub/dir.js

test/fixtures/cjs/root_two.js: \
	test/fixtures/cjs/shared.js \
	test/fixtures/cjs/two_only_one.js

test/fixtures/cjs/shared.js:

test/fixtures/cjs/sub/depindir.js:

test/fixtures/cjs/sub/dir.js: \
	test/fixtures/cjs/sub/depindir.js

test/fixtures/cjs/two_only_one.js: \
	test/fixtures/cjs/sub/dir.js

# ES6 dependencies
