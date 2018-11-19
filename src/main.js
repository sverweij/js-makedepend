const fs = require('fs')
const _ = require('lodash')
const safeRegex = require('safe-regex')
const formatMetaInfo = require('dependency-cruiser/src/cli/formatMetaInfo')

const transformToMake = require('./transformer-make')

const STARTING_STRING_DELIMITER = '# DO NOT DELETE THIS LINE -- js-makedepend depends on it.'
const DEFAULT_MODULE_SYSTEMS = ['cjs', 'amd', 'es6']
const MODULE_SYSTEM_LIST_RE = /^((cjs|amd|es6)(,|$))+$/gi

function appendToOrReplaceInFile (pOutputTo, pDependencyString, pDelimiter, pAppend) {
  if (!pAppend) {
    try {
      const lOutputFile = fs.readFileSync(pOutputTo, { encoding: 'utf8', flag: 'r' })
      const lLines = lOutputFile.split('\n')
      const lDelimiterPosition = lLines.indexOf(pDelimiter)

      if (lDelimiterPosition > -1) {
        fs.writeFileSync(
          pOutputTo,
          lLines.splice(0, lDelimiterPosition).join('\n'),
          { encoding: 'utf8', flag: 'w' }
        )
      }
    } catch (e) {
      // process.stdout.write("'" + pOutputTo + "' didn't exist. We'll create the file instead.\n");
    }
  }

  fs.appendFileSync(
    pOutputTo,
    pDependencyString,
    { encoding: 'utf8', flag: 'a' }
  )
}

function normalizeModuleSystems (pSystemList) {
  if (_.isString(pSystemList)) {
    return _(pSystemList.split(',')).sort().uniq().valueOf()
  }
  // istanbul ignore else
  if (_.isArray(pSystemList)) {
    return _(pSystemList).sort().uniq().valueOf()
  }
  // istanbul ignore next
  return DEFAULT_MODULE_SYSTEMS
}

function validateFileExistence (pDirOrFile) {
  try {
    fs.accessSync(pDirOrFile, fs.R_OK)
  } catch (e) {
    throw Error(`Can't open '${pDirOrFile}' for reading. Does it exist?\n`)
  }
}

function validateSystems (pSystem) {
  if (Boolean(pSystem) && _.isString(pSystem)) {
    const lParamArray = pSystem.match(MODULE_SYSTEM_LIST_RE)

    if (!lParamArray || lParamArray.length !== 1) {
      throw Error(`Invalid module system list: '${pSystem}'\n`)
    }
  }
}

function validateExcludePattern (pExclude) {
  if (Boolean(pExclude) && !safeRegex(pExclude)) {
    throw Error(
      `The exclude pattern '${pExclude}' will probably run very slowly - cowardly refusing to run.\n`
    )
  }
}

function validateParameters (pDirOrFile, pOptions) {
  validateFileExistence(pDirOrFile)
  if (pOptions) {
    validateSystems(pOptions.system)
    validateExcludePattern(pOptions.exclude)
  }
}

module.exports.main = (pDirOrFile, pOptions) => {
  pOptions = _.defaults(pOptions, {
    exclude: '',
    outputTo: 'Makefile',
    delimiter: STARTING_STRING_DELIMITER,
    system: DEFAULT_MODULE_SYSTEMS
  })
  if (pOptions.info) {
    process.stdout.write(formatMetaInfo())
  } else {
    try {
      validateParameters(pDirOrFile, pOptions)
      pOptions.moduleSystems = normalizeModuleSystems(pOptions.system)
      if (pOptions.outputTo === '-') {
        process.stdout.write(
          transformToMake
            .getDependencyStrings(pDirOrFile, pOptions)
        )
      } else {
        appendToOrReplaceInFile(
          pOptions.outputTo,
          transformToMake
            .getDependencyStrings(pDirOrFile, pOptions),
          pOptions.delimiter,
          pOptions.append
        )
      }
    } catch (e) {
      process.stderr.write(`ERROR: ${e.message}`)
    }
  }
}
