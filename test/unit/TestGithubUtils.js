const chai = require("chai");
const expect = chai.expect;
const gitHubUtils = require("../../src/lib/gitHubUtils.js");
const path = require("path");
const shelljs = require("shelljs");
const common = require("../../src/lib/common");
const appPath = common.appPath;
const tmpDir = path.join(appPath, "/tmp");
const fse = require("fs-extra");

let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

describe("Test GitHubUtils Clone ", function() {
    it("Sucessfully clones a repo", () => { // skipping until we get a github service account.
        return fse.emptyDir(tmpDir).then(() => {
            gitHubUtils.cloneGitRepo("https://github.com/intuit/saloon.git", tmpDir)
                .then((response) => {
                    expect(response).to.be.not.empty;
                    expect(path.basename(response, ".git")).to.eql("saloon");
                })
                .finally(() => {
                    shelljs.rm("-rf", tmpDir);
                });
        });
    }).timeout(5000);

    it("Fails when repo url is not correct", () => {
        // Wait no longer than the timeout specified for the incorrect url clone to fail
        setTimeout(() => {log.info('Ending negative git url clone on timeout');}, 2000);
        return gitHubUtils.cloneGitRepo("https://github.com/intuit/saloon.gitXXX", tmpDir)
            .catch((response) => {
                expect(response).to.have.string("Error cloning repository");
            });
    }).timeout(2500);

});
