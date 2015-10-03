# js-makedepend
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript based projects. 

[![Build Status](https://travis-ci.org/sverweij/js-makedepend.svg?branch=master)](https://travis-ci.org/sverweij/js-makedepend)
[![Code Climate](https://codeclimate.com/github/sverweij/js-makedepend/badges/gpa.svg)](https://codeclimate.com/github/sverweij/js-makedepend)
[![Test Coverage](https://codeclimate.com/github/sverweij/js-makedepend/badges/coverage.svg)](https://codeclimate.com/github/sverweij/js-makedepend/coverage)
[![npm stable version](https://img.shields.io/npm/v/js-makedepend.svg?label=stable)](https://npmjs.org/package/js-makedepend)


## Basic usage
Include this target in your Makefile .
```makefile
depend:
    js-makedepend src/
```
(This assumes 
 - your JavaScript source code resides in `src` 
 - you have installed js-makedepend globally)

## More advanced usage
Include these snippets to your Makefile to
- put dependencies in a separate include
- only traverse CommonJS dependencies
- don't include any source that resides in `node_modules`
- besides all dependencies
  - define a `ROOT_ONE_SRC` with a flattened list of all files on which 
  `src/root_module_one.js` depends
  - define a `ROOT_TWO_SRC` with a flattened list of all files on which 
  `src/root_module_one.js` depends
  
```makefile
MAKEDEPEND=node_modules/.bin/js-makedepend --output-to dependencies.mk --exclude node_modules --system cjs
include dependencies.mk

depend:
    $(MAKEDEPEND)
    $(MAKEDEPEND) --append --flat-define ROOT_ONE_SRC src/root_module_one.js
    $(MAKEDEPEND) --append --flat-define ROOT_TWO_SRC src/root_module_two.js
```

## All options
```
Usage: js-makedepend [options] <directory-or-file>

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -f, --output-to <file>      Makefile to output to (default: Makefile)
    -x, --exclude <regex>       a regular expression for excluding modules
    -s, --delimiter <string>    starting string delimiter
    -d, --flat-define <string>  outputs a define with flat dependencies
    -a, --append                append dependencies instead of replacing them
    -M, --system <items>        list of module systems (default: amd,cjs,es6)
```
