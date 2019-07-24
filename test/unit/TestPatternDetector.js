const chai = require("chai");
const expect = chai.expect;
const patternDetector = require("../../src/rules/patternDetector.js");
const appRoot = require("app-root-path");
const rulesFile = appRoot.path + "/test/resources/patternnonexistence/rulesFMNCP.json";
const repo = appRoot.path + "/src/rules";

describe("Test Pattern Detector", function() {
    it("Run python script and test object", function() {
        // this.timeout(10000);
        return patternDetector.processPatterns(repo, rulesFile).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Run python script and test object", function() {
        // this.timeout(10000);
        return patternDetector.processPatterns(repo, appRoot.path + "/test/resources/rulesparser/sample.json").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Test undefined rules input file", function() {
        return patternDetector.processPatterns(repo, undefined).then(() => Promise.reject(new Error("Expected undefined input file to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Test incorrect rules input file", function() {
        return patternDetector.processPatterns(repo, appRoot.path + "/test/resources/nonexistentfile").then(() => Promise.reject(new Error("Expected incorrect input file to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Test undefined files directory", function() {
        return patternDetector.processPatterns(undefined, rulesFile).then(() => Promise.reject(new Error("Expected undefined directory input to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Test incorrect files directory", function() {
        return patternDetector.processPatterns(appRoot.path + "/src/nonexistentdirectory", rulesFile).then(() => Promise.reject(new Error("Expected undefined directory input to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
    it("Test loading file with no FMNCP rules", function() {
        return patternDetector.processPatterns(repo, appRoot.path + "/test/resources/patternexistence/rulesFMCP.json").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Testing files that should be excluded", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patterndetector/exclude/node_modules", rulesFile).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Testing files that should contain patterns", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patternnonexistence", rulesFile).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Testing single exclude", function() {
        return patternDetector.processPatterns(repo, rulesFile, "rules").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Testing multiple exclude (comma-separated)", function() {
        return patternDetector.processPatterns(appRoot.path + "/test/resources/patternnonexistence", rulesFile, "pii_test.txt,ip_addr_test.txt").then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
    it("Test pattern matching error from rules JSON", function() {
        return patternDetector.processPatterns(repo, appRoot.path + "/test/resources/patterndetector/incorrectRules.json").then(() => Promise.reject(new Error("Expected incorrect json format to result in reject.")),
            err => chai.assert.instanceOf(err, Error));
    });
});