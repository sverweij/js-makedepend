1
2
3
4
5
6
7
# DO NOT DELETE THIS LINE -- makedepend.js depends on it.

# amd dependencies
# commonJS dependencies
src/core.js: \
	node_modules/madge/lib/madge.js \
	src/fs.js \
	src/path.js

src/makedepend.js: \
	node_modules/commander/index.js \
	src/core.js

# ES6 dependencies
