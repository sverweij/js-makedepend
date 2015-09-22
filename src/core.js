/*
 * generates
 * - all es6, amd and commonjs dependencies in the src tree
 */

var path  = require('path');
var madge = require('madge');

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

exports.getDependencyStrings = function (pDirOrFile, pExclude, pDelimiter){
    return ["\n" + pDelimiter + "\n\n"]
        .concat("# amd dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "amd"))
        .concat("# commonJS dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "cjs"))
        .concat("# ES6 dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "es6"));
};
