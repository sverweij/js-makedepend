var program = require("commander");
var chewy   = require("./chewy");

program
    .version('0.1.0')
    .option('-f, --output-to <file>', 'Makefile to output to, if different from Makefile.')
    .option('-x, --exclude <regex>', 'a regular expression for excluding modules')
    .option('-s, --delimiter <string>', 'starting string delimiter')
    .option('-d, --flat-define <string>', 'outputs a define with flat dependencies')
    .option('-1, --start-with <file>', 'to start the depency tree with')
    .parse(process.argv);

chewy.main(
    program.args[0], 
    {
        exclude: program.exclude,
        outputTo: program.outputTo,
        delimiter: program.delimiter
    }
);
