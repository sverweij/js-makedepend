"use strict";

const acorn    = require('acorn');
const walk     = require('acorn/dist/walk');
const fs       = require('fs');
const _        = require('lodash');
const path     = require('path');
const resolver = require('./resolver');


function getAST(pFileName) {
    return acorn.parse(
        fs.readFileSync(pFileName, 'utf8'),
        {
            sourceType: 'module',
        }
    );
}

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
            "ImportDeclaration": pushSourceValue,
            "ExportAllDeclaration": pushSourceValue,
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

function extractDependencies(pFileName, pOptions) {
    try {
        let lAST = getAST(pFileName);
        let lDependencies = [];
        pOptions = _.defaults(
            pOptions,
            {
                baseDir: process.env.PWD,
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
                            module        : pDependency.moduleName,
                            resolved      : lResolved.resolved,
                            moduleSystem  : pDependency.moduleSystem,
                            coreModule    : lResolved.coreModule
                        };
                    }
                ).value();
    } catch (e) {
        throw new Error(`Extracting dependencies ran afoul of... ${e.message}`);
    }
}


function extractRecursive (pFileName, pOptions, pDepth) {
    let lDependencies = extractDependencies(pFileName, pOptions);
    pDepth = pDepth ? pDepth : 0;
    lDependencies
        .filter(pDep => !(pDep.coreModule) /* TODO: ignore shizzle here */)
        .forEach(pDep => {console.log(_.repeat('  ', pDepth), pDep.resolved);
        extractRecursive(pDep.resolved, pOptions, pDepth+1);}
        );
    // return lDependencies;
}

exports.extractDependencies = extractDependencies;
exports.extractRecursive = extractRecursive;
