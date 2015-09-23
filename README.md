# makedepend.js 
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript based projects. 

Note: will be published as an npm module when all items on [TODO before release as npm package](https://trello.com/b/YdKXLhGb/makedepend-js) list are done.


## Basic usage
Include this target in your Makefile (assuming your JavaScript source code resides in `src`).
```Makefile
depend:
    makedepend.js src/
```

## All options
```
Usage: makedepend [options]

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -f, --output-to <file>   Makefile to output to, if different from Makefile.
  -x, --exclude <regex>    a regular expression for excluding modules
  -s, --delimiter <string> starting string delimiter

```
## Build status and other flare
[![Build Status](https://travis-ci.org/sverweij/makedepend.js.svg?branch=master)](https://travis-ci.org/sverweij/makedepend.js)
[![Code Climate](https://codeclimate.com/github/sverweij/makedepend.js/badges/gpa.svg)](https://codeclimate.com/github/sverweij/makedepend.js)
[![Test Coverage](https://codeclimate.com/github/sverweij/makedepend.js/badges/coverage.svg)](https://codeclimate.com/github/sverweij/makedepend.js/coverage)
