.SUFFIXES: .js .css .html
GIT=git
GIT_CURRENT_BRANCH=$(shell utl/get_current_git_branch.sh)
GIT_DEPLOY_FROM_BRANCH=master
NPM=npm
NODE=node
MAKEDEPEND=bin/js-makedepend --exclude "node_modules|fixtures|extractor-fixtures" --system cjs

.PHONY: help dev-build install check fullcheck mostlyclean clean lint cover prerequisites static-analysis test depend

help:
	@echo
	@echo " -------------------------------------------------------- "
	@echo "| More information and other targets: see README.md      |"
	@echo " -------------------------------------------------------- "
	@echo
	@echo "Useful targets:"
	@echo
	@echo "dev-build"
	@echo "  - makes a development build"
	@echo
	@echo "fullcheck"
	@echo "  - runs all possible static checks (lint, depcruise, npm outdated, nsp)"
	@echo
	@echo "publish-patch, publish-minor, publish-major"
	@echo "  - ups the version semver compliantly"
	@echo "  - commits & tags it"
	@echo "  - publishes to npm"
	@echo

# production rules

.npmignore: .gitignore
	cp $< $@
	echo "test/**" >> $@
	echo "utl/**" >> $@
	echo ".codeclimate.yml" >> $@
	echo ".dependency-cruiser.json" >> $@
	echo ".eslintignore" >> $@
	echo ".eslintrc.json" >> $@
	echo ".gitlab-ci.yml" >> $@
	echo ".travis.yml" >> $@
	echo "Makefile" >> $@

# "phony" targets
prerequisites:
	$(NPM) install

dev-build: bin/js-makedepend $(ALL_SRC) .npmignore

lint:
	$(NPM) run lint

lint-fix:
	$(NPM) run lint:fix

cover: dev-build
	$(NPM) run test:cover

pulbish-patch:
	$(NPM) version patch

pulbish-minor:
	$(NPM) version minor

pulbish-major:
	$(NPM) version major

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

test-cover: dev-build
	$(NPM) run test:cover

depcruise:
	$(NPM) run depcruise

check: lint depcruise test-cover
	./bin/js-makedepend --version # if that runs the cli script works

fullcheck: check

depend:
	$(MAKEDEPEND) src/main.js
	$(MAKEDEPEND) --append --flat-define ALL_SRC src/main.js
	$(MAKEDEPEND) --append test

sinopia:
	sinopia

# DO NOT DELETE THIS LINE -- js-makedepend depends on it.

# cjs dependencies
src/main.js: \
	src/transformer-make.js

src/transformer-make.js: \
	src/extractor/index.js

src/extractor/index.js: \
	src/extractor/extract.js \
	src/extractor/utl.js

src/extractor/extract.js: \
	src/extractor/resolve/index.js \
	src/extractor/utl.js

src/extractor/resolve/index.js: \
	src/extractor/resolve/resolve-AMD.js \
	src/extractor/resolve/resolve-commonJS.js

src/extractor/resolve/resolve-AMD.js: \
	src/extractor/utl.js

src/extractor/resolve/resolve-commonJS.js: \
	src/extractor/utl.js

# cjs dependencies
ALL_SRC=src/main.js \
	src/extractor/extract.js \
	src/extractor/index.js \
	src/extractor/resolve/index.js \
	src/extractor/resolve/resolve-AMD.js \
	src/extractor/resolve/resolve-commonJS.js \
	src/extractor/utl.js \
	src/transformer-make.js
# cjs dependencies
test/extractor-composite.spec.js: \
	src/extractor/index.js

src/extractor/index.js: \
	src/extractor/extract.js \
	src/extractor/utl.js

src/extractor/extract.js: \
	src/extractor/resolve/index.js \
	src/extractor/utl.js

src/extractor/resolve/index.js: \
	src/extractor/resolve/resolve-AMD.js \
	src/extractor/resolve/resolve-commonJS.js

src/extractor/resolve/resolve-AMD.js: \
	src/extractor/utl.js

src/extractor/resolve/resolve-commonJS.js: \
	src/extractor/utl.js

test/extractor.spec.js: \
	src/extractor/extract.js

test/main.spec.js: \
	src/main.js \
	test/utl/testutensils.js

src/main.js: \
	src/transformer-make.js

src/transformer-make.js: \
	src/extractor/index.js

test/transformer-make.spec.js: \
	src/transformer-make.js

