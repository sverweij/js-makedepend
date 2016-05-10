const fs   = require("fs");
const path = require("path");
const _    = require("lodash");

exports.fileExists = _.memoize(pFile => {
    try {
        fs.accessSync(pFile, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
});

exports.getDirectory = _.memoize(pDirOrFile =>
    fs.statSync(pDirOrFile).isDirectory() ? pDirOrFile : path.dirname(pDirOrFile)
);
