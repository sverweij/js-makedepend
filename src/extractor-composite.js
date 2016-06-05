"use strict";

const extractor = require('./extractor');
const _         = require('lodash');

function extractRecursive (pFileName, pOptions, pVisited) {
    pOptions = pOptions || {};
    pVisited = pVisited || new Set();
    pVisited.add(pFileName);

    let lRetval = {};
    const lDependencies = extractor.extractDependencies(pFileName, pOptions);

    lRetval[pFileName] = lDependencies;
    lDependencies
        .filter(pDep => pDep.followable && !pVisited.has(pDep.resolved))
        .forEach(
            pDep => {
                lRetval = _.merge(
                            lRetval,
                            extractRecursive(pDep.resolved, pOptions, pVisited)
                        );
            }
        );
    return lRetval;
}

function _extractRecursiveFlattened(pFileName, pOptions, pVisited) {
    pOptions = pOptions || {};
    pVisited = pVisited || new Set();
    pVisited.add(pFileName);

    const lDependencies = extractor.extractDependencies(pFileName, pOptions);
    let lRetval = _.clone(lDependencies);

    lDependencies
        .filter(pDep => pDep.followable && !pVisited.has(pDep.resolved))
        .forEach(
            pDep => {
                const lDep = _extractRecursiveFlattened(pDep.resolved, pOptions, pVisited);

                if (lDep){
                    lRetval = lRetval.concat(lDep);
                }
            }
        );

    return lRetval;
}

function extractRecursiveFlattened(pFileName, pOptions) {
    let lRetval = {};

    lRetval[pFileName] =
        _(_extractRecursiveFlattened(pFileName, pOptions))
            .uniqBy(pDep => pDep.resolved)
            .sortBy(pDep => pDep.resolved)
            .value();
    return lRetval;
}

exports.extractRecursive          = extractRecursive;
exports.extractRecursiveFlattened = extractRecursiveFlattened;
