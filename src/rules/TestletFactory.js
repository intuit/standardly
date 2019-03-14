"use strict";
const FileExistenceTestlet = require("./FileExistenceTestlet");
const FileNonExistenceTestlet = require("./FileNonExistenceTestlet");
const PatternNonExistenceTestlet = require("./PatternNonExistenceTestlet");
const PatternExistenceTestlet = require("./PatternExistenceTestlet");
const Testlet = require("./Testlet.js");
const log = require("../lib/common.js").log;

const RuleTypeEnum = {
    FME: "FME",
    FMNE: "FMNE",
    FMCP: "FMCP",
    FMNCP: "FMNCP",
    SECRETKEYS: "SECRETKEYS"
};

function createTestlet(target, ruleType, ruleset, rulesfile, excludeDirs) {
    if (ruleType == RuleTypeEnum.FME) {
        return new FileExistenceTestlet(target, ruleset, rulesfile, excludeDirs);
    } else if (ruleType == RuleTypeEnum.FMNE) {
        return new FileNonExistenceTestlet(target, ruleset, rulesfile, excludeDirs);
    } else if (ruleType == RuleTypeEnum.FMNCP) {
        return new PatternNonExistenceTestlet(target, ruleset, rulesfile, excludeDirs);
    } else if (ruleType == RuleTypeEnum.FMCP) {
        return new PatternExistenceTestlet(target, ruleset, rulesfile, excludeDirs);
    } else {
        log.warn("Unknown rule type " + ruleType + " will be ignored");
        return new Testlet(target, null, ruleset, rulesfile, excludeDirs);
    }
}

module.exports = {
    createTestlet: createTestlet,
    RuleTypeEnum: RuleTypeEnum
};