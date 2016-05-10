"use strict";

const extractor = require('./extractor');
const _         = require('lodash');
const fs        = require('fs');

let isNonCoreModule = pDep => !pDep.coreModule;
let hasNonCoreModuleDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isNonCoreModule);

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
    let lDependencies = extractor.extractRecursive(pFilename, pOptions);
    return Object.keys(lDependencies)
            .filter(_.curry(hasNonCoreModuleDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
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
    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        if (pOptions.flatDefine){
            return lRetval + `# directory scanning yet to be implemented for flat define\n`;
        } else {
            return lRetval + `# directory scanning yet to be implemented for everything\n`;
        }
    } else {
        if (pOptions.flatDefine){
            pOptions.moduleSystems.forEach(pModuleSystem => {
                lOptions.moduleSystems = [pModuleSystem];
                let lFlattenedDependencies = transformRecursiveFlattened(pDirOrFile, lOptions);
                lRetval += `# ${pModuleSystem} dependencies\n`;
                if (lFlattenedDependencies.length > 0){
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }
            });
            return lRetval;
        } else {
            pOptions.moduleSystems.forEach(pModuleSystem => {
                lOptions.moduleSystems = [pModuleSystem];
                lRetval +=
                    `# ${pModuleSystem} dependencies\n` +
                    transformRecursive(pDirOrFile, lOptions);
            });
            return lRetval;
        }
    }
};
