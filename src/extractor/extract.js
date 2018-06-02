"use strict";

const path                        = require('path');
const _                           = require('lodash');
const extractES6Dependencies      = require('dependency-cruiser/src/extract/ast-extractors/extract-ES6-deps');
const extractCommonJSDependencies = require('dependency-cruiser/src/extract/ast-extractors/extract-commonJS-deps');
const extractAMDDependencies      = require('dependency-cruiser/src/extract/ast-extractors/extract-AMD-deps');
const extractTypeScript           = require('dependency-cruiser/src/extract/ast-extractors/extract-typescript-deps');
const getJSASTCached              = require('dependency-cruiser/src/extract/parse/toJavascriptAST').getASTCached;
const toTypescriptAST             = require('dependency-cruiser/src/extract/parse/toTypescriptAST');
const resolve                     = require('./resolve');
const utl                         = require('./utl');

function getECMADependencies(pFileName, pDependencies, pOptions, pAST) {
    if (path.extname(pFileName).startsWith(".ts") && toTypescriptAST.isAvailable()) {
        pDependencies = pDependencies.concat(
            extractTypeScript(
                toTypescriptAST.getASTCached(
                    path.join(pOptions.baseDir, pFileName)
                )
            )
        );
    } else {
        extractES6Dependencies(pAST, pDependencies);
    }
    return pDependencies;
}

function getDependencies(pFileName, pOptions) {
    const lAST = getJSASTCached(pFileName);
    let lDependencies = [];

    if (pOptions.moduleSystems.indexOf("cjs") > -1) {
        extractCommonJSDependencies(lAST, lDependencies);
    }
    if (pOptions.moduleSystems.indexOf("es6") > -1) {
        lDependencies = getECMADependencies(pFileName, lDependencies, pOptions, lAST);
    }
    if (pOptions.moduleSystems.indexOf("amd") > -1) {
        extractAMDDependencies(lAST, lDependencies);
    }
    return lDependencies;
}

function addResolutionAttributes(pOptions, pFileName) {
    return pDependency => {
        const lResolved = resolve(pDependency, pOptions.baseDir, path.dirname(pFileName));

        return Object.assign(lResolved, {
            module: pDependency.moduleName,
            moduleSystem: pDependency.moduleSystem
        });
    };
}

/**
 * Returns an array of dependencies present in the given file. Of
 * each dependency it returns
 *   module        - the name of the module as found in the file
 *   resolved      - the filename the dependency resides in (including the path
 *                   to the current directory or the directory passed as
 *                   'baseDir' in the options)
 *   moduleSystem  - the module system
 *   coreModule    - a boolean indicating whether it is a (nodejs) core module
 *
 *
 * @param  {string} pFileName path to the file
 * @param  {object} pOptions  an object with one or more of these properties:
 *                            - baseDir       - the directory to consider as the
 *                                              base for all files
 *                                              Default: the current working directory
 *                            - moduleSystems - an array of module systems to
 *                                              consider.
 *                                              Default: ["cjs", "es6", "amd"]
 *                            - exclude       - a regular expression string
 *                              with a pattern of modules to exclude (e.g.
 *                              "(node_modules)"). Default: none
 * @return {array}           an array of dependency objects (see above)
 */
module.exports = (pFileName, pOptions) => {
    try {
        pOptions = _.defaults(
            pOptions,
            {
                baseDir: process.cwd(),
                moduleSystems: ["cjs", "es6", "amd"]
            }
        );

        return _(getDependencies(pFileName, pOptions))
            .uniqBy(pDependency => `${pDependency.moduleName} ${pDependency.moduleSystem}`)
            .sortBy(pDependency => `${pDependency.moduleName} ${pDependency.moduleSystem}`)
            .map(addResolutionAttributes(pOptions, pFileName))
            .filter(pDep => utl.ignore(pDep.resolved, pOptions.exclude))
            .value();
    } catch (e) {
        throw new Error(`Extracting dependencies ran afoul of...\n\n  ${e.message}\n... in ${pFileName}\n\n`);
    }
};
