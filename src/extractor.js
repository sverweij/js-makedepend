"use strict";

const acorn    = require('acorn/dist/acorn_loose');
const walk     = require('acorn/dist/walk');
const fs       = require('fs');
const _        = require('lodash');
const path     = require('path');
const resolver = require('./resolver');

let getAST = pFileName =>
    acorn.parse_dammit(
        fs.readFileSync(pFileName, 'utf8'),
        {
            sourceType: 'module'
        }
    );


function extractCommonJSDependencies(pAST, pDependencies, pModuleSystem) {
    // var/const lalala = require('./lalala');
    // require('./lalala');
    // require('./lalala').doFunkyStuff();

    walk.simple(
        pAST,
        {
            "CallExpression": pNode => {
                if (pNode.callee.type==="Identifier" && pNode.callee.name==="require"){
                    if(pNode.arguments && pNode.arguments[0] && pNode.arguments[0].value){
                        pDependencies.push({
                            moduleName: pNode.arguments[0].value,
                            moduleSystem: pModuleSystem ? pModuleSystem : "cjs"
                        });
                    }
                }
            }
        }
    );
}

function extractES6Dependencies(pAST, pDependencies) {
    function pushSourceValue(pNode){
        if (pNode.source && pNode.source.value){
            pDependencies.push({
                moduleName: pNode.source.value,
                moduleSystem: "es6"
            });
        }
    }

    walk.simple(
        pAST,
        {
            "ImportDeclaration"     : pushSourceValue,
            "ExportAllDeclaration"  : pushSourceValue,
            "ExportNamedDeclaration": pushSourceValue
        }
    );
}

function extractAMDDependencies(pAST, pDependencies) {
    walk.simple(
        pAST,
        {
            "ExpressionStatement": pNode => {
                // module as a function (define(Array, function))
                // module with a name (define(string, Array, function))
                // 'root' require module (require(Array, function)
                if ( pNode.expression.type === "CallExpression" &&
                     pNode.expression.callee.type === "Identifier" &&
                     ( pNode.expression.callee.name === "define" ||
                       pNode.expression.callee.name === "require") ){
                    pNode.expression.arguments
                        .filter(pArg => pArg.type === "ArrayExpression")
                        .forEach(arg =>
                            arg.elements.forEach( el => pDependencies.push({
                                moduleName: el.value,
                                moduleSystem: "amd"
                            }))
                        );
                }
                // CommonJS-wrappers:
                //  (define(function(require, exports, module){
                //  define(["require", ...], function(require, ...){
                //      ... every 'require' call is a depencency
                // Won't work if someone decides to name the first parameter of
                // the function passed to the define something else from "require"
                if ( pNode.expression.type === "CallExpression" &&
                     pNode.expression.callee.type === "Identifier" &&
                     pNode.expression.callee.name === "define" ) {
                    pNode.expression.arguments
                        .filter(pArg => pArg.type === "FunctionExpression")
                        .forEach(pFunction => {
                            if(pFunction.params.filter(pParam => pParam.name ==="require")){
                                extractCommonJSDependencies(pFunction.body, pDependencies, "amd");
                            }
                        });
                }
            }
        }
    );
}

let ignore = (pString, pExcludeREString) =>
    !!pExcludeREString? !(RegExp(pExcludeREString, "g").test(pString)) : true;

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
function extractDependencies(pFileName, pOptions) {
    try {
        let lAST = getAST(pFileName);
        let lDependencies = [];
        pOptions = _.defaults(
            pOptions,
            {
                baseDir: process.cwd(),
                moduleSystems: ["cjs", "es6", "amd"]
            }
        );

        if (_.includes(pOptions.moduleSystems, "cjs")){
            extractCommonJSDependencies(lAST, lDependencies);
        }

        if (_.includes(pOptions.moduleSystems, "es6")){
            extractES6Dependencies(lAST, lDependencies);
        }

        if (_.includes(pOptions.moduleSystems, "amd")){
            extractAMDDependencies(lAST, lDependencies);
        }

        return _(lDependencies)
                .uniqBy(pDependency => `${pDependency.moduleName}, ${pDependency.moduleSystem}`)
                .sortBy(pDependency => `${pDependency.moduleName}, ${pDependency.moduleSystem}`)
                .map(
                    pDependency => {
                        let lResolved = resolver.resolveModuleToPath(
                            pDependency,
                            pOptions.baseDir,
                            path.dirname(pFileName)
                        );
                        return {
                            module       : pDependency.moduleName,
                            resolved     : lResolved.resolved,
                            moduleSystem : pDependency.moduleSystem,
                            coreModule   : lResolved.coreModule,
                            followable   : lResolved.followable
                        };
                    }
                )
                .filter(pDep => ignore(pDep.resolved, pOptions.exclude))
                .value();
    } catch (e) {
        throw new Error(`Extracting dependencies ran afoul of... ${e.message} in ${pFileName}`);
    }
}

function extractRecursive (pFileName, pOptions, pVisited) {
    pOptions = pOptions ? pOptions : {};
    pVisited = pVisited||new Set();
    pVisited.add(pFileName);

    let lRetval = {};
    let lDependencies = extractDependencies(pFileName, pOptions);

    lRetval[pFileName] = lDependencies;
    lDependencies
        .filter(pDep => pDep.followable && !pVisited.has(pDep.resolved))
        .forEach(
            pDep =>
                lRetval = _.merge(
                            lRetval,
                            extractRecursive(pDep.resolved, pOptions, pVisited)
                        )
        );
    return lRetval;
}

function _extractRecursiveFlattened(pFileName, pOptions, pVisited) {
    pOptions = pOptions ? pOptions : {};
    pVisited = pVisited||new Set();
    pVisited.add(pFileName);

    let lDependencies = extractDependencies(pFileName, pOptions);
    let lRetval = _.clone(lDependencies);

    lDependencies
        .filter(pDep => pDep.followable && !pVisited.has(pDep.resolved))
        .forEach(
            pDep => {
                let lDep = _extractRecursiveFlattened(pDep.resolved, pOptions, pVisited);
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

exports.extractDependencies       = extractDependencies;
exports.extractRecursive          = extractRecursive;
exports.extractRecursiveFlattened = extractRecursiveFlattened;
