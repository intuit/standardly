"use strict";

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
   * All exceptions must be handled in
   */
    evaluate() {
        throw new Error("Unable to evaluate - unknown evaluation");
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