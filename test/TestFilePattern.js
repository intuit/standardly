"use strict";
const chai = require("chai");
const expect = chai.expect;
const ldw = require("../src/lib/localDirWrapper.js");

describe("Test File Pattern", function() {
    it("License.md must contain copyright", () => {
        return ldw.validateFilePatternExists(".", "LICENSE.md", "Copyright")
            .then((response) => {
                expect(response.result).to.be.eql("Pass");
            });
    });

});