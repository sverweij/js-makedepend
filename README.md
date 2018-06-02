# js-makedepend
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript (TypeScript/ CoffeeScript/ ...) based projects.

[![Build Status](https://travis-ci.org/sverweij/js-makedepend.svg?branch=master)](https://travis-ci.org/sverweij/js-makedepend)
[![coverage report](https://gitlab.com/sverweij/js-makedepend/badges/master/coverage.svg)](https://gitlab.com/sverweij/js-makedepend/commits/master)
[![Dependency Status](https://david-dm.org/sverweij/js-makedepend.svg)](https://david-dm.org/sverweij/js-makedepend)
[![devDependency Status](https://david-dm.org/sverweij/js-makedepend/dev-status.svg)](https://david-dm.org/sverweij/js-makedepend#info=devDependencies)
[![npm stable version](https://img.shields.io/npm/v/js-makedepend.svg)](https://npmjs.com/package/js-makedepend)
[![total downloads on npm](https://img.shields.io/npm/dt/js-makedepend.svg?maxAge=2592000)](https://npmjs.com/package/js-makedepend)
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
	-i, --info                  show what is supported in your project folder
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
Running `js-makedepend src` with no options will append all dependencies present
in source files in that directory to your Makefile:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
# cjs dependencies
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

# es6 dependencies
```

#### On a file
You can also pass a file as an argument. `js-makedepend src/root_two.js`
will only emit the (recursive) dependencies of `src/root_two.js`:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
# cjs dependencies
src/root_two.js: \
	src/shared.js \
	src/two_only_one.js

src/two_only_one.js: \
	src/sub/dir.js

src/sub/dir.js: \
	src/sub/depindir.js

# es6 dependencies
```

### Flattened in a DEFINE: `--flat-define`
Sometimes all you need is just all sources in one define.
`js-makedepend --system cjs --flat-define ROOT_ONE_ALL_SRC src/root_one.js`
will do just that:

```makefile
# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# cjs dependencies
ROOT_ONE_ALL_SRC=src/root_one.js \
	../../node_modules/commander/index.js \
	src/one_only_one.js \
	src/one_only_two.js \
	src/shared.js \
	src/sub/depindir.js \
	src/sub/dir.js
```

(You might want to pick _one_ module system here - otherwise you'll
end up with three very similar lookin defines).

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
By default `js-makedepend` runs through your sources thrice, once for every
module system it knows. If you don't want that, specify the systems your interested in, in a comma-separated list:

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

## Support for TypeScript, CoffeeScript and LiveScript
As of version 2.1.0 js-makedepend supports TypeScript (including tsx),
CoffeeScript and LiveScript. If any of these transpilers (or 'compilers'
depending on your religious denomination) are installed in your project
folder's node_modules, js-makedepend will use them.

js-makedepend does not need any switches to work with any of these languages.
It just works when the transpilers are in node_modules. This means everything
works for TypeScript, CoffeeScript and LiveScript like it does for JavaScript.

> js-makedepend _does not_ ship with the transpilers for these languages
> themselves to keep install size reasonable (e.g. typescript is ~22Mb).
> Moreover, when you're developing in any of these alt-JS languages, your
> project folder probably already contains the transpiler anyway.

## De-supported stuff + alternatives for them

### Visualizing the dependency graph
This was part of js-makedepend until version 1.1.0. It's fun functionality,
but not core to why I wrote js-makedepend.

If you're interested in visualizing a dependency graph nonetheless -
[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) does that
quite well.

### Send the dependency graph as JSON to stdout
Also removed from js-makedepend with the 2.0.0 release. For this also
[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) will
probably do a better job.

## License
[MIT](LICENSE)

## Thanks
- [Marijn Haverbeke](http://marijnhaverbeke.nl) and other people who
  colaborated on [acorn](https://github.com/ternjs/acorn) -
  the excellent javascript parser js-makedepend uses to infer the
  dependencies.
