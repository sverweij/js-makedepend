/* jshint node: true */
var program = require('commander');
var doShizzle = require('./core').doShizzle;

program
    .version('0.1.0')
    .option('-f, --output-to <file>', 'Makefile to output to, if different from Makefile.')
    .option('-x, --exclude <regex>', 'a regular expression for excluding modules')
    .parse(process.argv);

doShizzle(program.args[0], program.exclude, program.outputTo);
