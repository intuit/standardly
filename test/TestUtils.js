"use strict";
const chai = require("chai");
const expect = chai.expect;
const utils = require("../src/lib/utils.js");

describe("jsonToCsv", function() {
    it("Json must convert to csv", () => {
        const fields = ["status", "% compliance"];
        const data = [{ "status": "Pass", "% compliance": 30 }, { "status": "Fail", "% compliance": 50 }, { "status": "Unknown", "% compliance": 20 }];
        return utils.convertJsonToCsv(fields, data)
            .then((csvData) => {
                expect(csvData).to.exist;
                expect(csvData).to.be.not.empty;
                // TODO check the content of csv
            });
    });

});