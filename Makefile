.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
CSSLINT=node node_modules/csslint/cli.js --format=compact --quiet --ignore=ids
SEDVERSION=utl/sedversion.sh
NPM=npm
MAKEDEPEND=bin/js-makedepend -x node_modules

GENERATED_SOURCES=

.PHONY: help dev-build install deploy-gh-pages check fullcheck mostlyclean clean noconsolestatements consolecheck lint cover prerequisites static-analysis test update-dependencies run-update-dependencies depend

help:
	@echo
	@echo " -------------------------------------------------------- "
	@echo "| More information and other targets: see README.md      |"
	@echo " -------------------------------------------------------- "
	@echo


# production rules

$(PRODDIRS):
	mkdir -p $@

# file targets prod
VERSION:
	@echo 0.0.0 > $@

# "phony" targets
prerequisites:
	$(NPM) install

dev-build: bin/js-makedepend src/cli.js

lint:
	$(NPM) run lint

cover: dev-build
	$(NPM) run cover

tag: 
	$(GIT) tag -a `cat VERSION` -m "tag release `cat VERSION`"
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

update-dependencies: run-update-dependencies clean-generated-sources dev-build test
	$(GIT) diff package.json
	
run-update-dependencies: 
	$(NPM) run npm-check-updates
	$(NPM) install
	
depend:
	$(MAKEDEPEND) src/cli.js

clean-generated-sources: 
	rm -rf $(GENERATED_SOURCES)

sinopia:
	sinopia

# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# amd dependencies
# commonJS dependencies
src/cli.js: \
	src/chewy.js

src/chewy.js: \
	src/core.js \
	src/utl.js

src/core.js: \
	src/utl.js

# ES6 dependencies
