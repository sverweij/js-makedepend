"use strict";

const fs                   = require('fs');
const path                 = require('path');
const _                    = require('lodash');

const extract              = require('./extract');
const utl                  = require('./utl');
const SUPPORTED_EXTENSIONS = require('./transpile/meta').scannableExtensions;

let gScanned    = new Set();

const notInCache = pFileName => !gScanned.has(pFileName);
const isIncludable = pDep => pDep.followable || path.extname(pDep.resolved) === '.json';

function getAllJSFilesFromDir (pDirName, pOptions) {
    return fs.readdirSync(pDirName)
        .filter(pFileInDir => utl.ignore(pFileInDir, pOptions.exclude))
        .reduce((pSum, pFileName) => {
            if (fs.statSync(path.join(pDirName, pFileName)).isDirectory()){
                return pSum.concat(getAllJSFilesFromDir(path.join(pDirName, pFileName), pOptions));
            }
            if (SUPPORTED_EXTENSIONS.some(pExtension => pFileName.endsWith(pExtension))){
                return pSum.concat(path.join(pDirName, pFileName));
            }
            return pSum;
        }, []);
}

function extractRecursive (pFileName, pOptions, pVisited) {
    pOptions = pOptions || {};
    pVisited = pVisited || new Set();
    pVisited.add(pFileName);

    let lRetval = {};
    const lDependencies = extract(pFileName, pOptions);

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

function extractRecursiveDir(pDirName, pOptions) {
    let lVisited = new Set();

    return _.spread(_.merge)(
        getAllJSFilesFromDir(pDirName, pOptions)
            .reduce((pDependencies, pFilename) => {
                if (!lVisited.has(pFilename)){
                    lVisited.add(pFilename);
                    return pDependencies.concat(
                        extractRecursive(pFilename, pOptions, lVisited)
                    );
                }
                return pDependencies;
            }, [])
    );
}

function _extractRecursiveFlattened(pFileName, pOptions, pVisited) {
    pOptions = pOptions || {};
    pVisited = pVisited || new Set();
    pVisited.add(pFileName);

    const lDependencies = extract(pFileName, pOptions);
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

function extractRecursiveFlattenedDir(pDirname, pOptions){
    let lDependencies = [];

    gScanned.clear();

    getAllJSFilesFromDir(pDirname, pOptions)
        .filter(notInCache)
        .forEach(pFilename => {
            lDependencies = lDependencies.concat(pFilename).concat(
                extractRecursiveFlattened(pFilename, pOptions)[pFilename]
                    .filter(isIncludable)
                    .filter(pDependor => Boolean(gScanned.add(pDependor.resolved)))
                    .map(pDependor => pDependor.resolved)
            );
        });
    return lDependencies;
}

exports.extractRecursive             = extractRecursive;
exports.extractRecursiveDir          = extractRecursiveDir;
exports.extractRecursiveFlattened    = extractRecursiveFlattened;
exports.extractRecursiveFlattenedDir = extractRecursiveFlattenedDir;
