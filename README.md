# js-makedepend
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript based projects. 

[![Build Status](https://travis-ci.org/sverweij/makedepend.js.svg?branch=master)](https://travis-ci.org/sverweij/makedepend.js)
[![Code Climate](https://codeclimate.com/github/sverweij/makedepend.js/badges/gpa.svg)](https://codeclimate.com/github/sverweij/makedepend.js)
[![Test Coverage](https://codeclimate.com/github/sverweij/makedepend.js/badges/coverage.svg)](https://codeclimate.com/github/sverweij/makedepend.js/coverage)

Note: I will publish this as an npm module only when it's mature enough (tests automated, dependencies managed). It's close, but not there yet; see items on [TODO before release as npm package](https://trello.com/b/YdKXLhGb/makedepend-js).


## Basic usage
Include this target in your Makefile .
```
depend:
    js-makedepend src/
```
(This assumes 
 - your JavaScript source code resides in `src` 
 - you have installed js-makedepend globally)

## All options
```
Usage: js-makedepend [options]

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -f, --output-to <file>   Makefile to output to, if different from Makefile.
  -x, --exclude <regex>    a regular expression for excluding modules
  -s, --delimiter <string> starting string delimiter

```
