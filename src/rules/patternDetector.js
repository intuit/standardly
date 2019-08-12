"use strict";
const fs = require("fs");
const ruleType = "FMNCP";
let logger = require("bunyan");
let log = logger.createLogger({ name: "standardly" });

/**
 * Performs a recursive walk of all directories inside this directory path
 * and returns a list of all the files in the directory.
 *
 * @param {String} directoryPath
 */
function walk(directoryPath) {
    // TODO: have a recursive check to prevent stack overflow.
    let results = [];
    let list = fs.readdirSync(directoryPath);
    list.forEach((file) => {
        file = directoryPath + "/" + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results.push(...walk(file));
        } else {
            results.push(fs.realpathSync(file));
        }
    });
    return results;
}

/**
 * Finds all the matches for each file in the directory path inputted.
 *
 * @param {String} directoryPath
 * @param {Array} ruleSet
 * @param {Array} output
 * @param {Array[String]} excludeDirs
 */
function findAllMatches(directoryPath, ruleSet, output, excludeDirs, callback) {
    let files = walk(directoryPath);
    files.forEach((file) => {
        let exclude = false;
        excludeDirs.forEach((d) => {
            if ((file.includes("/") && (file.toUpperCase().split("/").includes(d.toUpperCase()))) || d.toUpperCase() == file.toUpperCase()) {
                exclude = true;
                return;
            }
        });
        if (exclude) {
            return;
        }

        let fileData = fs.readFileSync(file).toString().split("\n");
        for (var i = 0; i < fileData.length; i++) {
            output = matchPatterns(i, fileData[i], file, ruleSet, output);
        }
    });
    callback(output);
}

/**
 * Searches for regex patterns for the text (specific row of a file) selected.
 *
 * @param {int} row
 * @param {String} text
 * @param {String} filename
 * @param {Array} ruleSet
 * @param {Array} output
 * @param {Array} excludeDirs
 *
 * @returns {Array} output with list of new patterns found concatenated on it
 */
function matchPatterns(row, text, filename, ruleSet, output) {
    ruleSet.forEach((p) => {
        // Skips if filename is listed in excludeDirs for that specific pattern.
        let exclude = false;
        if ("excludeDirs" in p) {
            p["excludeDirs"].forEach((d) => {
                if ((filename.includes("/") && (filename.toUpperCase().split("/").includes(d.toUpperCase()))) || d.toUpperCase() == filename.toUpperCase()) {
                    exclude = true;
                    return;
                }
            });
            if (exclude) {
                return;
            }
        }

        // Regex matching - allows for multiple matching within the same line.
        let regex = ((p["flags"]["ignoreCase"] == "True") ? new RegExp(p["pattern"], "gi") : new RegExp(p["pattern"], "g"));
        let failureType = p["failureType"];

        let match = regex.exec(text);
        while (match) {
            let col = match.index;
            output.push({
                "fileName": filename,
                "pattern": regex.toString(),
                "line": (row + 1).toString(),
                "col": (col + 1).toString(),
                "evaluationStatus": failureType,
                "patternType": p["patternType"],
                "description": p["description"],
                "evaluationMessage": "Pattern " + regex.toString() + " found.",
                "ruleID": p["ruleID"]
            });

            match = regex.exec(text);
        }
    });

    return output;
}

/**
  * Finds patterns
  *
  * @param {*} repo                 Repo to scan for patterns
  * @param {*} ruleSet              Rules file to use to scan
  * @param {*} excludeInput         Files/directories to exclude
  * @returns {Promise}
  */
function processPatterns(repo, ruleSet, excludeInput) {
    return new Promise((resolve, reject) => {
        try {
            if (!repo) {
                return reject(new Error("Please provide code directory path where patterns have to be found."));
            } else if (!fs.existsSync(repo)) {
                return reject(new Error("Path " + repo + " for repo to scan not found."));
            }

            let excludeDirs = [];
            if (excludeInput) {
                excludeDirs = (excludeInput.includes(",")) ? excludeInput.split(",") : [excludeInput];
            }

            let output = [];

            // Load rules/patterns list
            if (!ruleSet) {
                output.push({"evaluationStatus": "Pass",
                    "evaluationMessage": "No key found for rule type " + ruleType + " patterns in rule set."});
                log.info("Reporting from FMNCP resolving results");
                return resolve(output);
            }

            // Find all patterns
            findAllMatches(repo, ruleSet, output, excludeDirs, (output) => {
                if (output.length == 0) {
                    output.push({"evaluationStatus": "Pass",
                        "evaluationMessage": "No matches found for rule type " + ruleType + "."});
                }
                log.info("Reporting from FMNCP resolving results");
                return resolve(output);
            });
        } catch (ex) {
            return reject(new Error("ERROR WITH FINDING PATTERNS: " + ex));
        }
    });
}

module.exports = {
    processPatterns: processPatterns
};