const path = require("path");
const shelljs = require("shelljs");
const common = require("../lib/common");
const appPath = common.appPath;

function cloneGitRepo(repository, workingDir) {
    return new Promise((resolve, reject) => {
        const branch = "master"; // TODO: make this an option - or at least read the default branch from git.
        shelljs.cd(workingDir);
        // repo clone will be for just the master branch, and only the last revision. tmp dir will get deleted on exit if empty
        if (shelljs.exec(`git clone -b ${branch} --single-branch --depth 1 ${repository}`, {"silent": false}).code !== 0) {
            reject("Error cloning repository");
        }
        shelljs.cd(appPath);
        const repoName = path.basename(repository, ".git");
        resolve(path.resolve(workingDir, repoName));
    });
}

module.exports = {
    cloneGitRepo: cloneGitRepo
};