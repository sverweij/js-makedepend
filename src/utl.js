var fs   = require ("fs");
var path = require ("path");

exports.fileExists = function (pFile) {
    try {
        fs.accessSync(pFile,fs.R_OK);
    } catch (e){
        return false;
    }
    return true;
};

exports.getDirectory = function(pDirOrFile) {
    return fs.statSync(pDirOrFile).isDirectory() ? pDirOrFile : path.dirname(pDirOrFile);
};
