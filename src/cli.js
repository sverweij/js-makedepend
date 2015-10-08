var program  = require("commander");
var chewy    = require("./chewy");
var $package = require('../package.json');
var semver   = require("semver");

/* istanbul ignore if  */
if (!semver.satisfies(process.versions.node, $package.engines.node)){
    process.stderr.write("\n  ERROR: your node version (" + process.versions.node + ") is not recent enough.\n");
    process.stderr.write("         js-makedepend needs a node version " + $package.engines.node +"\n\n");
    process.exit(-1);
}

program
    .version($package.version)
    .option('-f, --output-to <file>', 'Makefile to output to (default: Makefile)')
    .option('-x, --exclude <regex>', 'a regular expression for excluding modules')
    .option('-s, --delimiter <string>', 'starting string delimiter')
    .option('-d, --flat-define <string>', 'outputs a define with flat dependencies')
    .option('-a, --append', 'append dependencies instead of replacing them')
    .option('-M, --system <items>', 'list of module systems (default: amd,cjs,es6)')
    .arguments('<directory-or-file>')
    .parse(process.argv);

if (!!program.args[0]){
    chewy.main(
        program.args[0],
        program
    );
} else {
    program.help();
}
