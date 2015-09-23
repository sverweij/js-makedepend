var fs = require ("fs");

exports.fileExists = function (pFile) {
    try {
        fs.accessSync(pFile,fs.R_OK);
    } catch (e){
        return false;
    }
    return true;
};
