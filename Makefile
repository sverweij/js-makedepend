.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
NPM=npm
NODE=node
MAKEDEPEND=bin/js-makedepend --exclude "node_modules|fixtures|extractor-fixtures" --system cjs

.PHONY: help dev-build install check fullcheck mostlyclean clean lint cover prerequisites static-analysis test update-dependencies run-update-dependencies depend

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

check: lint test
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
	src/main.js

src/main.js: \
	src/transformer-dot.js \
	src/transformer-make.js \
	src/utl.js

src/transformer-dot.js: \
	src/extractor-composite.js

src/extractor-composite.js: \
	src/extractor.js \
	src/utl.js

src/extractor.js: \
	src/resolver.js \
	src/utl.js

src/resolver.js: \
	src/utl.js

src/transformer-make.js: \
	src/extractor-composite.js

# cjs dependencies
ALL_SRC=src/cli.js \
	package.json \
	src/extractor-composite.js \
	src/extractor.js \
	src/main.js \
	src/resolver.js \
	src/transformer-dot.js \
	src/transformer-make.js \
	src/utl.js
# cjs dependencies
test/extractor-composite.spec.js: \
	src/extractor-composite.js

src/extractor-composite.js: \
	src/extractor.js \
	src/utl.js

src/extractor.js: \
	src/resolver.js \
	src/utl.js

src/resolver.js: \
	src/utl.js

test/extractor.spec.js: \
	src/extractor.js

test/main.spec.js: \
	src/main.js \
	test/utl/testutensils.js

src/main.js: \
	src/transformer-dot.js \
	src/transformer-make.js \
	src/utl.js

src/transformer-dot.js: \
	src/extractor-composite.js

src/transformer-make.js: \
	src/extractor-composite.js

test/transformer-dot.spec.js: \
	src/transformer-dot.js

test/transformer-make.spec.js: \
	src/transformer-make.js

