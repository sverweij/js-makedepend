"use strict";

const extractor = require('./extractor');
const _         = require('lodash');
const fs        = require('fs');
const path      = require('path');

let gScanned    = new Set();

let isNonCoreModule = pDep => !pDep.coreModule;
let hasNonCoreModuleDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isNonCoreModule);
let notInCache = pFileName => !gScanned.has(pFileName);
let getAllJSFilesFromDir = pDirName =>
    fs.readdirSync(pDirName).reduce((pSum, pFileName) => {
        if (fs.statSync(path.join(pDirName, pFileName)).isDirectory()){
            return pSum.concat(getAllJSFilesFromDir(path.join(pDirName, pFileName)));
        }
        if (pFileName.endsWith(".js")){
            return pSum.concat(path.join(pDirName, pFileName));
        }
        return pSum;
    }, []);


function reduceDependencies(pPrev, pNext) {
    return `${pPrev} \\\n\t${pNext}`;
}

function reduceDependor(pDeps, pPrev, pNext) {
    let lDependencies = pDeps[pNext]
            .filter(isNonCoreModule)
            .map(pDep=>pDep.resolved)
            .sort()
            .reduce(reduceDependencies);

    return `${pPrev}${pNext}: \\\n\t${lDependencies}\n\n`;
}

function reduceDependorFlat(pDeps, pPrev, pNext) {
    let lDependencies = pDeps[pNext]
            .filter(isNonCoreModule)
            .map(pDep=>pDep.resolved)
            .reduce(reduceDependencies);

    return `${pPrev}${pNext} \\\n\t${lDependencies}\n`;
}

function transformRecursive(pFilename, pOptions){
    if (gScanned.has(pFilename)) {return;}

    let lDependencies = extractor.extractRecursive(pFilename, pOptions);
    let lRetval = Object.keys(lDependencies)
            .filter(notInCache)
            .filter(_.curry(hasNonCoreModuleDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
    Object.keys(lDependencies).forEach(lDep => gScanned.add(lDep));
    return lRetval;
}

function transformRecursiveFlattened(pFilename, pOptions){
    let lDependencies = extractor.extractRecursiveFlattened(pFilename, pOptions);
    return Object.keys(lDependencies)
            .filter(_.curry(hasNonCoreModuleDependencies)(lDependencies))
            .reduce(_.curry(reduceDependorFlat)(lDependencies), "");
}

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";
    let lOptions = _.clone(pOptions);

    gScanned.clear();

    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        if (pOptions.flatDefine){
            // TODO: this'll get all .js, but not
            //      - .json & .node
            //      - stuff outside the current directory
            let lFlattenedDependencies = getAllJSFilesFromDir(pDirOrFile);
            if (lFlattenedDependencies.length > 0){
                return lRetval + `${pOptions.flatDefine}=${
                    lFlattenedDependencies.reduce(reduceDependencies, "")
                }`;
            }
            return lRetval;
        } else {
            pOptions.moduleSystems.forEach(pModuleSystem => {
                gScanned.clear();

                lOptions.moduleSystems = [pModuleSystem];
                lRetval +=
                    `# ${pModuleSystem} dependencies\n` +
                    getAllJSFilesFromDir(pDirOrFile)
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
