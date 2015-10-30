var fs   = require("fs");
var path = require("path");
var _    = require("lodash");

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
