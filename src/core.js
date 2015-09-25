/*
 * generates
 * - all es6, amd and commonjs dependencies in the src tree
 */

var path  = require("path");
var madge = require("madge");
var utl   = require("./utl");
var fs    = require("fs");

function sourcify(pDirOrFile, pString){
    return path.join(
        utl.getDirectory(pDirOrFile), 
        pString + ".js"
    );
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
                return utl.fileExists(sourcify(LE_DIRECTOIRE, pDep));
            })
            .reduce(function(pSum, pDep){
                return pSum + " \\\n\t" + sourcify(LE_DIRECTOIRE, pDep);
            }, sourcify(LE_DIRECTOIRE, pStartWith) + ":"
        );
}
function walkFile(pDeps, pFile){
    return Object.keys(pDeps)
            .filter(function(pDep){
                return (pDeps[pDep].length > 0) && (sourcify(LE_DIRECTOIRE, pDep) === pFile);
            })
            .reduce(function(pSum, pDep){
                return pSum + getDepString(pFile, pDeps[pDep], pDep) + "\n\n" +
                    pDeps[pDep].reduce(function(pDepSum, pDepDep){
                        if (utl.fileExists(sourcify(LE_DIRECTOIRE, pDepDep))){
                            return pDepSum + walkFile(pDeps, sourcify(LE_DIRECTOIRE, pDepDep));
                        } else {
                            return "";
                        }
                    }, "");
            }, "");
}

function walkDir(pDeps, pDir){
    return Object.keys(pDeps)
            .filter(function(pDep){
                return pDeps[pDep].length > 0;
            })
            .reduce(function(pSum, pDep){
                return pSum + getDepString(pDir, pDeps[pDep], pDep) + "\n\n";
            }, "");
}
var LE_DIRECTOIRE="";
function getDeps(pDirOrFile, pExclude, pFormat){
    LE_DIRECTOIRE = utl.getDirectory(pDirOrFile);
    var lDeps = madge(
        [LE_DIRECTOIRE],
        // pDirOrFile,
        {format: pFormat, exclude: pExclude}
    ).tree;
    
    if (fs.statSync(pDirOrFile).isFile()){
        return walkFile(lDeps, pDirOrFile);
    } else {
        return walkDir(lDeps, pDirOrFile);
    }

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
