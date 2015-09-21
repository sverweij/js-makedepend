.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
CSSLINT=node node_modules/csslint/cli.js --format=compact --quiet --ignore=ids
SEDVERSION=utl/sedversion.sh
NPM=npm
MAKEDEPEND=node src/makedepend.js

GENERATED_SOURCES=


.PHONY: help dev-build install deploy-gh-pages check fullcheck mostlyclean clean noconsolestatements consolecheck lint cover prerequisites report test update-dependencies run-update-dependencies depend

help:
	@echo
	@echo " --------------------------------------------------------"
	@echo "| More information and other targets: see README.md      |"
	@echo " --------------------------------------------------------"
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

dev-build: $(GENERATED_SOURCES_NODE) src/index.html src/embed.html src/tutorial.html

lint:
	$(NPM) run lint

cover: dev-build
	$(NPM) run cover

tag: 
	$(GIT) tag -a `cat VERSION` -m "tag release `cat VERSION`"
	$(GIT) push --tags

report:
	$(NPM) run plato

test: dev-build
	$(NPM) run test

nsp:
	$(NPM) run nsp

outdated:
	$(NPM) outdated
	
check: lint test

fullcheck: check outdated nsp

update-dependencies: run-update-dependencies clean-generated-sources dev-build test
	$(GIT) diff package.json
	
run-update-dependencies: 
	$(NPM) run npm-check-updates
	$(NPM) install
	
depend:
	$(MAKEDEPEND) src

clean-generated-sources: 
	rm -rf $(GENERATED_SOURCES)
