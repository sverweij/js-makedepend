
# DO NOT DELETE THIS LINE -- makedepend.js depends on it.

# amd dependencies
# commonJS dependencies
src/chewy.js: \
	src/core.js \
	src/utl.js

src/core.js: \
	src/utl.js

src/makedepend.js: \
	src/chewy.js

src/utl.js:

# ES6 dependencies
