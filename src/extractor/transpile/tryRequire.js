"use strict";
const path   = require('path');
const semver = require('semver');

module.exports = (pModuleName, pSemVer) => {
    let lRetval = false;

    try {
        lRetval = require(pModuleName);
        if (
            Boolean(pSemVer) &&
            !semver.satisfies(
                require(path.join(pModuleName, 'package.json')).version,
                pSemVer
            )
        ) {
            lRetval = false;
        }
    } catch (e) {
        lRetval = false;
    }
    return lRetval;
};

/*
  eslint
    global-require: 0,
    security/detect-non-literal-require: 0
 */
