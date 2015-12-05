var fs        = require('fs');
var justParse = require('just-parse');
var detective = require('detective-cjs');

var deps = detective(
    justParse(fs.readFileSync('../mscgen_js/src/script/index.js', 'utf8'))
);

process.stdout.write(
    JSON.stringify(deps, null, " ")
);
