### Makedepend.js 
A `makedepend` for javascript ES6, CommonJS and AMD (/ RequireJS).

For all two of you using `Makefiles` to build JavaScript based projects.

### Basic usage
Include this target in your Makefile (assuming your JavaScript source code resides in `src`).
```Makefile
depend:
    makedepend.js src/
```

### All options
```
Usage: makedepend [options]

Options:

  -h, --help              output usage information
  -V, --version           output the version number
  -f, --output-to <file>  Makefile to output to, if different from Makefile.
  -x, --exclude <regex>   a regular expression for excluding modules

```

### TODO before releasing as npm package:
  - [ ] automate test & coverage
  - [ ] describe general operation 
    - (and the `# DO NOT DELETE THIS LINE -- makedepend.js depends on it` behavior.)
    - `-f -` to generate to `stdout`
  - [ ] make sure madge upgrades its dependencies _or_ copy 'n strip

### Future features
makedepend options maybe to include in a later release:
- [ ] -wwidth   - line width 
- [ ] -m        - warn about multiple inclusion (makedepend like)
- [ ] -c        - warn about circular dependencies (newish - comes free with madge)
- [ ] -s        - starting string delimiter (if you want it different from the `# DO NOT DELETE THIS LINE ...` thing

### Never features
- [ ]-Iincludedir, -Yincludedir - as we don't yet have #includes in js land
