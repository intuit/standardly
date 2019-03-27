"use strict";
const Testlet = require("./Testlet.js");
const gitDetectWrapper = require("./gitDetectWrapper.js");
const EvaluationResult = require("./EvaluationResult.js");
const yaml = require("js-yaml");
const appRoot = require("app-root-path");
const gitDetectResults = appRoot.path + "/reports/defectReport.yaml";
const ResultEnum = EvaluationResult.ResultEnum;
const log = require("../lib/common.js").log;

class SecretKeysNonExistenceTestlet extends Testlet {
    /**
     * Creates the FileExistenceTestlet
     * @param {*} target - the target object, for example a directory where this rule is executed
     * @param {*} ruleSet
     * @param {*} ruleJson
     */
    constructor(gitUrl, ruleSet) {
        super("", "SECRETKEYS", ruleSet, "", gitUrl);
    }

    /**
     * Evaluates the ruleSet
     * Returns an array of promises that resolve to a TestletOutput object
     */
    evaluate() {
        let promises = [];
        let gitToken = process.env.gitToken;
        this.ruleSet.forEach(rule => {
            promises.push(this.validateDefectsFile(rule, this.target.giturl, gitToken));
        });
        return promises;
    }

    /**
     * Validates the defects file from the secrets scan
     * @param {*} rule
     * @param {*} repoUrl
     * @param {*} gitToken
     */
    validateDefectsFile(rule, repoUrl, gitToken) {
        return new Promise(resolve => {
            let vResult = [];

            if (!repoUrl || !gitToken) {
                vResult = new EvaluationResult(
                    rule.ruleID,
                    ResultEnum.ERROR,
                    "Error finding secret keys",
                    JSON.stringify("Please check the github url and token provided.")
                );
                log.info("Reporting from " + this.ruleType + " no git info -  returning");
                return resolve(vResult);
            }

            let urlTokens = repoUrl.split("/").filter(token => {
                return token.trim() != "";
            });
            let repoOwner = urlTokens[urlTokens.length - 2];
            let repoName = urlTokens[urlTokens.length - 1];

            gitDetectWrapper
                .runGitDetect(repoOwner, repoName, gitToken)
                .then(data => {
                    if (data) {
                        let obj = yaml.load(data);
                        if (Object.keys(obj["repos"]).length === 0) {
                            vResult = new EvaluationResult(
                                rule.ruleID,
                                ResultEnum.PASS,
                                "Not found secret keys in " + repoUrl
                            );
                        } else {
                            vResult = new EvaluationResult(
                                rule.ruleID,
                                ResultEnum.FAIL,
                                "Found Secret keys in " +
                  this.target +
                  ". Please look at the report for details: " +
                  gitDetectResults
                            );
                        }
                        log.info("Reporting from " + this.ruleType + " resolving results");
                        resolve(vResult);
                    }
                })
                .catch(exception => {
                    vResult = new EvaluationResult(
                        rule.ruleID,
                        ResultEnum.ERROR,
                        "Error reading defect yaml",
                        JSON.stringify(exception)
                    );
                    log.info("Reporting from " + this.ruleType + " resolving errors");
                    resolve(vResult);
                });
        });
    }
}
module.exports = SecretKeysNonExistenceTestlet;