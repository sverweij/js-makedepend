const program  = require("commander");
const main     = require("./main");
const $package = require("../package.json");
const semver   = require("semver");

/* istanbul ignore if  */
if (!semver.satisfies(process.versions.node, $package.engines.node)) {
    process.stderr.write(`\nERROR: your node version (" + process.versions.node + ") is not recent enough.\n`);
    process.stderr.write(`       js-makedepend needs a version of node ${$package.engines.node}\n\n`);

    /* eslint no-process-exit: 0 */
    process.exit(-1);
}

program
    .version($package.version)
    .option("-f, --output-to <file>", "Makefile to output to (default: Makefile)")
    .option("-x, --exclude <regex>", "a regular expression for excluding modules")
    .option("-s, --delimiter <string>", "starting string delimiter")
    .option("-d, --flat-define <string>", "outputs a define with flat dependencies")
    .option("-a, --append", "append dependencies instead of replacing them")
    .option("-M, --system <items>", "list of module systems (default: amd,cjs,es6)")
    .option("-G , --dot", "visualizes dependencies in a graphiz dot")
    .arguments("<directory-or-file>")
    .parse(process.argv);

if (Boolean(program.args[0])) {
    main.main(
        program.args[0],
        program
    );
} else {
    program.help();
}
