.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
NPM=npm
MAKEDEPEND=bin/js-makedepend --exclude "node_modules|fixtures" --system cjs

.PHONY: help dev-build install deploy-gh-pages check fullcheck mostlyclean clean noconsolestatements consolecheck lint cover prerequisites static-analysis test update-dependencies run-update-dependencies depend

help:
	@echo
	@echo " -------------------------------------------------------- "
	@echo "| More information and other targets: see README.md      |"
	@echo " -------------------------------------------------------- "
	@echo

# production rules

# "phony" targets
prerequisites:
	$(NPM) install

dev-build: bin/js-makedepend $(ALL_SRC)

lint:
	$(NPM) run lint

cover: dev-build
	$(NPM) run cover

tag: 
	$(GIT) tag -a `utl/getver` -m "tag release `utl/getver`"
	$(GIT) push --tags

static-analysis:
	$(NPM) run plato

test: dev-build
	$(NPM) run test

nsp:
	$(NPM) run nsp

outdated:
	$(NPM) outdated

noconsolestatements:
	@echo "scanning for console statements (run 'make consolecheck' to see offending lines)"
	grep -r console src/* | grep -c console | grep ^0$$
	@echo ... ok

consolecheck:
	grep -r console src/*

check: noconsolestatements lint test
	
fullcheck: check outdated nsp

update-dependencies: run-update-dependencies dev-build test
	$(GIT) diff package.json
	
run-update-dependencies: 
	$(NPM) run npm-check-updates
	$(NPM) install
	
depend:
	$(MAKEDEPEND) src/cli.js
	$(MAKEDEPEND) --append --flat-define ALL_SRC src/cli.js
	$(MAKEDEPEND) --append test

sinopia:
	sinopia

# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# cjs dependencies
src/cli.js: \
	src/chewy.js

src/chewy.js: \
	src/core.js \
	src/utl.js

src/core.js: \
	src/utl.js

# cjs dependencies
ALL_SRC=src/cli.js \
	src/chewy.js \
	src/core.js \
	src/utl.js
# cjs dependencies
test/chewy.spec.js: \
	src/chewy.js \
	test/utl/testutensils.js

test/core.spec.js: \
	src/core.js
