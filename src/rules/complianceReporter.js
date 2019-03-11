"use strict";
const ioutil = require("../lib/ioUtils");
const EvaluationResult = require("./EvaluationResult");
const ComplianceCalculator = require("./ComplianceCalculator");


function reportCompliance(finalResults, resultsfile) {
    return new Promise(resolve => {
        let finalResultsString = "";
        let fields = "";
        finalResults.forEach(result => {
            finalResultsString += serializeEvaluationResults(result);
            fields = getFieldsAsString(result);
        });
        if (finalResults.length > 0) {
            new ComplianceCalculator(finalResults).getComplianceSummary()
                .then(statistics => {
                    ioutil.writeFile(resultsfile, statistics + "\n\n" + fields + finalResultsString)
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

function getFieldsAsString(result) {
    if (result instanceof EvaluationResult) {
        return result.getFieldsAsString() + "\n";
    }
    return "ruleID,result,message,error,detail\n";
}

module.exports = {
    reportCompliance : reportCompliance
};