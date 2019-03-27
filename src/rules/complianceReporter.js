"use strict";
const ioutil = require("../lib/ioUtils");
const EvaluationResult = require("./EvaluationResult");
const ComplianceCalculator = require("./ComplianceCalculator");
const detailFields = "ruleID,error,detail\n";


function reportCompliance(finalResults, resultsfile) {
    return new Promise(resolve => {
        let finalResultsString = "";
        finalResults.forEach(result => {
            finalResultsString += serializeEvaluationResults(result);
        });
        if (finalResults.length > 0) {
            new ComplianceCalculator(finalResults).getComplianceSummary()
                .then(statistics => {
                    ioutil.writeFile(resultsfile, statistics + "\n\n" + detailFields + finalResultsString)
                        .then((result)=>{
                            resolve(result);
                        });
                });
        } else {
            return resolve(false);
        }
    });
}

/**
   * Serializes rule evaulation results
   * @param {*} result
   */
function serializeEvaluationResults(result) {
    let str = "";
    if(result instanceof EvaluationResult) {
        str += result.getAsString() + "\n";
    } else if (result instanceof Array) {
        result.forEach(evaluationResult => {
            str += evaluationResult.getAsString();
        });
    }
    return str;
}
module.exports = {
    reportCompliance : reportCompliance
};