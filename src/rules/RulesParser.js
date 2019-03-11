"use strict";
const TestletFactory = require("./TestletFactory.js");
const common = require("../lib/common.js");
const ioutils = require("../lib/ioUtils.js");
const log = common.log;

/**
 * The parser that reads through the rules.json and creates testlets
 */
class RulesParser {
    constructor(target, rulesfile, excludeDirs) {
        this.target = target;
        this.rulesfile = rulesfile;
        this.testlets = [];
        this.excludeDirs = excludeDirs;
    }

    parse() {
    // TODO surround with outer try/catch?
        return new Promise(resolve => {
            ioutils.readFile(this.rulesfile)
                .then((data) => {
                    const ruleSets = JSON.parse(data);
                    log.info("Read the rulesets - found " + ruleSets.length + " of them!");
                    let evalPromises = [];
                    ruleSets.forEach(ruleSet => {
                        let ruleType = Object.keys(ruleSet);
                        log.info("parsing " + ruleType);
                        let testlet = TestletFactory.createTestlet(
                            this.target,
                            ruleType,
                            ruleSet[ruleType],
                            this.rulesfile,
                            this.excludeDirs
                        );
                        let temp = testlet.evaluate();
                        evalPromises = evalPromises.concat(temp);
                    });
                    let finalResults = [];
                    return Promise.all(evalPromises)
                        .then(evalResults => {
                            log.info("Inspecting results - received " + evalResults.length + " of them");
                            evalResults.forEach(result => {
                                finalResults = finalResults.concat(result);
                            });
                            return resolve(finalResults);
                        }).catch(exception => {
                            log.error(JSON.stringify(exception));
                            return resolve([]);
                        });
                }).catch(exception => {
                    log.error(JSON.stringify(exception));
                    return resolve([]);
                });
        });
    }
}

module.exports = RulesParser;