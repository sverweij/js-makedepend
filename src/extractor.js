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

function extractCommonJSDependencies(pAST, pDependencyArray) {
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
                            moduleSystem: "cjs"
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
            // module as a function (define(Array, function))
            // module with a name (define(string, Array, function))
            // 'root' require module (require(Array, function)
            "ExpressionStatement": pNode => {
                if ( pNode.expression.type === "CallExpression" &&
                     pNode.expression.callee.type === "Identifier" &&
                     ( pNode.expression.callee.name === "define" ||
                       pNode.expression.callee.name === "require") ){
                    pNode.expression.arguments
                        .filter(arg => arg.type === "ArrayExpression")
                        .forEach(arg =>
                            arg.elements.forEach( el => pDependencyArray.push({
                                moduleName: el.value,
                                moduleSystem: "amd"
                            }))
                        );
                }
            }
        }
    );
    // TODO CommonJS-wrapper (define(function(require, exports, module){
    //      ... every 'require' call is a depencency
    //      var aModule = require("./dont/forgetme"); // hi there
    //      ... exports and module are optional
    //   }))
    //
    //   ... and of course you could use anything for that Identifier
    //   (define(function(pBoatyMcBoatFace){
    //      var aModule = pBoatyMcBoatFace("./david/attenburough")
    //   }))

    // TODO define(["require", ...], function(require, ...){
    //          var aModule = require("./modules/aModule"); // hello
    //      })

}

exports.extractDependencies = (pFileName, pOptions) => {
    try {
        let lAST = getAST(pFileName);
        let lDependencyArray = [];
        _.defaults(
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

        // TODO: does not take care of AMD lookups yet explicitly
        //       (which in some cases _might_ work out of the box)
        return _(lDependencyArray)
                .uniqBy(pDependency => `${pDependency.moduleName}, ${pDependency.moduleSystem}`)
                .sortBy(pDependency => `${pDependency.moduleName}, ${pDependency.moduleSystem}`)
                .map(
                    pDependency => {
                        let pFileString = resolver.resolveModuleToPath(
                            pDependency,
                            pOptions.baseDir,
                            path.dirname(pFileName)
                        );
                        return {
                            module        : pDependency.moduleName,
                            resolved      : pFileString,
                            moduleSystem  : pDependency.moduleSystem,
                            coreModule    : (pDependency.moduleName === pFileString) && !(resolver.isRelativeModuleName(pDependency.moduleName))
                        };
                    }
                ).value();
    } catch (e) {
        throw new Error(`Extracting dependencies ran afoul of... ${e.message}`);
    }
};
