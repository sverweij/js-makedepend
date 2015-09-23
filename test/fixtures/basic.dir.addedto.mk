Here is some content
It's not ended by a linebreak
# DO NOT DELETE THIS LINE -- makedepend.js depends on it.

# amd dependencies
# commonJS dependencies
src/chewy.js: \
	src/core.js \
	src/utl.js

src/cli.js: \
	node_modules/commander/index.js \
	src/chewy.js

src/core.js: \
	node_modules/madge/lib/madge.js \
	src/utl.js

src/utl.js:

# ES6 dependencies
