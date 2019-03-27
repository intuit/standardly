"use strict";
const chai = require("chai");
const expect = chai.expect;
const PatternNonExistenceTestlet = require("../../src/rules/PatternNonExistenceTestlet.js");
const TestLib = require("../resources/TestLib.js");
const appRoot = require("app-root-path");
const rulesJson =appRoot.path + "/test/resources/patternnonexistence/rulesFMNCP.json";

describe("Test Pattern non existence Testlet", function() {
    it("Must have matches for email, phone and ssn", function() {
        const target = {localdir :  appRoot.path + "/test/resources/patternnonexistence"};
        const ruleSet = TestLib.getRulesSet(rulesJson, "FMNCP");
        const patternNonExistenceTestlet = new PatternNonExistenceTestlet(target, ruleSet, rulesJson);
        const promises = patternNonExistenceTestlet.evaluate();

        return promises.then(response => {
            expect(response).to.have.length.above(1);
            expect(response.filter(res => res.message.includes("internal term"))).length(2);
            expect(response.filter(res => res.message.includes("internal urls"))).length(2);
            response.forEach(res => {
                expect(res).to.exist;
                expect(res).to.be.not.empty;
                if (res.message.includes("email address")) {
                    expect(res.detail).length(4);
                } else if (res.message.includes("phone number")) {
                    expect(res.detail).length(2);
                } else if (res.message.includes("SSN")) {
                    expect(res.detail).length(2);
                } else if (res.message.includes("internal ip address")) {
                    expect(res.detail).length(8);
                }
            });
        });
    });
});