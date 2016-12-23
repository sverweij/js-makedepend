"use strict";

module.exports = (pModuleName) => {
    try {
        return require(pModuleName);
    } catch (e) {
        // left blank on purpose. We could check for e.code,
        // which would be === "MODULE_NOT_FOUND" when the module is not found.
    }
    return false;
};

/*
  eslint
    global-require: 0,
    security/detect-non-literal-require: 0
 */
