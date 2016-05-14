"use strict";

const path    = require('path');
const _       = require('lodash');
const resolve = require('resolve');
const utl     = require('./utl');

function isRelativeModuleName(pString) {
    return pString.startsWith(".");
}

function resolveCJSModule(pModuleName, pBaseDir, pFileDir) {
    if(resolve.isCore(pModuleName)){
        return {
            resolved: pModuleName,
            coreModule: true
        };
    } else {
        return {
            resolved: path.relative(
                pBaseDir,
                resolve.sync(pModuleName, {basedir: pFileDir})
            ),
            coreModule: false
        };
    }
}

function resolveAMDModule(pModuleName, pBaseDir, pFileDir) {
    // TODO resolution of non-relative AMD modules
    //      AMD de gakste!!
    // lookups:
    // - could be relative in the end (sorta implemented now)
    // - require.config kerfuffle
    // - maybe use mrjoelkemp/module-lookup-amd ?
    let lProbablePath = path.relative(
        pBaseDir,
        path.join(pFileDir, `${pModuleName}.js`)
    );
    return {
        resolved: utl.fileExists(lProbablePath) ? lProbablePath: pModuleName,
        coreModule: !!resolve.isCore(pModuleName)
    };
}

exports.resolveModuleToPath = function (pDependency, pBaseDir, pFileDir) {
    if(isRelativeModuleName(pDependency.moduleName)){
        return {
            resolved: path.relative(
                        pBaseDir,
                        resolve.sync(pDependency.moduleName, {basedir: pFileDir})
                    ),
            coreModule: false
        };
    } else {
        if(_.includes(["cjs", "es6"], pDependency.moduleSystem)){
            return resolveCJSModule(pDependency.moduleName, pBaseDir, pFileDir);
        } else {
            return resolveAMDModule(pDependency.moduleName, pBaseDir, pFileDir);
        }
    }
};
