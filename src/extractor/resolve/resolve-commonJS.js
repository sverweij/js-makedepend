"use strict";

const path    = require('path');
const resolve = require('resolve');
const utl     = require('../utl');

const SUPPORTED_EXTENSIONS = require("../transpile/meta").scannableExtensions;

/*
 * resolves both CommonJS and ES6
 */
module.exports = (pModuleName, pBaseDir, pFileDir) => {
    let lRetval = {
        resolved   : pModuleName,
        coreModule : false,
        followable : false,
        exists     : false
    };

    if (resolve.isCore(pModuleName)){
        lRetval.coreModule = true;
    } else {
        try {
            lRetval.resolved = path.relative(
                pBaseDir,
                resolve.sync(
                    pModuleName,
                    {
                        basedir: pFileDir,
                        extensions: SUPPORTED_EXTENSIONS
                    }
                )
            );
            lRetval.followable = (path.extname(lRetval.resolved) !== ".json");
            lRetval.exists = utl.fileExists(lRetval.resolved);
        } catch (e) {
            // lRetval.couldNotResolve = true;
        }
    }
    return lRetval;
};
