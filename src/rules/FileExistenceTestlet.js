"use strict";
const Testlet = require("./Testlet.js");
const dirWrapper = require("../lib/localDirWrapper.js");
const EvaluationResult = require("./EvaluationResult.js");
const ResultEnum = EvaluationResult.ResultEnum;

class FileExistenceTestlet extends Testlet {
    /**
   * Creates the FileExistenceTestlet
   * @param {*} target - the target object, for example a directory where this rule is executed
   * @param {*} ruleSet
   * @param {*} ruleJson
   * @param {*} excludeDirs
   */
    constructor(target, ruleSet, ruleJson, excludeDirs) {
        super(target, "FME", ruleSet, ruleJson, "", excludeDirs);
    }

    /**
   * Evaluates the ruleSet
   * Returns an array of promises that resolve to a TestletOutput object
   */
    evaluate() {
        let promises = [];
        let fileDict = dirWrapper.getDicts(this.target.localdir, false)[0];
        this.ruleSet.forEach(rule => {
            let exclude = [];
            if (this.excludeDirs){
                exclude.concat(this.excludeDirs);
            }
            if("excludeDirs" in Object.keys(rule) && rule.excludeDirs){
                exclude.concat(rule.excludeDirs);
            }
            promises.push(this.validateNonEmptyFileExists(rule, fileDict, exclude, this.target.localdir));
        });
        return promises;
    }

    validateNonEmptyFileExists(rule, fileDict, excludeDirs, localdir) {
        let vResult;
        return new Promise(resolve => {
            let location = "location" in Object.keys(rule) ? rule.location : "";
            dirWrapper.validateNonEmptyFileExists(rule.fileName, fileDict, excludeDirs, location, localdir)
                .then(exists => {
                    const message = (exists ? "Found " : "Not found ") + "non-zero length " +
            rule.fileName + " in " +
            (this.target.giturl ? this.target.giturl : this.target.localdir);
                    const result = exists ? ResultEnum.PASS : ResultEnum.FAIL;
                    vResult = new EvaluationResult(rule.ruleID, result, message);
                    resolve(vResult);
                }).catch(exception => {
                    vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, "Error evaluating rule ", JSON.stringify(exception));
                    resolve(vResult);
                });
        });
    }
}

module.exports = FileExistenceTestlet;