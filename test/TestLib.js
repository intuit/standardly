"use strict";

/**
 * Get the rules corresponding to a ruleType
 * @param rulesFile
 * @param ruleType
 * @returns {ruleSet}.
 */
function getRulesSet(rulesFile, ruleType) {
    let ruleSets = require(rulesFile);
    let ruleSet;
    for (let i = 0; i < ruleSets.length; i++) {
        if (Object.keys(ruleSets[i])[0] === ruleType) {
            ruleSet = ruleSets[i][ruleType];
            break;
        }
    }
    return ruleSet;
}

module.exports = {
    getRulesSet: getRulesSet
};