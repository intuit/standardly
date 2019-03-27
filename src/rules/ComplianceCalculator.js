"use strict";
const utils = require("../lib/utils");
let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

/**
 * The compliance calculator
 */
class ComplianceCalculator {

    constructor(evaluationResults) {
        this.evaluationResults = evaluationResults;
        this.passed = 0;
        this.failed = 0;
        this.error = 0;
        this.total = 0;
    }

    /**
     * Calculates compliance statistics (how many rules are passed and failed, and couldn't be evaluated (error))
     */
    calculateComplianceStatistics() {
        this.total = this.evaluationResults.length;
        this.countPassFailRules();
        this.error = this.total - this.passed - this.failed;
    }

    /**
     * Calculates the percentage out of total
     * @param {*} value
     */
    calculatePercentage(value) {
        if (this.total === 0) {
            return 0;
        }
        return parseFloat(Number((value * 100) / this.total).toFixed(2));
    }

    /**
     * Counts passed and failed rules
     */
    countPassFailRules() {
        this.evaluationResults.forEach((result) => {
            if (result.result.toLowerCase() === "pass") {
                ++this.passed;
            } else if (result.result.toLowerCase() === "fail") {
                ++this.failed;
            }
        });
    }

    /**
     * Formats the compliance summary into (#Passed --> <#Passed> (<#Passed in percentage>))
     * @param {*} label
     * @param {*} count
     * @param {*} percentage
     */
    formatComplianceSummary(label, count, percentage) {
        let csvData = label + " --> ";
        return csvData.concat(count)
            .concat(" (")
            .concat(percentage)
            .concat("%)\n");
    }

    /**
     * Gets the compliance summary in CSV format
     */
    getComplianceSummary() {
        return new Promise(resolve => {
            utils.convertJsonToCsv(this.getHeaderFields(), this.evaluationResults).then((csvData) => {
                resolve(csvData.concat(this.getRuleComplianceStatisticsInCSV()));
            }).catch(exception => {
                log.error(exception);
                return resolve([]);
            });
        });
    }

    /**
     * Returns list of fields as headers for summay section in resuts.csv
     */
    getHeaderFields() {
        let fields = Object.getOwnPropertyNames(this.evaluationResults[0]);
        fields = fields.filter(function(item) {
            return item != "detail"; // Details are shown below the statistics section
        });
        return fields;
    }

    /**
     * Converts the compliance statistics into csv
     */
    getRuleComplianceStatisticsInCSV() {
        let csvData = "\n\n";
        this.calculateComplianceStatistics();
        return csvData.concat(this.formatComplianceSummary("#Passed", this.passed, this.calculatePercentage(this.passed)))
            .concat(this.formatComplianceSummary("#Failed", this.failed, this.calculatePercentage(this.failed)))
            .concat(this.formatComplianceSummary("#Error", this.error, this.calculatePercentage(this.error)));
    }
}

module.exports = ComplianceCalculator;