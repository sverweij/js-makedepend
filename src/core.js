/*
 * generates to stdout:
 * - all es6, amd and commonjs dependencies in the src tree
 */
/* jshint indent:4 */
/* jshint node:true */
/* jshint strict:false */

var path  = require('path');
var madge = require('madge');
var fs    = require('fs');

var STARTING_STRING_DELIMITER = "# DO NOT DELETE THIS LINE -- makedepend.js depends on it.";

function sourcify(pDirOrFile, pString){
    var lDir = path.dirname(pDirOrFile) === "." ? pDirOrFile : path.dirname(pDirOrFile);
    return path.join(lDir, pString + ".js");
}

function stringCompare (pOne, pTwo){
    return pOne.localeCompare(pTwo);
}

function getDepString(pDirOrFile, pArray, pStartWith){
    return pArray
            .sort(stringCompare)
            .filter(function (pDep){
                // Don't include dependencies for which no corresponding
                // file exists. This prevents erroneous files from entering
                // the dependency tree, but also from core node modules 
                // (path, fs, http, ...) from being mentioned 
                try {
                    fs.accessSync(sourcify(pDirOrFile, pDep),fs.R_OK);
                } catch (_e){
                    return false;
                }
                return true;
            }).reduce(function(pSum, pDep){
                return pSum + " \\\n\t" + sourcify(pDirOrFile, pDep);
            }, sourcify(pDirOrFile, pStartWith) + ":"
        );
}

function getDeps(pDirOrFile, pExclude, pFormat){
    var lDeps = madge([pDirOrFile], {format: pFormat, exclude: pExclude}).tree;

    return Object.keys(lDeps)
            .filter(function(pDep){
                return lDeps[pDep].length > 0;
            })
            .reduce(function(pSum, pDep){
                return pSum + getDepString(pDirOrFile, lDeps[pDep], pDep) + "\n\n";
            }, "");
}

function shizzleiFy (pDirOrFile, pExclude){
    var lRetval = ["\n" + STARTING_STRING_DELIMITER + "\n\n"];

    lRetval.push("# amd dependencies\n");
    lRetval.push(getDeps(pDirOrFile, pExclude, "amd"));

    lRetval.push("# commonJS dependencies\n");
    lRetval.push(getDeps(pDirOrFile, pExclude, "cjs"));

    lRetval.push("# ES6 dependencies\n");
    lRetval.push(getDeps(pDirOrFile, pExclude, "es6"));
    return lRetval;
}

exports.doShizzle = function (pDirOrFile, pExclude, pOutputTo){
    var lExclude  = !!pExclude ? pExclude : "";
    var lOutputTo = !!pOutputTo ? pOutputTo : "Makefile";

    if (!!pOutputTo && '-' === pOutputTo) {
        shizzleiFy(pDirOrFile, lExclude, lOutputTo).forEach(function(pLine){
            process.stdout.write(pLine);
        });
    } else {
        try {
            var lOutputFile = fs.readFileSync(lOutputTo, {encoding: 'utf8', flag: 'r'});
            var lLines = lOutputFile.split('\n');
            var lDelimiterPosition = lLines.indexOf(STARTING_STRING_DELIMITER);
            if ( lDelimiterPosition > -1){
                fs.writeFileSync(lOutputTo, lLines.splice(0, lDelimiterPosition).join('\n'), {encoding: 'utf8', flag: 'w'});
            }
        } catch (e){
            process.stdout.write("'" + lOutputTo + "' didn't exist. We'll create the file instead.");
        }
        fs.appendFileSync(lOutputTo, shizzleiFy(pDirOrFile, lExclude, lOutputTo).join(''), {encoding: 'utf8', flag: 'a'});
    }
};
