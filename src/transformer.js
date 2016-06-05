"use strict";

const _                  = require('lodash');
const fs                 = require('fs');
const path               = require('path');
const extractorComposite = require('./extractor-composite');

let gScanned    = new Set();

const isIncludable = pDep => pDep.followable || pDep.resolved.endsWith('.json');
const hasIncludableDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isIncludable);
const notInCache = pFileName => !gScanned.has(pFileName);
const ignore = (pString, pExcludeREString) =>
    Boolean(pExcludeREString) ? !(RegExp(pExcludeREString, "g").test(pString)) : true;
const getAllJSFilesFromDir = (pDirName, pOptions) =>
    fs.readdirSync(pDirName)
        .filter(pFileInDir => ignore(pFileInDir, pOptions.exclude))
        .reduce((pSum, pFileName) => {
            if (fs.statSync(path.join(pDirName, pFileName)).isDirectory()){
                return pSum.concat(getAllJSFilesFromDir(path.join(pDirName, pFileName), pOptions));
            }
            if (pFileName.endsWith(".js")){
                return pSum.concat(path.join(pDirName, pFileName));
            }
            return pSum;
        }, []);
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
    const lRetval = Object.keys(lDependencies)
            .filter(notInCache)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependor)(lDependencies), "");

    Object.keys(lDependencies).forEach(lDep => gScanned.add(lDep));
    return lRetval;
}

function transformRecursiveFlattened(pFilename, pOptions){
    const lDependencies = extractorComposite.extractRecursiveFlattened(pFilename, pOptions);

    return Object.keys(lDependencies)
            .filter(_.curry(hasIncludableDependencies)(lDependencies))
            .reduce(_.curry(reduceDependorFlat)(lDependencies), "");
}

function transformRecursiveFlattenedDir(pDirname, pOptions){
    let lDependencies = [];

    getAllJSFilesFromDir(pDirname, pOptions).forEach(pFilename => {
        if (notInCache(pFilename)){
            lDependencies = lDependencies.concat(pFilename);
            lDependencies = lDependencies.concat(
                extractorComposite.extractRecursiveFlattened(pFilename, pOptions)[pFilename]
                .filter(isIncludable)
                .filter(pDependor => Boolean(gScanned.add(pDependor.resolved)))
                .map(pDependor => pDependor.resolved)
            );
        }
    });
    return _(lDependencies)
            .uniq()
            .sort()
            .reduce((pPrev, pNext) => `${pPrev.length > 0 ? `${pPrev} \\\n\t` : ''}${pNext}`, "").concat("\n");
}

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lRetval = "";
    let lOptions = _.clone(pOptions);

    if (!pOptions.append){
        lRetval = `\n${pOptions.delimiter}\n\n`;
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        pOptions.moduleSystems.forEach(pModuleSystem => {
            gScanned.clear();
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
                        getAllJSFilesFromDir(pDirOrFile, pOptions)
                            .reduce((pSum, pFileInDir) => {
                                if (!gScanned.has(pFileInDir)) {
                                    return pSum + transformRecursive(pFileInDir, lOptions);
                                }
                                return pSum;
                            }, "")}`;
            }
        });
        return lRetval;
    } else {
        pOptions.moduleSystems.forEach(pModuleSystem => {
            gScanned.clear();
            lOptions.moduleSystems = [pModuleSystem];

            if (pOptions.flatDefine){
                const lFlattenedDependencies = transformRecursiveFlattened(pDirOrFile, lOptions);

                lRetval += `# ${pModuleSystem} dependencies\n`;
                if (lFlattenedDependencies.length > 0) {
                    lRetval += `${pOptions.flatDefine}=${lFlattenedDependencies}`;
                }

            } else {
                lRetval +=
                    `# ${pModuleSystem} dependencies\n${transformRecursive(pDirOrFile, lOptions)}`;
            }
        });
        return lRetval;
    }
};
