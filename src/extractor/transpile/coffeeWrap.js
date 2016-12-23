"use strict";
const tryRequire = require("./tryRequire");
const coffeeScript = tryRequire("coffee-script");

module.exports = (pLiterate) => ({
    isAvailable : () => coffeeScript !== false,
    transpile : (pFile) => {
        const lOptions = pLiterate ? {literate:true} : {};

        return coffeeScript.compile(pFile, lOptions);
    }
});
