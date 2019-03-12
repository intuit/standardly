"use strict";
const chai = require("chai");
const expect = chai.expect;
const TestletFactory = require("../src/rules/TestletFactory.js");
const TestLib = require("./TestLib.js");
const appPath = require("../src/lib/common.js").appPath;
const rulesJson = appPath + "/test/resources/unknownrt/rulesUNK.json";

describe("Test handling of unknown ruletype", function() {
    it("Base Testlet class to return an array of dummy promise ", function() {
        const target = {localdir : appPath + "/test/resources/unknownrt"};
        const ruleSet = TestLib.getRulesSet(rulesJson, "UNK");
        const unkTestlet = TestletFactory.createTestlet(target, "UNK", ruleSet);
        const promises = unkTestlet.evaluate();

        return Promise.all(promises).then(response => {
            response.forEach(res => {
                expect(res).to.exist;
                expect(res).to.be.empty;
            });
        });
    });
});