"use strict";
const chai = require("chai");
const expect = chai.expect;
const iou = require("../src/lib/ioUtils.js");

describe("Test File Exists", function() {
    it("LICENSE.md must exist", () => {
        return iou.checkFileExists(".", "LICENSE.md")
            .then((response) => {
                expect(response).to.be.eql(true);
            });
    });

});

describe("Test exclude dir is considered", ()=> {
    it("Files must not be in excluded dir", ()=> {
        let res = iou.checkExcludedDir(["fruit/apple", "pine", "pineapple"], ["tree"]);
        expect(res).to.be.eql(false);
    });
    it("All files must be in excluded dir", ()=> {
        let res = iou.checkExcludedDir(["edible/fruit/tree/apple", "edible/fruit/bush/pineapple", "pine"], ["FRUIT", "PINE"]);
        expect(res).to.be.eql(true);
    });
    it("file without dir name should not match", ()=> {
        let res = iou.checkExcludedDir(["pine"], ["FRUIT", "PINE"]);
        expect(res).to.be.eql(false);
    });

});