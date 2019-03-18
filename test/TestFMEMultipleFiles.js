"use strict";
const chai = require("chai");
const assertArrays = require("chai-arrays");
chai.use(assertArrays);
const expect = chai.expect;
const appRoot = require("app-root-path");
const ioutils = require("../src/lib/ioUtils.js");
const dirWrapper = require("../src/lib/localDirWrapper.js");

const fileDict = dirWrapper.getDicts(appRoot.path, false)[0];

describe("Test multiple files for FME", function() {
    it("FME File dictionary must contain a list of files", () => {
        expect(fileDict["README"]).to.be.array();
        expect(fileDict["README"]).length.above(1);
    });

    it("Checking non empty file exits in a location", () => {
        return ioutils.checkNonEmptyFileExists("README", fileDict, "", "/", appRoot.path).then(res =>{
            expect(res).to.be.eql(true);
        });
    });

});