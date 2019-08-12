const chai = require("chai");
const expect = chai.expect;
const patternDetector = require("../../src/rules/patternDetector.js");
const appRoot = require("app-root-path");
const repo = appRoot.path + "/src/rules";
const TestLib = require("../resources/TestLib.js");
const rulesJson = appRoot.path + "/test/resources/patternnonexistence/rulesFMNCP.json";
const ruleSet = TestLib.getRulesSet(rulesJson, "FMNCP");

describe("Test Pattern Detector - JavaScript", function() {
    it("Test with rulesfile containing only FMNCP in directory with 0 matches", function() {
        return patternDetector.processPatterns(repo, ruleSet).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
            expect(response).to.have.lengthOf(1);
        });
    });
    it("Test undefined files directory", function() {
        return patternDetector.processPatterns(undefined, ruleSet).then(() => Promise.reject(new Error("Expected undefined directory input to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Test incorrect files directory", function() {
        return patternDetector.processPatterns(appRoot.path + "/src/nonexistentdirectory", ruleSet).then(() => Promise.reject(new Error("Expected incorrect files directory input to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Testing files that should be excluded", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patterndetector/testExclude", ruleSet).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
            expect(response).to.have.lengthOf(1);
        });
    });
    it("Testing files that should contain patterns", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patternnonexistence", ruleSet).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
            expect(response).to.have.lengthOf(19); // double check this
        });
    });
    it("Testing single exclude", function() {
        return patternDetector.processPatterns(repo, ruleSet, "rules").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
            expect(response).to.have.lengthOf(1);
        });
    });
    it("Testing multiple exclude (comma-separated)", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patternnonexistence", ruleSet, "pii_test.txt,ip_addr_test.txt").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
            expect(response).to.have.lengthOf(5);
        });
    });
});