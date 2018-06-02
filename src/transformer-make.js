"use strict";

const fs                 = require('fs');
const _                  = require('lodash');
const extractorComposite = require('./extractor');

const isIncludable = pDep => pDep.followable || pDep.resolved.endsWith('.json');
const hasIncludableDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isIncludable);

const reduceDependencies = (pPrev, pNext) => `${pPrev} \\\n\t${pNext}`;

function reduceDependor(pDeps, pPrev, pNext) {
    const lDependencies = pDeps[pNext]
        .filter(isIncludable)
        .map(pDep => pDep.resolved)
        .sort()
        .reduce(reduceDependencies);

    return `${pPrev}${pNext}: \\\n\t${lDependencies}\n\n`;
}

function reduceDependorFlat(pDeps, pPrev, pNext) {
    const lDependencies = pDeps[pNext]
        .filter(isIncludable)
        .map(pDep => pDep.resolved)
        .reduce(reduceDependencies);

    return `${pPrev}${pNext} \\\n\t${lDependencies}\n`;
}

function transformDependencies(pDependencies) {
    return Object.keys(pDependencies)
        .filter(_.curry(hasIncludableDependencies)(pDependencies))
        .reduce(_.curry(reduceDependor)(pDependencies), "");
}

function transformDependenciesFlat(pDependencies) {
    return Object.keys(pDependencies)
        .filter(_.curry(hasIncludableDependencies)(pDependencies))
        .reduce(_.curry(reduceDependorFlat)(pDependencies), "");
}

function transformRecursiveFlattenedDir(pDirname, pOptions){
    return _(extractorComposite.extractRecursiveFlattenedDir(pDirname, pOptions))
        .uniq()
        .sort()
        .reduce(
            (pPrev, pNext) =>
                `${pPrev.length > 0 ? `${pPrev} \\\n\t` : ''}${pNext}`, ""
        )
        .concat("\n");
}

function getDepStringsForADir(pOptions, pDirOrFile, pRetval) {
    let lOptions = _.clone(pOptions);

    pOptions.moduleSystems.forEach(pModuleSystem => {
        lOptions.moduleSystems = [pModuleSystem];
        if (pOptions.flatDefine) {
            const lFlattenedDependencies = transformRecursiveFlattenedDir(pDirOrFile, lOptions);

            pRetval += `# ${pModuleSystem} dependencies\n`;
            if (lFlattenedDependencies.length > 0) {
                pRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
            }
        } else {
            pRetval +=
                `# ${pModuleSystem} dependencies\n${
                    transformDependencies(
                        extractorComposite.extractRecursiveDir(pDirOrFile, lOptions)
                    )
                }`;
        }
    });
    return pRetval;
}

function getDepStringsForAFile(pOptions, pDirOrFile, lRetval) {
    let lOptions = _.clone(pOptions);

    pOptions.moduleSystems.forEach(pModuleSystem => {
        lOptions.moduleSystems = [pModuleSystem];
        if (pOptions.flatDefine) {
            const lFlattenedDependencies = transformDependenciesFlat(
                extractorComposite.extractRecursiveFlattened(pDirOrFile, lOptions)
            );

            lRetval += `# ${pModuleSystem} dependencies\n`;
            if (lFlattenedDependencies.length > 0) {
                lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
            }
        } else {
            lRetval +=
                `# ${pModuleSystem} dependencies\n${
                    transformDependencies(
                        extractorComposite.extractRecursive(pDirOrFile, lOptions)
                    )
                }`;
        }
    });
    return lRetval;
}


module.exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";

    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        return getDepStringsForADir(pOptions, pDirOrFile, lRetval);
    } else {
        return getDepStringsForAFile(pOptions, pDirOrFile, lRetval);
    }
};

