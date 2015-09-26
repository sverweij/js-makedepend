var core  = require("./core");
var fs    = require("fs");
var utl   = require("./utl");

var STARTING_STRING_DELIMITER = "# DO NOT DELETE THIS LINE -- js-makedepend depends on it.";

function appendToOrReplaceInFile(pOutputTo, pArray, pDelimiter){
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
    var lExclude   = !!pOptions.exclude   ? pOptions.exclude  : "";
    var lOutputTo  = !!pOptions.outputTo  ? pOptions.outputTo : "Makefile";
    var lDelimiter = !!pOptions.delimiter ? pOptions.delimiter : STARTING_STRING_DELIMITER;
    
    try {
        validateParameters(pDirOrFile);
        if ("-" === lOutputTo) {
            core.getDependencyStrings(pDirOrFile, lExclude, lDelimiter).forEach(function(pLine){
                process.stdout.write(pLine);
            });
            // process.stdout.write("# flat dependencies from here\n");
        } else {
            appendToOrReplaceInFile(
                lOutputTo,
                core.getDependencyStrings(pDirOrFile, lExclude, lDelimiter),
                lDelimiter
            );
            // fs.appendFileSync(lOutputTo, "# flat dependencies from here\n", "utf8");
        }
    } catch (e) {
        process.stderr.write("ERROR: " + e.message);
    }
};
