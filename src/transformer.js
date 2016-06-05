"use strict";

const _                  = require('lodash');
const fs                 = require('fs');
const extractorComposite = require('./extractor-composite');

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

function transformRecursive(pFilename, pOptions){
    const lDependencies = extractorComposite.extractRecursive(pFilename, pOptions);

    return Object.keys(lDependencies)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");

}

function transformRecursiveDir(pDirname, pOptions) {
    const lDependencies = extractorComposite.extractRecursiveDir(pDirname, pOptions);

    return Object.keys(lDependencies)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");
}

function transformRecursiveFlattened(pFilename, pOptions){
    const lDependencies = extractorComposite.extractRecursiveFlattened(pFilename, pOptions);

    return Object.keys(lDependencies)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependorFlat)(lDependencies), "");
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

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";
    let lOptions = _.clone(pOptions);

    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        pOptions.moduleSystems.forEach(pModuleSystem => {
            lOptions.moduleSystems = [pModuleSystem];

            if (pOptions.flatDefine){
                const lFlattenedDependencies = transformRecursiveFlattenedDir(pDirOrFile, lOptions);

                lRetval += `# ${pModuleSystem} dependencies\n`;

                if (lFlattenedDependencies.length > 0) {
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }
            } else {
                lRetval +=
                    `# ${pModuleSystem} dependencies\n${
                        transformRecursiveDir(pDirOrFile, lOptions)
                    }`;
            }
        });
        return lRetval;
    } else {
        pOptions.moduleSystems.forEach(pModuleSystem => {
            lOptions.moduleSystems = [pModuleSystem];

            if (pOptions.flatDefine){
                const lFlattenedDependencies = transformRecursiveFlattened(pDirOrFile, lOptions);

                lRetval += `# ${pModuleSystem} dependencies\n`;
                if (lFlattenedDependencies.length > 0) {
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }
            } else {
                lRetval +=
                    `# ${pModuleSystem} dependencies\n${
                        transformRecursive(pDirOrFile, lOptions)
                    }`;
            }
        });
        return lRetval;
    }
};
