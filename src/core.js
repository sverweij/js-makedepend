/*
 * generates
 * - all es6, amd and commonjs dependencies in the src tree
 */

var path  = require("path");
var madge = require("madge");
var utl   = require("./utl");
var fs    = require("fs");
var _     = require("lodash");

var sourcifyFn = function (pDirOrFile, pString){
    return path.join(
        utl.getDirectory(pDirOrFile), 
        pString + ".js"
    );
};
var sourcify = {};

function getDepString(pArray, pStartWith){
    return _(pArray)
            .sort()
            .reduce(
                function(pSum, pDep){
                    return pSum + " \\\n\t" + pDep;
                }, pStartWith + ":"
            );
}

function extractFileDeps(pModDeps, pFile){
    return pModDeps
        .filter(function(pModDep){
            return pModDep.module === pFile;
        })
        .reduce(function(pSum, pModDep){
            return pSum.concat(pModDep)
                    .concat(
                         pModDep.deplist.reduce(function(pDepSum, pDep){
                            return pDepSum.concat(extractFileDeps(pModDeps, pDep));
                         }, [])
                    )
            ;
        }, []);
}

function deps2String(pModDeps){
    return pModDeps
        .reduce(function(pSum, pModDep){
                return pSum + getDepString(pModDep.deplist, pModDep.module) + "\n\n";
        }, "");
}

function toFilteredDepencyArray(pDepencyTreeObject){
    return Object.keys(pDepencyTreeObject)
        .map(function(pKey){
            return {
                module: sourcify(pKey), //sourcify(BASE_DIR, pModule);
                deplist: pDepencyTreeObject[pKey]
                            .map(function(pModule){
                                return sourcify(pModule); //sourcify(BASE_DIR, pModule);
                            })
                            // Don't include dependencies for which no corresponding
                            // file exists. This prevents erroneous files from entering
                            // the dependency tree, but also from core node modules
                            // (path, fs, http, ...) from being mentioned
                            .filter(function(pDep){
                                return utl.fileExists(pDep);
                            }
                )
            };
        })
        .filter(function(pModDeps){
            return pModDeps.deplist.length > 0;
        });
}

function deps2FlatString(pDependencyList, pFlatDefine){
    if (!!pFlatDefine && pDependencyList.length > 0){
        return _(pDependencyList)
        .pluck("deplist")
        .flatten()
        .sort()
        .uniq(true)
        .reduce(
            function(pSum, pDep){
                return pSum + pDep + " " ;
            },
            pFlatDefine + "="
        )
        .concat("\n");
        
    } else {
        return "";
    }
}

function getDeps(pDirOrFile, pExclude, pFormat, pFlatDefine){
    var BASE_DIR = utl.getDirectory(pDirOrFile);
    sourcify = _.curry(sourcifyFn)(BASE_DIR);
    var lDeps = toFilteredDepencyArray (
        madge(
            [BASE_DIR],
            {format: pFormat, exclude: pExclude}
        ).tree
    );
    if (fs.statSync(pDirOrFile).isFile()){
        return !!pFlatDefine ? 
                deps2FlatString(extractFileDeps(lDeps, pDirOrFile), pFlatDefine) :
                deps2String(extractFileDeps(lDeps, pDirOrFile));
    } else {
        return !!pFlatDefine ?
                deps2FlatString(lDeps, pFlatDefine) :
                deps2String(lDeps, pDirOrFile);
    }
}

exports.getDependencyStrings = function (pDirOrFile, pOptions){
    return (!(pOptions.append) ? ["\n" + pOptions.delimiter + "\n\n"] : [])
        .concat(pOptions.system.reduce(function(pSum, pSystem){
            return pSum + "# " + pSystem + " dependencies\n" +
                   getDeps(pDirOrFile, pOptions.exclude, pSystem, pOptions.flatDefine);
        }, ""))
        // .concat("# amd dependencies\n")
        // .concat(getDeps(pDirOrFile, pOptions.exclude, "amd", pOptions.flatDefine))
        // .concat("# commonJS dependencies\n")
        // .concat(getDeps(pDirOrFile, pOptions.exclude, "cjs", pOptions.flatDefine))
        // .concat("# ES6 dependencies\n")
        // .concat(getDeps(pDirOrFile, pOptions.exclude, "es6", pOptions.flatDefine))
        ;
};
