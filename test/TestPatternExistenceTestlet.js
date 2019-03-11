"use strict";
const chai = require("chai");
const expect = chai.expect;
const PatternExistenceTestlet = require("../src/rules/PatternExistenceTestlet.js");
const TestLib = require("./TestLib.js");
const appPath = require("../src/lib/common.js").appPath;
const rulesJson = appPath + "/test/resources/patternexistence/rulesFMCP.json";

describe("Test Pattern Existence Testlet", function() {
    it("Run Pattern Existence Testlet and Test Object", function() {
        const target = {localdir : appPath + "/test/resources/patternexistence"};
        const ruleSet = TestLib.getRulesSet(rulesJson, "FMCP");

        const patternExistenceTestlet = new PatternExistenceTestlet(target, ruleSet);
        const promises = patternExistenceTestlet.evaluate();

        return Promise.all(promises).then(response => {
            expect(response).to.have.length.above(1);
            response.forEach(res => {
                expect(res).to.exist;
                expect(res).to.be.not.empty;
                if (res.message.includes("LICENSE")) {
                    expect(res.result).to.be.eql("Pass");
                } else if (res.message.includes("README")) {
                    expect(res.result).to.be.eql("Fail");
                } else if (res.message.includes("DOESNOTEXIST")) {
                    expect(res.result).to.be.eql("Error");
                }
            });
        });
    });
});