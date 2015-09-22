var program = require('commander');
var core = require('./chewy');

program
    .version('0.1.0')
    .option('-f, --output-to <file>', 'Makefile to output to, if different from Makefile.')
    .option('-x, --exclude <regex>', 'a regular expression for excluding modules')
    .option('-s, --delimiter <string>', 'starting string delimiter')
    .parse(process.argv);

core.main(program.args[0], program.exclude, program.outputTo, program.delimiter);
