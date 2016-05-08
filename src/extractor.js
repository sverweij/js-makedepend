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

function extractCommonJSDependencies(pAST, pDependencyArray, pModuleSystem) {
    walk.simple(
        pAST,
        {
            "Identifier": function (pNode) {
                let lNode;

                if (pNode.name === 'require'){
                    lNode = walk.findNodeAfter(
                            pAST,
                            pNode.end+1,
                            () => true
                    );
                    if (typeof lNode !== 'undefined' && lNode.node.value){
                        pDependencyArray.push({
                            moduleName: lNode.node.value,
                            moduleSystem: pModuleSystem ? pModuleSystem : "cjs"
                        });
                    }
                }
            }
        }
    );
}

function extractES6Dependencies(pAST, pDependencyArray) {
    let pushSourceValue = pNode => {
        if (pNode.source && pNode.source.value){
            pDependencyArray.push({
                moduleName: pNode.source.value,
                moduleSystem: "es6"
            });
        }
    };

    walk.simple(
        pAST,
        {
            "ImportDeclaration": pushSourceValue,
            "ExportAllDeclaration": pushSourceValue,
            "ExportNamedDeclaration": pushSourceValue
        }
    );
}

function extractAMDDependencies(pAST, pDependencyArray) {
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
                            arg.elements.forEach( el => pDependencyArray.push({
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
                                    extractCommonJSDependencies(pFunction.body, pDependencyArray, "amd");
                                }
                            });
                     }
            }
        }
    );
}

exports.extractDependencies = (pFileName, pOptions) => {
    try {
        let lAST = getAST(pFileName);
        let lDependencyArray = [];
        pOptions = _.defaults(
            pOptions,
            {
                baseDir: process.env.PWD,
                moduleSystems: ["cjs", "es6", "amd"]
            }
        );

        if (_.includes(pOptions.moduleSystems, "cjs")){
            extractCommonJSDependencies(lAST, lDependencyArray);
        }

        if (_.includes(pOptions.moduleSystems, "es6")){
            extractES6Dependencies(lAST, lDependencyArray);
        }

        if (_.includes(pOptions.moduleSystems, "amd")){
            extractAMDDependencies(lAST, lDependencyArray);
        }

        return _(lDependencyArray)
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
};
