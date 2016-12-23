"use strict";
const tryRequire = require("./tryRequire");
const typescript = tryRequire("typescript");

exports.isAvailable = () => typescript !== false;

exports.transpile = pFile =>
    typescript.transpileModule(
        pFile,
        {
            compilerOptions: {
                "target": "es2015"
            }
        }
    ).outputText;
