"use strict";

const jsWrap        = require("./javaScriptWrap");
const tsWrap        = require("./typeScriptWrap");
const lsWrap        = require("./liveScriptWrap");
const coffeeWrap    = require("./coffeeWrap")();
const litCoffeeWrap = require("./coffeeWrap")(true);

const extension2wrapper = {
    ".js"        : jsWrap,
    ".ts"        : tsWrap,
    ".ls"        : lsWrap,
    ".coffee"    : coffeeWrap,
    ".litcoffee" : litCoffeeWrap,
    ".coffee.md" : litCoffeeWrap
};

module.exports.getWrapper = pExtension => extension2wrapper[pExtension] || jsWrap;
module.exports.scannableExtensions =
    Object.keys(extension2wrapper)
        .filter(
            pKey => extension2wrapper[pKey].isAvailable()
        );
