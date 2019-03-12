"use strict";

const appRoot = require("app-root-path");
// TODO, once gitdetect is available replace this definition - for now pointing script to a noop
//  script should be set to appRoot.path + "/deps/gitdetect/gitdetect";
const script = ":";
// TODO - move the above script config to a config file
const gitDetectConfig = appRoot.path + "/deps/gitdetect/gitdetect.conf.yaml";
const exec = require("child_process").exec;
const ioUtils = require("../lib/ioUtils");
const gitDetectResultsDir = appRoot.path + "/reports/";
const gitDetectOutputFile = "defectReport.yaml";

let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

/**
 * Runs git detect tool's executable to find secret keys.
 * @param {*} repoOwner
 * @param {*} repoName
 * @param {*} gitToken
 * @returns {Promise}
 */
function runGitDetect(repoOwner, repoName, gitToken) {
    return new Promise(resolve => {
        try {
            const cmd = script + " -access-token " + gitToken + " -config " + gitDetectConfig + " -output " +
            gitDetectResultsDir + " -repo-name " + repoOwner + "/" + repoName;
            exec(cmd, {stdio: "inherit"},
                (error, stderr) => {
                    if (error) {
                        log.error(stderr);
                        resolve(false);
                    }
                    ioUtils
                        .readFile(gitDetectResultsDir + gitDetectOutputFile)
                        .then(data => {
                            if (data) {
                                resolve(data);
                            } else {
                                resolve("[]");
                            }
                        });
                }
            );
        } catch (ex) {
            log.error(ex);
            resolve("[]");
        }
    });
}

module.exports = {
    runGitDetect: runGitDetect
};