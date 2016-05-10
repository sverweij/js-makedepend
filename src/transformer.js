"use strict";

const extractor = require('./extractor');
const _         = require('lodash');
const fs        = require('fs');

function reduceDependencies(pPrev, pNext) {
    return `${pPrev} \\\n\t${pNext}`;
}

function reduceDependor(pDeps, pPrev, pNext) {
    let lDependencies = pDeps[pNext]
            .filter(isNonCoreModule)
            .map(pDep=>pDep.resolved)
            .reduce(reduceDependencies);

    return `${pPrev}${pNext}: \\\n\t${lDependencies}\n\n`;
}

let isNonCoreModule = pDep => !pDep.coreModule;

let hasNonCoreModuleDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isNonCoreModule);

function transformRecursive(pFilename, pOptions){
    let lDependencies = extractor.extractRecursive(pFilename, pOptions);
    return Object.keys(lDependencies)
            .filter(_.curry(hasNonCoreModuleDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
}

function transformRecursiveFlattened(pFilename, pOptions){
    let lDependencies = extractor.extractRecursiveFlattened(pFilename, pOptions);
    return Object.keys(lDependencies)
            .filter(_.curry(hasNonCoreModuleDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
}

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";
    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }
    if (pOptions.flatDefine){
        return lRetval + `${pOptions.flatDefine}=${transformRecursiveFlattened(pDirOrFile, pOptions)}`;
    }
    if (fs.statSync(pDirOrFile).isDirectory()){
        return lRetval + `# to be implemented\n`;
    } else {
        return lRetval + transformRecursive(pDirOrFile, pOptions);
    }
};
