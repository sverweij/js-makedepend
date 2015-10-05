/*
 * generates
 * - all es6, amd and commonjs dependencies in the src tree
 */

var path  = require("path");
var madge = require("madge");
var utl   = require("./utl");
var fs    = require("fs");
var _     = require("lodash");

function sourcify (pBaseDir, pString){
    return path.join(
        pBaseDir, 
        pString + ".js"
    );
}

function addToMakefileString(pString, pAddition){
    return pString + " \\\n\t" + pAddition;
}

function getDepString(pArray, pStartWith){
    return _(pArray)
            .sort()
            .reduce(addToMakefileString, pStartWith + ":");
}

function thisFileOnly(pFile, pModDep){
    return pModDep.module === pFile;
}

function concatModDep (pModDeps, pFileDepArray, pModDep){
    return pFileDepArray
            .concat(pModDep)
            .concat(
                 pModDep.deplist.reduce(function(pDepSum, pListEntry){
                    return pDepSum.concat(extractFileDeps(pModDeps, pListEntry));
                 }, [])
            )
    ;
}

function extractFileDeps(pModDeps, pFile){
    return pModDeps
        .filter(_.curry(thisFileOnly)(pFile))
        .reduce(_.curry(concatModDep)(pModDeps), []);
}

function deps2String(pModDeps){
    return pModDeps
        .reduce(function(pSum, pModDep){
                return pSum + getDepString(pModDep.deplist, pModDep.module) + "\n\n";
        }, "");
}

function withDependenciesOnly(pModDeps){
    return pModDeps.deplist.length > 0;
}

function toFilteredDepencyArray(pDepencyTreeObject, pBaseDir){
    return Object.keys(pDepencyTreeObject)
        .map(function(pKey){
            return {
                module: sourcify(pBaseDir, pKey), 
                deplist: pDepencyTreeObject[pKey]
                            .map(_.curry(sourcify)(pBaseDir))
                            // Don't include dependencies for which no corresponding
                            // file exists. This prevents erroneous files from entering
                            // the dependency tree, but also from core node modules
                            // (path, fs, http, ...) from being mentioned
                            .filter(utl.fileExists)
            };
        })
        .filter(withDependenciesOnly);
}

function deps2FlatString(pDependencyList, pFlatDefine, pFile){
    if (!!pFlatDefine && pDependencyList.length > 0){
        return _(pDependencyList)
        .map("deplist")
        .flatten()
        .sort()
        .uniq(true)
        .reduce(addToMakefileString, pFlatDefine + "=" + (!!pFile ? pFile : ""))
        .concat("\n");
        
    } else {
        return "";
    }
}

function getDeps(pDirOrFile, pExclude, pFormat, pFlatDefine){
    var lDeps = toFilteredDepencyArray (
        madge(
            [utl.getDirectory(pDirOrFile)],
            {format: pFormat, exclude: pExclude}
        ).tree,
        utl.getDirectory(pDirOrFile)
    );
    if (fs.statSync(pDirOrFile).isFile()){
        return !!pFlatDefine ? 
                deps2FlatString(extractFileDeps(lDeps, pDirOrFile), pFlatDefine, pDirOrFile) :
                deps2String(extractFileDeps(lDeps, pDirOrFile));
    } else {
        return !!pFlatDefine ?
                deps2FlatString(lDeps, pFlatDefine) :
                deps2String(lDeps, pDirOrFile);
    }
}

exports.getDependencyStrings = function (pDirOrFile, pOptions){
    return pOptions.system.reduce(function(pSum, pSystem){
            return pSum
                    .concat(["# " + pSystem + " dependencies\n"])
                    .concat(
                        getDeps(pDirOrFile, pOptions.exclude, pSystem, pOptions.flatDefine)
                    );
        }, !(pOptions.append) ? ["\n" + pOptions.delimiter + "\n\n"] : []);
};
