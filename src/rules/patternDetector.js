"use strict";
const fs = require("fs");
const ioUtils = require("../lib/ioUtils");
const appRoot = require("app-root-path");
const script = appRoot.path + "/deps/py/pattern_matcher.py";
const patternMatcherResults =
  appRoot.path + "/deps/py/pattern-matcher-results.json";
const ruleType = "FMNCP";
const exec = require("child_process").exec;

let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

/**
 * Runs python script to find pattern matches.
 * @param {*} repo
 * @returns {Promise}
 */
function runPy(repo, rules, excludeDirs) {
    return new Promise(resolve => {
        try {
            exec("python " + script + " -i " + rules + " -d " + repo + " -o " + patternMatcherResults +
          " -k " + ruleType + " -e " + excludeDirs,
            { stdio: "inherit" },
            (error, stderr) => {
                if (error) {
                    log.error(stderr);
                    resolve(false);
                }
                resolve(true);
            }
            );
        } catch (ex) {
            log.error(ex);
            resolve(false);
        }
    });
}

/**
 * Processes results from python script output object.
 * @param {*} repo
 * @returns {Promise}
 */
function processPatterns(repo, rules, excludeDirs) {
    return new Promise((resolve, reject) => {
        runPy(repo, rules, excludeDirs)
            .then(response => {
                if (response) {
                    ioUtils.readFile(patternMatcherResults, true)
                        .then(function(res) {
                            try {
                                const obj = JSON.parse(res);
                                fs.unlinkSync(patternMatcherResults);
                                log.info("Pattern matcher Object created from python script");
                                return resolve(obj);
                            } catch (ex) {
                                log.error("****** " + ex);
                                return reject(ex);
                            }
                        });
                } else {
                    log.error("!!!!!!!!!Python script output was not generated correctly");
                    return reject("Python script output was not generated correctly");
                }
            });
    });
}

module.exports = {
    processPatterns: processPatterns
};