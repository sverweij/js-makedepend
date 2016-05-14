const fs   = require("fs");
const _    = require("lodash");

exports.fileExists = _.memoize(pFile => {
    try {
        fs.accessSync(pFile, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
});
