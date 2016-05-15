.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
NPM=npm
NODE=node
MAKEDEPEND=bin/js-makedepend --exclude "node_modules|fixtures|extractor-fixtures" --system cjs

.PHONY: help dev-build install check stylecheck fullcheck mostlyclean clean noconsolestatements consolecheck lint cover prerequisites static-analysis test update-dependencies run-update-dependencies depend

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

stylecheck:
	$(NPM) run jscs

cover: dev-build
	$(NPM) run cover

bump-patch:
	$(NPM) version patch

bump-minor:
	$(NPM) version minor

bump-major:
	$(NPM) version major

tag:
	$(GIT) tag -a v`utl/getver` -m "v`utl/getver`"
	$(GIT) push --tags

publish:
	$(GIT) push
	$(GIT) push --tags
	$(NPM) publish

profile:
	$(NODE) --prof src/cli.js -f - test
	@echo "output will be in a file called 'isolate-xxxx-v8.log'"
	@echo "- translate to readable output with:"
	@echo "    node --prof-process isolate-xxxx-v8.log | more"

.git/refs/remotes/bitbkucket-mirror:
	$(GIT) remote add bitbucket-mirror git@bitbucket.org:sverweij/js-makedepend.git

.git/refs/remotes/gitlab-mirror:
	$(GIT) remote add gitlab-mirror https://gitlab.com/sverweij/js-makedepend.git

mirrors: .git/refs/remotes/bitbucket-mirror \
	.git/refs/remotes/gitlab-mirror

push-mirrors: mirrors
	$(GIT) push bitbucket-mirror
	$(GIT) push gitlab-mirror

test: dev-build
	$(NPM) run test

nsp:
	$(NPM) run nsp

outdated:
	$(NPM) outdated

update-dependencies: run-update-dependencies dev-build test
	$(GIT) diff package.json

run-update-dependencies:
	$(NPM) run npm-check-updates
	$(NPM) install

noconsolestatements:
	@echo "scanning for console statements (run 'make consolecheck' to see offending lines)"
	grep -r console src/* | grep -c console | grep ^0$$
	@echo ... ok

consolecheck:
	grep -r console src/*

check: noconsolestatements lint stylecheck test
	./bin/js-makedepend --version # if that runs the cli script works

fullcheck: check outdated nsp

depend:
	$(MAKEDEPEND) src/cli.js
	$(MAKEDEPEND) --append --flat-define ALL_SRC src/cli.js
	$(MAKEDEPEND) --append test

sinopia:
	sinopia

# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# cjs dependencies
src/cli.js: \
	package.json \
	src/chewy.js

src/chewy.js: \
	src/transformer.js \
	src/utl.js

src/transformer.js: \
	src/extractor.js

src/extractor.js: \
	src/resolver.js \
	src/utl.js

src/resolver.js: \
	src/utl.js

# cjs dependencies
ALL_SRC=src/cli.js \
	package.json \
	src/chewy.js \
	src/extractor.js \
	src/resolver.js \
	src/transformer.js \
	src/utl.js
# cjs dependencies
test/chewy.spec.js: \
	src/chewy.js \
	test/utl/testutensils.js

src/chewy.js: \
	src/transformer.js \
	src/utl.js

src/transformer.js: \
	src/extractor.js

src/extractor.js: \
	src/resolver.js \
	src/utl.js

src/resolver.js: \
	src/utl.js

test/extractor.spec.js: \
	src/extractor.js

test/transformer.spec.js: \
	src/transformer.js
