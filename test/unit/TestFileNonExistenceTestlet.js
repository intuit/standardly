"use strict";
const chai = require("chai");
const expect = chai.expect;
const FileNonExistenceTestlet = require("../../src/rules/FileNonExistenceTestlet.js");
const TestLib = require("../resources/TestLib.js");
const appRoot = require("app-root-path");
const rulesJson =appRoot.path + "/test/resources/filenonexistence/rulesFMNE.json";

describe("Test File non existence Testlet", function() {
    it("Must have matches for .LOG and .DMG files", function() {
        const target = {localdir :  appRoot.path + "/test/resources/filenonexistence"};
        const ruleSet = TestLib.getRulesSet(rulesJson, "FMNE");
        const fileNonExistenceTestlet = new FileNonExistenceTestlet(target, ruleSet);
        const promises = fileNonExistenceTestlet.evaluate();

        return Promise.all(promises).then(response => {
            expect(response).to.have.length.above(1);
            response.forEach(res => {
                expect(res).to.exist;
                expect(res).to.be.not.empty;
                if (res.message.includes(".LOG")||res.message.includes(".DMG")) {
                    expect(res.result).to.be.eql("Fail");
                }
            });
        });
    });
});