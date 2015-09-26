/*
 * generates
 * - all es6, amd and commonjs dependencies in the src tree
 */

var path  = require("path");
var madge = require("madge");
var utl   = require("./utl");
var fs    = require("fs");

var BASE_DIR="";

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
            .reduce(function(pSum, pDep){
                return pSum + " \\\n\t" + pDep;
            }, pStartWith + ":"
        );
}

function walkFile(pModDeps, pFile){
    return pModDeps
        .filter(function(pModDep){
            return pModDep.module === pFile;
        })
        .reduce(function(pSum, pModDep){
            return pSum + getDepString(pFile, pModDep.deplist, pModDep.module) + "\n\n" +
                pModDep.deplist.reduce(function(pDepSum, pDep){
                    return pDepSum + walkFile(pModDeps, pDep);
                }, "");
        }, "");
}

function walkDir(pModDeps, pDir){
    return pModDeps
        .reduce(function(pSum, pModDep){
                return pSum + getDepString(pDir, pModDep.deplist, pModDep.module) + "\n\n";
        }, "");
}

function filterExistingFiles(pArray){
    // Don't include dependencies for which no corresponding
    // file exists. This prevents erroneous files from entering
    // the dependency tree, but also from core node modules
    // (path, fs, http, ...) from being mentioned

    return pArray.filter(function(pDep){
        return utl.fileExists(pDep);
    });
}

function sourcifyModules(pModules){
    return pModules.map(function(pModule){
        return sourcify(BASE_DIR, pModule);
    });
}

function toFilteredDepencyArray(pDepencyTreeObject){
    return Object.keys(pDepencyTreeObject)
        .map(function(pKey){
            return {
                module: sourcify(BASE_DIR, pKey),
                deplist: filterExistingFiles(
                    sourcifyModules(pDepencyTreeObject[pKey])
                )
            };
        })
        .filter(function(pModDeps){
            return pModDeps.deplist.length > 0;
        });
}

function getDeps(pDirOrFile, pExclude, pFormat){
    BASE_DIR = utl.getDirectory(pDirOrFile);
    var lDepencies = toFilteredDepencyArray (
        madge(
            [BASE_DIR],
            {format: pFormat, exclude: pExclude}
        ).tree
    );
    
    if (fs.statSync(pDirOrFile).isFile()){
        return walkFile(lDepencies, pDirOrFile);
    } else {
        return walkDir(lDepencies, pDirOrFile);
    }

}

exports.getDependencyStrings = function (pDirOrFile, pExclude, pDelimiter){
    return ["\n" + pDelimiter + "\n\n"]
        .concat("# amd dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "amd"))
        .concat("# commonJS dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "cjs"))
        .concat("# ES6 dependencies\n")
        .concat(getDeps(pDirOrFile, pExclude, "es6"))
        ;
};
