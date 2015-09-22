var core  = require("./core");
var fs    = require("fs");
var STARTING_STRING_DELIMITER = "# DO NOT DELETE THIS LINE -- makedepend.js depends on it.";

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
        process.stdout.write("'" + pOutputTo + "' didn't exist. We'll create the file instead.");
    }
    fs.appendFileSync(
        pOutputTo,
        pArray.join(''),
        {encoding: 'utf8', flag: 'a'}
    );
}

function fileExists(pFile) {
    try {
        fs.accessSync(pFile,fs.R_OK);
    } catch (e){
        return false;
    }
    return true;
}


exports.main = function (pDirOrFile, pExclude, pOutputTo, pDelimiter){
    var lExclude   = !!pExclude   ? pExclude  : "";
    var lOutputTo  = !!pOutputTo  ? pOutputTo : "Makefile";
    var lDelimiter = !!pDelimiter ? pDelimiter : STARTING_STRING_DELIMITER;

    if (fileExists(pDirOrFile)) {
        if ("-" === lOutputTo) {
            core.getDependencyStrings(pDirOrFile, lExclude, lDelimiter).forEach(function(pLine){
                process.stdout.write(pLine);
            });
        } else {
            appendToOrReplaceInFile(
                lOutputTo,
                core.getDependencyStrings(pDirOrFile, lExclude, lDelimiter)
            );
        }
    } else {
        process.stderr.write("Can't open '" + pDirOrFile + "' for reading. Does it exist?\n");
    }
};
