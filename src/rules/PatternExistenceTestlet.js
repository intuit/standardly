"use strict";
const Testlet = require("./Testlet.js");
const EvaluationResult = require("./EvaluationResult.js");
const dirWrapper = require("../lib/localDirWrapper.js");
const ioUtils = require("../lib/ioUtils");
const ResultEnum = EvaluationResult.ResultEnum;
const log = require("../lib/common.js").log;

class PatternExistenceTestlet extends Testlet {
    /**
   * Creates the PatternNonExistenceTestlet
   * @param {*} target - the target object, for example a directory where this rule is executed
   * @param {*} ruleSet
   * @param {*} ruleFileName
   */
    constructor(target, ruleSet, ruleFileName, excludeDirs) {
        super(target, "FMCP", ruleSet, ruleFileName, "", excludeDirs);
    }

    /**
   * Evaluates the ruleSet
   * Returns an array of promises that resolve to a TestletOutput object
   */
    evaluate() {
        let promises = [];
        let fileDict = dirWrapper.getDicts(this.target.localdir, false)[0];
        this.ruleSet.forEach(rule => {
            let files = rule.fileNames;
            let exclude = (this.excludeDirs ? rule.excludeDirs.concat(this.excludeDirs) : rule.excludeDirs);
            files.forEach(fileName => {
                promises.push(this.validatePatternExists(rule, fileDict, fileName, exclude));
            });
        });
        log.info("Reporting from " + this.ruleType + " resolving results");
        return promises;
    }

    /**
   * Evaluates if patterns exist for different ruleID's
   * @param {*} rule
   * @param {*} fileDict
   * @param {*} fileName
   *  @param {*} excludeDirs
   * @returns {Promise}
   */
    validatePatternExists(rule, fileDict, fileName, excludeDirs) {
        let vResult;
        let regex = rule.pattern;
        return new Promise(resolve => {
            let exists = (fileName in fileDict);
            if (exists) {
                let files = fileDict[fileName];
                if (excludeDirs) {
                    files = ioUtils.getUnexcludedDirs(files, excludeDirs);
                }
                if (!files) {
                    vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, fileName + " file not found; so rule could not be evaluated.");
                    return resolve(vResult);
                } else {
                    let patternPromises = [];
                    files.forEach(filePath => {
                        patternPromises.push(this.checkFilePattern(rule, fileName, filePath, regex));
                    });
                    Promise.all(patternPromises).then(res => {
                        let patternExists = res.map(obj => obj.found).every(function(el) {
                            return el !== null;
                        });
                        let details = [];
                        res.forEach(obj => {
                            details.push({detail : obj.detail});
                        });
                        const result = patternExists ? ResultEnum.PASS : ResultEnum.FAIL;
                        const message = patternExists ? rule.description + " found in " + fileName + " file. Check detail." : rule.description + " not found in at least one " + fileName + " file. Check detail.";
                        vResult = new EvaluationResult(rule.ruleID, result, message, "", details);
                        resolve(vResult);
                    });
                }
            } else {
                vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, fileName + " file not found; so rule could not be evaluated.");
                resolve(vResult);
            }
        });
    }

    /**
     * Checks if given regex pattern exists in a given file
     * @param {*} rule
     * @param {*} fileName
     * @param {*} filePath
     * @param {*} regex
     * @returns {Promise}
     */
    checkFilePattern(rule, fileName, filePath, regex) {
        return new Promise(resolve => {
            let found;
            let detail;
            ioUtils.readFile(filePath).then(data => {
                let lines = data.toString().split("\n").filter(element => {
                    if (element) {
                        return element;
                    }
                });
                for (let i = 0; i < lines.length && !(found); i++) {
                    found = lines[i].trim().match(regex);
                }
                detail = rule.description + (found ? " found in " : " not found in ") + fileName + " file : " + filePath;
                let result = {found : found, detail: detail};
                resolve(result);
            }).catch(exception => {
                const detail = "Error evalutaing rule " + JSON.stringify(exception);
                let result = {found: false, detail: detail};
                resolve(result);
            });
        });
    }
}


module.exports = PatternExistenceTestlet;