"use strict";

const _                  = require('lodash');
const fs                 = require('fs');
const extractorComposite = require('./extractor-composite');

// const isIncludable = pDep => pDep.followable || pDep.resolved.endsWith('.json');
// const hasIncludableDependencies = (pDeps, pDependor) => pDeps[pDependor].some(isIncludable);

function transformDependencies(pDependencies) {
    return Object.keys(pDependencies)
        // .filter(_.curry(hasIncludableDependencies)(pDependencies))
        .map(pDependor => {
            return {
                source: pDependor,
                dependencies: pDependencies[pDependor]
            };
        });
}

exports.getDependencyStrings = (pDirOrFile, pOptions) => {
    let lOptions = _.clone(pOptions);

    return JSON.stringify(
        pOptions.moduleSystems.map(pModuleSystem => {
            lOptions.moduleSystems = [pModuleSystem];
            return {
                moduleSystem: pModuleSystem,
                sources: transformDependencies(
                    fs.statSync(pDirOrFile).isDirectory()
                        ? extractorComposite.extractRecursiveDir(pDirOrFile, lOptions)
                        : extractorComposite.extractRecursive(pDirOrFile, lOptions)
                )
            };
        })
        , null
        , "  "
    );
};

/* eslint arrow-body-style:0 */
