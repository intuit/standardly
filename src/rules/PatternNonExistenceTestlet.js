"use strict";
const Testlet = require("./Testlet.js");
const patternDetector = require("./patternDetector.js");
const EvaluationResult = require("./EvaluationResult.js");
const ResultEnum = EvaluationResult.ResultEnum;
const log = require("../lib/common.js").log;

class PatternNonExistenceTestlet extends Testlet {

    /**
     * Creates the PatternNonExistenceTestlet
     * @param {*} target - the target object, for example a directory where this rule is executed
     * @param {*} ruleSet
     * @param {*} ruleFileName
     */
    constructor(target, ruleSet, ruleFileName, excludeDirs) {
        super(target, "FMNCP", ruleSet, ruleFileName, "", excludeDirs);
    }

    /**
     * Evaluates the ruleSet
     * Returns an array of promises that resolve to a TestletOutput object
     */
    evaluate() {
        return new Promise(resolve => {
            let patternResults = [];
            patternDetector.processPatterns(this.target.localdir, this.ruleFileName, this.excludeDirs)
                .then(obj => {
                    if ((Object.keys(obj).length === 1) && (obj[0]["evaluationStatus"] === "Pass")) {
                        const vResult = new EvaluationResult("", obj[0]["evaluationStatus"], obj[0]["evaluationMessage"] + " in " + this.target);
                        patternResults.push(vResult);
                    } else {
                        const ruleIDSet = new Set(this.ruleSet.map(value => value.ruleID));
                        patternResults = [];
                        ruleIDSet.forEach(ruleID => {
                            const result = this.validatePatternExists(obj, ruleID);
                            if (result) {
                                patternResults.push(result);
                            }
                        });
                    }
                    log.info("Reporting from " + this.ruleType + " resolving results " + patternResults);
                    return resolve(patternResults);
                }).catch(ex => {
                    const vResult = new EvaluationResult(this.ruleID, ResultEnum.ERROR, "Error evaluating rule ", JSON.stringify(ex));
                    patternResults.push(vResult);
                    return resolve(patternResults);
                });
        });
    }

    /**
     * Evaluates if patterns exist for different ruleID's
     * @param {*} jsonObj
     * @param {*} ruleID
     * @returns {Promise}
     */
    validatePatternExists(jsonObj, ruleID) {
        let vResult;
        try {
            let rules = jsonObj.filter(rule => rule.ruleID === ruleID);
            if (rules.length == 0) {
                vResult = new EvaluationResult(ruleID, ResultEnum.PASS, "No matches found for ruleID " + ruleID);
            } else {
                let details = [];
                rules.forEach(function(rule) {
                    details.push({
                        fileName: rule.fileName,
                        line: rule.line,
                        col: rule.col
                    });
                });
                vResult = new EvaluationResult(ruleID, ResultEnum.FAIL,
                    "Possible " + rules[0].description + " found", rules[0].evaluationStatus, details);
                return vResult;
            }
        } catch (exception) {
            log.warn("From Testlet for " + this.ruleType + " error evaluating rule");
            vResult = new EvaluationResult(ruleID, ResultEnum.ERROR, "Error evaluating rule ", JSON.stringify(exception));
            return vResult;
        }
    }
}

module.exports = PatternNonExistenceTestlet;