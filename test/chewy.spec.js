var assert = require("assert");
var chewy  = require("../src/chewy.js");
var fs     = require("fs");
var tst    = require("./utl/testutensils");
var path   = require("path");

var OUT_DIR = "./test/output";
var FIX_DIR = "./test/fixtures";

var testPairs = [
    {
        description : "js-makedepend -f test/output/basic.dir.mk test/fixtures/cjs",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.mk")
        },
        expect      : "basic.dir.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -f test/output/basic.dir.mk test/fixtures/cjs",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.mk")
        },
        expect      : "basic.dir.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -f test/output/basic.file.mk test/fixtures/cjs/root_one.js",
        dirOrFile   : "test/fixtures/cjs/root_one.js",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.file.mk")
        },
        expect      : "basic.file.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -f test/output/basic.dir.filtered.mk -x node_modules test/fixtures/cjs",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.filtered.mk"),
            exclude   : "node_modules"
        },
        expect      : "basic.dir.filtered.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -f test/output/basic.dir.addedto.mk test/fixtures/cjs - should just add",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.addedto.mk"),
        },
        expect      : "basic.dir.addedto.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -f test/output/basic.dir.addedto.mk test/fixtures/cjs - again; should have same result",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.addedto.mk"),
        },
        expect      : "basic.dir.addedto.mk",
        cleanup     : true
    },
    {
        description : "js-makedepend -s '# NON-STANDARD DELIMITER' test/fixtures/cjs - non-standard delimiter",
        dirOrFile   : "test/fixtures/cjs",
        options     : {
            outputTo  : path.join(OUT_DIR, "basic.dir.delimiter.mk"),
            delimiter : "# NON-STANDARD DELIMITER"
        },
        expect      : "basic.dir.delimiter.mk",
        cleanup     : true
    },
];

function resetOutputDir(){
    testPairs
    .filter(function(pPair){
        return pPair.cleanup;
    })
    .forEach(function(pPair){
        try {
            fs.unlinkSync(pPair.options.outputTo);
        } catch(e) {
            // process.stderr.write(typeof e);
        }
    });
    fs.writeFileSync(path.join(OUT_DIR, "basic.dir.addedto.mk"), "Here is some content\nIt's not ended by a linebreak", "utf8");
    try {
        fs.unlinkSync(path.join(OUT_DIR, "basic.dir.stdout.mk"));
    } catch(e) {
        // process.stderr.write(typeof e);
    }
}

describe('#chewy', function() {
    before("set up", function(){
        resetOutputDir();
    });
    
    after("tear down", function(){
        resetOutputDir();
    });
    
    describe("file based tests", function(){
        testPairs.forEach(function(pPair){
            it(pPair.description, function(){
                chewy.main(pPair.dirOrFile, pPair.options);
                tst.assertFileEqual(
                    pPair.options.outputTo, 
                    path.join(FIX_DIR, pPair.expect)
                );
            });
        });
    });
    describe("specials", function(){
        it("js-makedepend -f - test/fixtures/cjs - outputs to stdout", function() {
            var intercept = require("intercept-stdout");

            var lCapturedStdout = "";
            var unhook_intercept = intercept(function(pText) {
                lCapturedStdout += pText;
            });
            chewy.main("test/fixtures/cjs", {outputTo: "-"});
            unhook_intercept();
            fs.writeFileSync(
                path.join(OUT_DIR, "basic.dir.stdout.mk"),
                lCapturedStdout,
                "utf8"
            );

            tst.assertFileEqual(
                path.join(OUT_DIR, "basic.dir.stdout.mk"),
                path.join(FIX_DIR, "basic.dir.stdout.mk")
            );
        });
        it("js-makedepend -f basic.dir.wontmarch.mk this-doesnot-exist - non-existing generates an error", function() {
            var intercept = require("intercept-stdout");

            var lCapturedStdout = "";
            var unhook_intercept_stdout = intercept(function(pText) {
                // This space intentionally left empty
            });
            var unhook_intercept_stderr = intercept(function(pText) {
                lCapturedStdout += pText;
            });
            chewy.main("this-doesnot-exist", {outputTo: ""});
            unhook_intercept_stdout();
            unhook_intercept_stderr();
            
            return assert.equal(
                lCapturedStdout,
                "ERROR: Can't open 'this-doesnot-exist' for reading. Does it exist?\n"
            );
        });
    });
});
