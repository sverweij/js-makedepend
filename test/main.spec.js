"use strict";
const fs        = require("fs");
const path      = require("path");
const assert    = require("assert");
const _         = require("lodash");
const intercept = require("intercept-stdout");
const expect    = require("chai").expect;
const main      = require("../src/main.js");
const tst       = require("./utl/testutensils");

const OUT_DIR = "./test/output";
const FIX_DIR = "./test/fixtures";

/* eslint max-len:0*/
const testPairs = [
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.mk test/fixtures/{{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.mk")
        },
        expect: "{{moduleType}}.dir.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.mk test/fixtures/{{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.mk")
        },
        expect: "{{moduleType}}.dir.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.file.mk test/fixtures/{{moduleType}}/root_one.js",
        dirOrFile: "test/fixtures/{{moduleType}}/root_one.js",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.file.mk")
        },
        expect: "{{moduleType}}.file.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.filtered.mk -x node_modules test/fixtures/{{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.filtered.mk"),
            exclude: "node_modules"
        },
        expect: "{{moduleType}}.dir.filtered.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.addedto.mk test/fixtures/{{moduleType}} - should just add",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.addedto.mk")
        },
        expect: "{{moduleType}}.dir.addedto.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.addedto.mk test/fixtures/{{moduleType}} - again; should have same result",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.addedto.mk")
        },
        expect: "{{moduleType}}.dir.addedto.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -s '# NON-STANDARD DELIMITER' test/fixtures/{{moduleType}} - non-standard delimiter",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.delimiter.mk"),
            delimiter: "# NON-STANDARD DELIMITER",
            system: "es6,amd,cjs"
        },
        expect: "{{moduleType}}.dir.delimiter.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.dir.flatdef.mk -d ALL_SRC test/fixtures/{{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.dir.flatdef.mk"),
            flatDefine: "ALL_SRC"
        },
        expect: "{{moduleType}}.dir.flatdef.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -f test/output/{{moduleType}}.file.flatdef.mk -d ALL_SRC test/fixtures/{{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}/root_one.js",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.file.flatdef.mk"),
            flatDefine: "ROOT_ONE_SRC"
        },
        expect: "{{moduleType}}.file.flatdef.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -a step 1: init {{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.file.initandappend.mk"),
            system: "{{moduleType}}",
            append: false
        },
        expect: "{{moduleType}}.file.initandappend.1.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -a step 2: add flat for root_one.js {{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}/root_one.js",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.file.initandappend.mk"),
            flatDefine: "ROOT_ONE_SRC",
            system: "{{moduleType}}",
            append: true
        },
        expect: "{{moduleType}}.file.initandappend.2.mk",
        cleanup: true
    },
    {
        description: "js-makedepend -a step 3: add flat for root_two.js {{moduleType}}",
        dirOrFile: "test/fixtures/{{moduleType}}/root_two.js",
        options: {
            outputTo: path.join(OUT_DIR, "{{moduleType}}.file.initandappend.mk"),
            flatDefine: "ROOT_TWO_SRC",
            system: "{{moduleType}}",
            append: true
        },
        expect: "{{moduleType}}.file.initandappend.3.mk",
        cleanup: true
    }
];

function deleteDammit(pFileName) {
    try {
        fs.unlinkSync(pFileName);
    } catch (e) {
        // process.stderr.write(e.message || e);
    }
}

function resetOutputDir() {
    testPairs
        .filter(pPair => pPair.cleanup)
        .forEach(pPair => {
            try {
                fs.unlinkSync(pPair.options.outputTo.replace("{{moduleType}}", "cjs"));
                fs.unlinkSync(pPair.options.outputTo.replace("{{moduleType}}", "amd"));
            } catch (e) {
                // process.stderr.write(typeof e);
            }
        });

    fs.writeFileSync(
        path.join(OUT_DIR, "cjs.dir.addedto.mk"),
        "Here is some content\nIt's not ended by a linebreak", "utf8"
    );
    fs.writeFileSync(
        path.join(OUT_DIR, "amd.dir.addedto.mk"),
        "Here is some content\nIt's not ended by a linebreak", "utf8"
    );

    deleteDammit(path.join(OUT_DIR, "cjs.dir.stdout.mk"));
    deleteDammit(path.join(OUT_DIR, "amd.dir.stdout.mk"));
}

function setModuleType(pTestPairs, pModuleType) {
    return pTestPairs.map(pTestPair => {
        let lRetval = {
            description: pTestPair.description.replace(/{{moduleType}}/g, pModuleType),
            dirOrFile: pTestPair.dirOrFile.replace(/{{moduleType}}/g, pModuleType),
            expect: pTestPair.expect.replace(/{{moduleType}}/g, pModuleType),
            cleanup: pTestPair.cleanup
        };

        lRetval.options = _.clone(pTestPair.options);
        lRetval.options.outputTo = pTestPair.options.outputTo.replace(/{{moduleType}}/g, pModuleType);
        if (Boolean(pTestPair.options.system)) {
            lRetval.options.system = pTestPair.options.system.replace(/{{moduleType}}/g, pModuleType);
        }

        return lRetval;
    });
}

function runFileBasedTests(pModuleType) {
    setModuleType(testPairs, pModuleType).forEach(pPair => {
        it(pPair.description, () => {
            main.main(pPair.dirOrFile, pPair.options);
            tst.assertFileEqual(
                pPair.options.outputTo,
                path.join(FIX_DIR, pPair.expect)
            );
        });
    });
}

describe("#main", () => {
    before("set up", () => {
        resetOutputDir();
    });

    after("tear down", () => {
        resetOutputDir();
    });

    describe("file based tests - commonJS", () => {
        runFileBasedTests("cjs");
    });

    describe("specials", () => {

        it("js-makedepend -i shows meta info about the current environment", () => {
            let lCapturedStdout = "";
            const unhookIntercept = intercept(pText => {
                lCapturedStdout += pText;
            });

            main.main(null, ({info: true}));
            unhookIntercept();

            expect(
                lCapturedStdout
            ).to.contain(
                "If you need a supported, but not enabled transpiler ('"
            );
        });

        it("js-makedepend -f - test/fixtures/cjs - outputs to stdout", () => {
            let lCapturedStdout = "";
            const unhookIntercept = intercept(pText => {
                lCapturedStdout += pText;
            });

            main.main("test/fixtures/cjs", {outputTo: "-"});
            unhookIntercept();
            fs.writeFileSync(
                path.join(OUT_DIR, "cjs.dir.stdout.mk"),
                lCapturedStdout,
                "utf8"
            );

            tst.assertFileEqual(
                path.join(OUT_DIR, "cjs.dir.stdout.mk"),
                path.join(FIX_DIR, "cjs.dir.stdout.mk")
            );
        });

        it("js-makedepend -f cjs.dir.wontmarch.mk this-doesnot-exist - non-existing generates an error", () => {
            let lCapturedStderr = "";
            const unhookInterceptStdOut = intercept(() => {
                // This space intentionally left empty
            });

            const unhookInterceptStdErr = intercept(pText => {
                lCapturedStderr += pText;
            });

            main.main("this-doesnot-exist", {outputTo: path.join(OUT_DIR, "cjs.dir.wontmarch.mk")});
            unhookInterceptStdOut();
            unhookInterceptStdErr();

            return assert.equal(
                lCapturedStderr,
                "ERROR: Can't open 'this-doesnot-exist' for reading. Does it exist?\n"
            );
        });

        it("js-makedepend -f /dev/null -M invalidmodulesystem - generates error", () => {
            let lCapturedStderr = "";
            const unhookInterceptStdOut = intercept(() => {
                // This space intentionally left empty
            });

            const unhookInterceptStdErr = intercept(pText => {
                lCapturedStderr += pText;
            });

            main.main(
                "test/fixtures",
                {
                    outputTo: path.join(OUT_DIR, "/dev/null"),
                    system: "invalidmodulesystem"
                }
            );
            unhookInterceptStdOut();
            unhookInterceptStdErr();
            intercept(pText => {
                lCapturedStderr += pText;
            })();

            return assert.equal(
                lCapturedStderr,
                "ERROR: Invalid module system list: 'invalidmodulesystem'\n"
            );
        });

        it("js-makedepend -f /dev/null -x '([a-zA-z]+)*'  - unsafe exclusion patterns don't run", () => {
            let lCapturedStderr = "";
            const unhookInterceptStdOut = intercept(() => {
                // This space intentionally left empty
            });

            const unhookInterceptStdErr = intercept(pText => {
                lCapturedStderr += pText;
            });

            main.main(
                "test/fixtures",
                {
                    outputTo: path.join(OUT_DIR, "/dev/null"),
                    exclude: "([A-Za-z]+)*"
                }
            );
            unhookInterceptStdOut();
            unhookInterceptStdErr();

            return assert.equal(
                lCapturedStderr,
                "ERROR: The exclude pattern '([A-Za-z]+)*' will probably run very slowly - cowardly refusing to run.\n"
            );
        });
    });
});
