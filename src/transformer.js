"use strict";

const extractor = require('./extractor');
const _         = require('lodash');
const fs        = require('fs');
const path      = require('path');

let gScanned    = new Set();

let isIncludable = pDep => pDep.followable||pDep.resolved.endsWith('.json');
let hasIncludableDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isIncludable);
let notInCache = pFileName => !gScanned.has(pFileName);
let ignore = (pString, pExcludeREString) =>
    !!pExcludeREString? !(RegExp(pExcludeREString, "g").test(pString)) : true;
let getAllJSFilesFromDir = (pDirName, pOptions) =>
    fs.readdirSync(pDirName)
        .filter(pDirName => ignore(pDirName, pOptions.exclude))
        .reduce((pSum, pFileName) => {
        if (fs.statSync(path.join(pDirName, pFileName)).isDirectory()){
            return pSum.concat(getAllJSFilesFromDir(path.join(pDirName, pFileName), pOptions));
        }
        if (pFileName.endsWith(".js")){
            return pSum.concat(path.join(pDirName, pFileName));
        }
        return pSum;
    }, []);
let reduceDependencies = (pPrev, pNext) => `${pPrev} \\\n\t${pNext}`;

function reduceDependor(pDeps, pPrev, pNext) {
    let lDependencies = pDeps[pNext]
            .filter(isIncludable)
            .map(pDep=>pDep.resolved)
            .sort()
            .reduce(reduceDependencies);

    return `${pPrev}${pNext}: \\\n\t${lDependencies}\n\n`;
}

function reduceDependorFlat(pDeps, pPrev, pNext) {
    let lDependencies = pDeps[pNext]
            .filter(isIncludable)
            .map(pDep=>pDep.resolved)
            .reduce(reduceDependencies);

    return `${pPrev}${pNext} \\\n\t${lDependencies}\n`;
}

function transformRecursive(pFilename, pOptions){
    let lDependencies = extractor.extractRecursive(pFilename, pOptions);
    let lRetval = Object.keys(lDependencies)
            .filter(notInCache)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
    Object.keys(lDependencies).forEach(lDep => gScanned.add(lDep));
    return lRetval;
}

function transformRecursiveFlattened(pFilename, pOptions){
    let lDependencies = extractor.extractRecursiveFlattened(pFilename, pOptions);
    return Object.keys(lDependencies)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependorFlat)(lDependencies), "");
}

function transformRecursiveFlattenedDir(pDirname, pOptions){
    let lDependencies = [];
    getAllJSFilesFromDir(pDirname, pOptions).forEach(pFilename => {
        if(notInCache(pFilename)){
            lDependencies = lDependencies.concat(pFilename);
            lDependencies = lDependencies.concat(
                extractor.extractRecursiveFlattened(pFilename, pOptions)[pFilename]
                .filter(isIncludable)
                .filter(pDependor => !!gScanned.add(pDependor.resolved))
                .map(pDependor => pDependor.resolved)
            );
        }
    });
    return _(lDependencies)
            .uniq()
            .sort()
            .reduce((pPrev, pNext) => `${pPrev.length>0? pPrev + ' \\\n\t':''}${pNext}`, "").concat("\n");
}

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";
    let lOptions = _.clone(pOptions);

    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        if (pOptions.flatDefine){
            pOptions.moduleSystems.forEach(pModuleSystem => {
                gScanned.clear();

                lOptions.moduleSystems = [pModuleSystem];

                let lFlattenedDependencies = transformRecursiveFlattenedDir(pDirOrFile, lOptions);
                lRetval += `# ${pModuleSystem} dependencies\n`;

                if (lFlattenedDependencies.length > 0) {
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }
            });
            return lRetval;
        } else {
            pOptions.moduleSystems.forEach(pModuleSystem => {
                gScanned.clear();

                lOptions.moduleSystems = [pModuleSystem];
                lRetval +=
                    `# ${pModuleSystem} dependencies\n` +
                    getAllJSFilesFromDir(pDirOrFile, pOptions)
                            .reduce((pSum, pDirOrFile) => {
                                if(!gScanned.has(pDirOrFile)) {
                                    return pSum + transformRecursive(pDirOrFile, lOptions);
                                }
                                return pSum;
                            }, "");
            });
            return lRetval;
        }
    } else {
        if (pOptions.flatDefine){
            pOptions.moduleSystems.forEach(pModuleSystem => {
                gScanned.clear();
                lOptions.moduleSystems = [pModuleSystem];
                let lFlattenedDependencies = transformRecursiveFlattened(pDirOrFile, lOptions);
                lRetval += `# ${pModuleSystem} dependencies\n`;
                if (lFlattenedDependencies.length > 0) {
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }
            });
            return lRetval;
        } else {
            pOptions.moduleSystems.forEach(pModuleSystem => {
                gScanned.clear();
                lOptions.moduleSystems = [pModuleSystem];
                lRetval +=
                    `# ${pModuleSystem} dependencies\n` + transformRecursive(pDirOrFile, lOptions);
            });
            return lRetval;
        }
    }
};
