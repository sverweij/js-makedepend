const fs   = require("fs");
const path = require("path");
const _    = require("lodash");

exports.fileExists = _.memoize(function(pFile) {
    try {
        fs.accessSync(pFile, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
});

exports.getDirectory = _.memoize(function(pDirOrFile) {
    return fs.statSync(pDirOrFile).isDirectory() ? pDirOrFile : path.dirname(pDirOrFile);
});
