
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
test/fixtures/amd/root_one.js: \
	node_modules/commander/index.js \
	test/fixtures/amd/one_only_one.js \
	test/fixtures/amd/one_only_two.js \
	test/fixtures/amd/shared.js \
	test/fixtures/amd/sub/dir.js

test/fixtures/amd/root_two.js: \
	test/fixtures/amd/shared.js \
	test/fixtures/amd/two_only_one.js

test/fixtures/amd/sub/dir.js: \
	test/fixtures/amd/sub/depindir.js

test/fixtures/amd/two_only_one.js: \
	test/fixtures/amd/sub/dir.js

# commonJS dependencies
# ES6 dependencies
# all sources in a define
