
# THIS IS A NON-STANDARD DELIMITER STRING

# amd dependencies
# commonJS dependencies
src/chewy.js: \
	src/core.js \
	src/utl.js

src/core.js: \
	node_modules/madge/lib/madge.js \
	src/utl.js

src/makedepend.js: \
	node_modules/commander/index.js \
	src/chewy.js

src/utl.js:

# ES6 dependencies
