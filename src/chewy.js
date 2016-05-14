const core  = require("./transformer");
const fs    = require("fs");
const utl   = require("./utl");
const _     = require("lodash");

const STARTING_STRING_DELIMITER = "# DO NOT DELETE THIS LINE -- js-makedepend depends on it.";
const DEFAULT_MODULE_SYSTEMS    = ["cjs", "amd", "es6"];
const MODULE_SYSTEM_LIST_RE     = /^((cjs|amd|es6)(,|$))+$/gi;

function appendToOrReplaceInFile(pOutputTo, pDependencyString, pDelimiter, pAppend) {
    if (!pAppend) {
        try {
            const lOutputFile = fs.readFileSync(pOutputTo, {encoding: "utf8", flag: "r"});
            const lLines      = lOutputFile.split("\n");
            const lDelimiterPosition = lLines.indexOf(pDelimiter);

            if (lDelimiterPosition > -1) {
                fs.writeFileSync(
                    pOutputTo,
                    lLines.splice(0, lDelimiterPosition).join("\n"),
                    {encoding: "utf8", flag: "w"}
                );
            }
        } catch (e) {
            // process.stdout.write("'" + pOutputTo + "' didn't exist. We'll create the file instead.\n");
        }
    }

    fs.appendFileSync(
        pOutputTo,
        pDependencyString,
        {encoding: "utf8", flag: "a"}
    );
}

function normalizeModuleSystems(pSystemList) {
    if (_.isString(pSystemList)) {
        return _(pSystemList.split(",")).sort().uniq().valueOf();
    }
    /* istanbul ignore else  */
    if (_.isArray(pSystemList)) {
        return _(pSystemList).sort().uniq().valueOf();
    }
    /* istanbul ignore next  */
    return DEFAULT_MODULE_SYSTEMS;
}

function validateParameters(pDirOrFile, pOptions) {
    if (!utl.fileExists(pDirOrFile)) {
        throw Error("Can't open '" + pDirOrFile + "' for reading. Does it exist?\n");
    }

    if (!!pOptions.system && _.isString(pOptions.system)) {
        const lParamArray = pOptions.system.match(MODULE_SYSTEM_LIST_RE);
        if (!lParamArray || lParamArray.length !== 1) {
            throw Error("Invalid module system list: '" + pOptions.system + "'\n");
        }
    }
}

exports.main = (pDirOrFile, pOptions) => {
    pOptions = _.defaults(pOptions, {
        exclude: "",
        outputTo: "Makefile",
        delimiter: STARTING_STRING_DELIMITER,
        system: DEFAULT_MODULE_SYSTEMS,
    });

    try {
        validateParameters(pDirOrFile, pOptions);
        pOptions.moduleSystems = normalizeModuleSystems(pOptions.system);
        if ("-" === pOptions.outputTo) {
            process.stdout.write(core.getDependencyStrings(pDirOrFile, pOptions));
        } else {
            appendToOrReplaceInFile(
                pOptions.outputTo,
                core.getDependencyStrings(pDirOrFile, pOptions),
                pOptions.delimiter,
                pOptions.append
            );
        }
    } catch (e) {
        process.stderr.write("ERROR: " + e.message);
    }
};
