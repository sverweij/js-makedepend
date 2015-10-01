var program = require("commander");
var chewy   = require("./chewy");

program
    .version('0.1.0')
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
