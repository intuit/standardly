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
                promises.push(this.validatePatternExists(rule, fileDict, fileName, exclude, this.target.localdir));
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
    validatePatternExists(rule, fileDict, fileName, excludeDirs, localdir) {
        let vResult;
        return new Promise(resolve => {
            dirWrapper
                .validateNonEmptyFileExists(fileName, fileDict, excludeDirs, "", localdir)
                .then(response => {
                    if (response) {
                        // TODO: To be updated to check pattern ex. "Copyright" in each file, taking first one for now
                        // TODO: Each file that is non empty should be checked for pattern.
                        let filePath = fileDict[fileName][0];
                        ioUtils.readFile(filePath)
                            .then(data => {
                                let regex = rule.pattern;
                                let lines = data.toString().split("\n").filter(element => {
                                    if (element) {
                                        return element;
                                    }
                                });
                                let found;
                                for (let i = 0; i < lines.length && !(found); i++) {
                                    found = lines[i].trim().match(regex);
                                }

                                const message = rule.description + (found ? " found in " : " not found in ") + fileName + " file : " + filePath;
                                const result = found ? ResultEnum.PASS : ResultEnum.FAIL;
                                vResult = new EvaluationResult(rule.ruleID, result, message);
                                resolve(vResult);
                            })
                            .catch(exception => {
                                vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, "Error evalutaing rule ", JSON.stringify(exception));
                                resolve(vResult);
                            });
                    } else {
                        vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, fileName + " file not found; so rule could not be evaluated.");
                        resolve(vResult);
                    }
                }).catch(exception => {
                    vResult = new EvaluationResult(rule.ruleID, ResultEnum.ERROR, "Error evalutaing rule ", JSON.stringify(exception));
                    resolve(vResult);
                });
        });
    }
}

module.exports = PatternExistenceTestlet;