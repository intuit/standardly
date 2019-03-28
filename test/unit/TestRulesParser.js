"use strict";
const chai = require("chai");
const expect = chai.expect;
const RulesParser = require("../../src/rules/RulesParser.js");
const path = require("path");
const common = require("../../src/lib/common.js");

describe("Test the Rules Parser", () => {
    const rulesFile = path.join(common.appPath, "/test/resources/rulesparser/sample.json");
    const outputdir = path.join(common.appPath, "reports");
    // TODO Initialize when bugs are fixed for exludedDirs
    const excludeDirs = "";
    it("Validate the rules in the given array", () => {
        const target = {localdir :  path.join(common.appPath, "/test/resources/"),
            gitUrl : "https://github.com/intuit/saloon"};

        const rp = new RulesParser(target, rulesFile, outputdir, excludeDirs);

        // TODO write a more controlled rules.json so results can be scrutinized
        // TODO Timeout might need to be added when we add more data in the test resources folder.
        return rp.parse().then(results => {
            expect(results).to.have.lengthOf.above(0);
        });
    });
});

/**
 * Test the sample rules file - yes, the purpose of this is different from
 * the purpose of the tests agains the rules parser. This one tests that any
 * changes in the sample file is still parseable and valid with our Rules Parser,
 * whereas the rules parser tests validate that any changes to the rules parser
 * dont break our test rules. There was a brief consideration of only testing the
 * samples, but that doesnt make sense as we need to do robust ruleparser testing
 * going forward
 */
describe("Test the sample rules", () => {
    const rulesFile = path.join(common.appPath, "test/resources/rulesparser/sample.json");
    const outputdir = path.join(common.appPath, "reports");
    const excludeDirs = "";
    it("validate that rules in the sample pass through rulesparser fine", () => {
        const target = {localdir :  path.join(common.appPath, "/test/resources/"),
            gitUrl : "https://github.com/intuit/saloon"};

        const rp = new RulesParser(target, rulesFile, outputdir, excludeDirs);
        return rp.parse().then(results => {
            expect(results).to.have.lengthOf.above(0);
        });
    });
});