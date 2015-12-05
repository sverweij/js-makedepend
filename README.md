# js-makedepend
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript based projects. 

[![Build Status](https://travis-ci.org/sverweij/js-makedepend.svg?branch=master)](https://travis-ci.org/sverweij/js-makedepend)
[![Code Climate](https://codeclimate.com/github/sverweij/js-makedepend/badges/gpa.svg)](https://codeclimate.com/github/sverweij/js-makedepend)
[![Test Coverage](https://codeclimate.com/github/sverweij/js-makedepend/badges/coverage.svg)](https://codeclimate.com/github/sverweij/js-makedepend/coverage)
[![Dependency Status](https://david-dm.org/sverweij/js-makedepend.svg)](https://david-dm.org/sverweij/js-makedepend)
[![devDependency Status](https://david-dm.org/sverweij/js-makedepend/dev-status.svg)](https://david-dm.org/sverweij/js-makedepend#info=devDependencies)
[![npm stable version](https://img.shields.io/npm/v/js-makedepend.svg?label=stable)](https://npmjs.org/package/js-makedepend)
[![MIT licensed](https://img.shields.io/github/license/sverweij/js-makedepend.svg)](LICENSE)

## Installation and basic usage
(1) Install with `npm`
```shell
npm install -g js-makedepend
```
(2) Include this target in your Makefile (assuming your javascript is in `src/`):
```makefile
depend:
	js-makedepend src/
```
(3) Run `make depend`    
   js-makedepend will have added the dependencies in `src/` to your Makefile. See the examples below to see how that looks.


## All options
```
Usage: js-makedepend [options] <directory-or-file>

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -f, --output-to <file>      Makefile to output to
                                 default: -f Makefile
                                 use -f - to output to stdout
    -x, --exclude <regex>       a regular expression for excluding modules
    -s, --delimiter <string>    starting string delimiter
    -d, --flat-define <string>  outputs a define with flat dependencies
    -a, --append                append dependencies instead of replacing them
    -M, --system <items>        list of module systems (default: amd,cjs,es6)
```
## Features by example
### The default: recursive
Let's say you have a cool project going with this source tree:
```
    src/root_one.js
    src/root_two.js
    src/one_only_one.js
    src/one_only_two.js
    src/shared.js
    src/two_only_one.js
    src/sub/depindir.js
    src/sub/dir.js
```

#### On a directory
Running `js-makedepend src` with no options will append all depencies present
in source files in that directory to your Makefile:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
src/root_one.js: \
	../../node_modules/commander/index.js \
	src/one_only_one.js \
	src/one_only_two.js \
	src/shared.js \
	src/sub/dir.js

src/root_two.js: \
	src/shared.js \
	src/two_only_one.js

src/sub/dir.js: \
	src/sub/depindir.js

src/two_only_one.js: \
	src/sub/dir.js

# cjs dependencies
# es6 dependencies
```

#### On a file
You can also pass a file as an argument. `js-makedepend src/root_two.js` 
will only emit the (recursive) dependencies of `src/root_two.js`:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
src/root_two.js: \
	src/shared.js \
	src/two_only_one.js

src/two_only_one.js: \
	src/sub/dir.js

src/sub/dir.js: \
	src/sub/depindir.js

# cjs dependencies
# es6 dependencies
```

### Flattened in a DEFINE: `--flat-define`
Sometimes all you need is just all sources in one define.
`js-makedepend --flat-define ROOT_ONE_ALL_SRC src/root_one.js`
will do just that:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
ROOT_ONE_ALL_SRC=src/root_one.js \
	../../node_modules/commander/index.js \
	src/one_only_one.js \
	src/one_only_two.js \
	src/shared.js \
	src/sub/depindir.js \
	src/sub/dir.js
# cjs dependencies
# es6 dependencies
```

### Replacing & appending: `--append`
You might have noted the `# DO NOT DELETE THIS LINE -- js-makedepend depends on it.`
there. In next runs js-makedepends by default will _replace_ everything
below that line.

If you want to have the output of multiple runs of js-makedepend in your 
Makefile use `--append` e.g. 

```makefile
depend:
	js-makedepend --flat-define ROOT_ONE_ALL_SRC src/root_one.js
	js-makedepend --append --flat-define ROOT_TWO_ALL_SRC src/root_two.js
```

### Excluding stuff to walk through: `--exclude`
In the above samples you'll notice the presence of a dependency in the 
`node_modules` tree: `../../node_modules/commander/index.js`. If you don't want
that, add the `--exclude` with a regular expression, e.g. 
```makefile
depend:
	js-makedepend --exclude node_modules --flat-define ALL_SRC src/
```

### Output to something else: `--output-to`
If your depency tree is big, you might want to put your dependencies in a 
separate file, using `make`'s `include`. 

```makefile
include jsdependencies.mk

depend:
	js-makedepend --output-to jsdependencies.mk src/
```

Note: running this when jsdepencies.mk doesn't exist yet will make `make` stop 
with an error. Either create it before running make (e.g. `touch jsdependencies.mk`)
or include the `include jsdepencies` in your Makefile only after running
the depend target for the first time.

If you pick `-` as a filename, js-makedepend will emit to stdout.

### Selecting module systems: `--system`
By `js-makedepend` runs through your sources thrice, once for every module
system it knows. If you don't want that, specify the systems your interested in
in a comma-separated list:

```makefile
	js-makedepend --system amd,es6 src/
```
### Use your own delimiter string: `--delimiter`
By default `js-makedepend` emits a demarcation line so it can find its 
output on a next run:
```
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.
```

If you want it to use something else, you can do that:
```
js-makedepend --delimiter "# Aren't you a little short for a stormtrooper?"
```
or even
```
js-makedepend --delimiter "MY_COOL_DEFINE=achoo!"
```

## Advanced example
Include these snippets to your Makefile to
- Add dependencies to a separate `depencies.mk` include
- Only traverse CommonJS dependencies
- don't include any source that resides in `node_modules`
- besides all dependencies
  - define a `ROOT_ONE_SRC` with a flattened list of all files on which 
  `src/root_one.js` depends
  - define a `ROOT_TWO_SRC` with a flattened list of all files on which 
  `src/root_two.js` depends
  
```makefile
MAKEDEPEND=node_modules/.bin/js-makedepend \
	--output-to dependencies.mk \
	--exclude node_modules \
	--system cjs
include dependencies.mk

depend:
	$(MAKEDEPEND)
	$(MAKEDEPEND) --append --flat-define ROOT_ONE_SRC src/root_one.js
	$(MAKEDEPEND) --append --flat-define ROOT_TWO_SRC src/root_wo.js
```
## License
[MIT](LICENSE)

## Thanks
- [Patrik Henningsson](https://github.com/pahen) - who wrote 
  [MaDGe](https://github.com/pahen/madge), which does most of js-makedepend's
  heavy lifting.
- ... and the creators of [detective](https://github.com/substack/node-detective),
  [amdetective](https://github.com/mixu/amdetective), and 
  [detective-es6](https://github.com/mrjoelkemp/node-detective-es6), which do
  some of the heavy lifting for MaDGe.
