"use strict";
const chai = require("chai");
const expect = chai.expect;
const fswrapper = require("../src/lib/localDirWrapper.js");

describe("Test file Dictionary", function() {
    it("file dict must include this file", () => {
        let files = fswrapper.getDicts(".", true)[0];
        expect(files["TESTLOCALDIRWRAPPER"]).to.exist;
    });
    it("file dict must work in dirs with symlink", () => {
        let files = fswrapper.getDicts(".", true)[0];
        expect(files["FILE1"]).to.exist;
        expect(files["FILE2"]).to.exist;
        expect(files["FILE3-LINK"]).to.not.exist;
    });
});