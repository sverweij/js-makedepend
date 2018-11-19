const fs = require('fs')
const _ = require('lodash')

const fileExists = _.memoize(pFile => {
  try {
    fs.accessSync(pFile, fs.R_OK)
  } catch (e) {
    return false
  }

  return true
})

/*
 * set detect-non-literal-regexp to ignore because we sanitized our input
 * (see main.js)
 */

/* eslint security/detect-non-literal-regexp: 0 */
const ignore = (pString, pExcludeREString) =>
  pExcludeREString ? !(RegExp(pExcludeREString, 'g').test(pString)) : true

module.exports = {
  fileExists,
  ignore
}
