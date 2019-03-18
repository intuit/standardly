"use strict";
const chai = require("chai");
const expect = chai.expect;
const iou = require("../src/lib/ioUtils.js");
const assertArrays = require("chai-arrays");
chai.use(assertArrays);

describe("Test File Exists", function() {
    it("LICENSE.md must exist", () => {
        return iou.checkFileExists(".", "LICENSE.md")
            .then((response) => {
                expect(response).to.be.eql(true);
            });
    });

});

describe("Test exclude dir is considered", ()=> {
    it("All files must be returned as none in excluded dir", ()=> {
        let res = iou.checkExcludedDir(["fruit/apple", "pine", "pineapple"], ["tree"]);
        expect(res).to.have.length(3);
    });
    it("No files must be be returned as all in excluded dir", ()=> {
        let res = iou.checkExcludedDir(["edible/fruit/tree/apple", "edible/fruit/bush/pineapple", "edible/fruit/pine"], ["FRUIT", "PINE"]);
        expect(res).to.be.an.array().that.is.empty;
    });
    it("Some files must be returned that are not in excluded dir", ()=> {
        let res = iou.checkExcludedDir(["edible/fruit/tree/apple", "edible/fruit/bush/pineapple", "edible/fruit/pine"], ["PINE"]);
        expect(res).to.be.have.length(2);
    });
    it("file without dir name should not match", ()=> {
        let res = iou.checkExcludedDir(["pine"], ["FRUIT", "PINE"]);
        expect(res).to.be.have.length(1);
    });

});