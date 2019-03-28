"use strict";
const log = require("../lib/common.js").log;
/**
 * A Testlet evaluates a set of one or more rules of a particular type and captures the results of the evaluation.
 */
class Testlet {
    constructor(target, ruleType, ruleSet, ruleFileName, gitUrl, excludeDirs) {
        this.target = target;
        this.ruleType = ruleType;
        this.ruleSet = ruleSet;
        this.ruleFileName = ruleFileName;
        this.results = [];
        this.gitUrl = gitUrl;
        this.excludeDirs = excludeDirs;
    }

    /**
     * The individual Testlets must implement this method
     * The method must return an array of promises and must never throw any exception
     * All exceptions must be handled in the method
     */
    evaluate() {
        log.warn("Ignoring rule type " + this.ruleType);
        const promise = new Promise(resolve => {
            resolve([]);
        });
          return [promise];
    }

    /**
     * Gets the results of evaluation of this testlet
     */
    getEvaluationResults() {
        let results = [];
        return results;
    }
}

module.exports = Testlet;