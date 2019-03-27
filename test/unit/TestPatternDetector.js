const chai = require("chai");
const expect = chai.expect;
const patternDetector = require("../../src/rules/patternDetector.js");
const appRoot = require("app-root-path");
const rulesFile = appRoot.path + "/test/resources/patternnonexistence/rulesFMNCP.json";

describe("Test Pattern Detector", function() {
    it("Run python script and test object", function() {
        let repo = appRoot.path + "/src/rules";

        return patternDetector.processPatterns(repo, rulesFile).then(response => {
            expect(response).to.exist;
            expect(response).to.be.not.empty;
        });
    });
});