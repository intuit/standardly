"use strict";
const Testlet = require("./Testlet.js");
const dirWrapper = require("../lib/localDirWrapper.js");
const EvaluationResult = require("./EvaluationResult.js");
const ioUtils = require("../lib/ioUtils.js");
const ResultEnum = EvaluationResult.ResultEnum;
const log = require("../lib/common.js").log;

class FileNonExistenceTestlet extends Testlet {
    /**
     * Creates the FileExistenceTestlet
     * @param {*} target - the target object, for example a directory where this rule is executed
     * @param {*} ruleSet
     * @param {*} ruleJson
     */
    constructor(target, ruleSet, ruleJson, excludeDirs) {
        super(target, "FMNE", ruleSet, ruleJson, "", excludeDirs);
    }

    /**
     * Evaluates the ruleSet
     * Returns an array of promises that resolve to a TestletOutput object
     */
    evaluate() {
        let promises = [];
        let dicts = dirWrapper.getDicts(this.target.localdir, true);
        let fileDict = dicts[0];
        let fileExtensionDict = dicts[1];
        this.ruleSet.forEach(rule => {
            rule.fileList.forEach(fileName =>{
                let exclude = (this.excludeDirs ? rule.excludeDirs.concat(this.excludeDirs) : rule.excludeDirs);
                if (fileName.charAt(0)==="*") {
                    promises.push(this.validateFileExists(rule, fileName.substr(1), fileExtensionDict, exclude));
                } else {
                    promises.push(this.validateFileExists(rule, fileName, fileDict, exclude));
                }
            });
        });
        log.info("Reporting from " + this.ruleType + " resolving results");
        return promises;
    }

    validateFileExists(rule, fileName, dict, excludeDirs) {
        let vResult;
        return new Promise(resolve => {
            try {
                let files = (fileName in dict) ? dict[fileName] : [];
                if (excludeDirs) {
                    files = ioUtils.checkExcludedDir(files, excludeDirs);
                }
                const message = (files.length > 0 ? "Found " : "Not found ") +
                    fileName + " file in " +
                    (this.target.giturl ? this.target.giturl : this.target.localdir);
                const result = files.length > 0 ? ResultEnum.FAIL : ResultEnum.PASS;
                const fileList = files.length > 0 ? " Found: " + files : "";
                vResult = new EvaluationResult(rule.ruleID, result, message + fileList);
                resolve(vResult);
            } catch(exception) {
                log.warn("From Testlet for " + this.ruleType + " error evaluating rule");
                vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, "Error evaluating rule ", JSON.stringify(exception));
                resolve(vResult);
            }
        });
    }

}

module.exports = FileNonExistenceTestlet;