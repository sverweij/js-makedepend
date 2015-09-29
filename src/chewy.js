var core  = require("./core");
var fs    = require("fs");
var utl   = require("./utl");
var _     = require("lodash");

var STARTING_STRING_DELIMITER = "# DO NOT DELETE THIS LINE -- js-makedepend depends on it.";

function appendToOrReplaceInFile(pOutputTo, pArray, pDelimiter, pAppend){
    if (!pAppend){
        try {
            var lOutputFile = fs.readFileSync(pOutputTo, {encoding: 'utf8', flag: 'r'});
            var lLines      = lOutputFile.split('\n');
            var lDelimiterPosition = lLines.indexOf(pDelimiter);
            
            if (lDelimiterPosition > -1){
                fs.writeFileSync(
                    pOutputTo,
                    lLines.splice(0, lDelimiterPosition).join('\n'),
                    {encoding: 'utf8', flag: 'w'}
                );
            }
        } catch (e){
            // process.stdout.write("'" + pOutputTo + "' didn't exist. We'll create the file instead.\n");
        }
    }
    fs.appendFileSync(
        pOutputTo,
        pArray.join(''),
        {encoding: 'utf8', flag: 'a'}
    );
}

function validateParameters(pDirOrFile){
    if (!utl.fileExists(pDirOrFile)) {
        throw Error("Can't open '" + pDirOrFile + "' for reading. Does it exist?\n");
    }   
}

exports.main = function (pDirOrFile, pOptions){
    _.defaults(pOptions, {
        exclude: "",
        outputTo: "Makefile",
        delimiter: STARTING_STRING_DELIMITER
    });
    
    try {
        validateParameters(pDirOrFile);
        if ("-" === pOptions.outputTo) {
            core.getDependencyStrings(pDirOrFile, pOptions).forEach(function(pLine){
                process.stdout.write(pLine);
            });
        } else {
            appendToOrReplaceInFile(
                pOptions.outputTo,
                core.getDependencyStrings(pDirOrFile, pOptions),
                pOptions.delimiter
            );
        }
    } catch (e) {
        process.stderr.write("ERROR: " + e.message);
    }
};
