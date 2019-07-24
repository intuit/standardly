"use strict";
const fs = require("fs");
const ioUtils = require("../lib/ioUtils");
const appRoot = require("app-root-path");
const outputResultsFile =
  appRoot.path + "/reports/pattern-matcher-results.json";
const ruleType = "FMNCP";
const logger = require("bunyan");
const log = logger.createLogger({ name: "standardly" });

function findPatterns(filesDirectory, inputPatternsFile, excludeInput) {
    return new Promise(resolve => {
        try {
            // Initial checks for valid inputs
            if (!inputPatternsFile) {
                log.error("Please provide input json file path that contains patterns to be found.");
                return resolve(false);
            } else if (!fs.existsSync(inputPatternsFile)) {
                log.error("Path " + inputPatternsFile + " of input rules json not found.");
                return resolve(false);
            }

            if (!filesDirectory) {
                log.error("Please provide code directory path where patterns have to be found.");
                return resolve(false);
            } else if (!fs.existsSync(filesDirectory)) {
                log.error("Path " + filesDirectory + " of input rules json not found.");
                return resolve(false);
            }

            let excludeDirs = [];
            if (excludeInput) {
                excludeDirs = (excludeInput.includes(",")) ? excludeInput.split(",") : [excludeInput];
            }

            let output = [];

            // Load rules/patterns list
            let inputPatterns = loadRuleJSON(inputPatternsFile, ruleType);
            if (!inputPatterns) {
                output.push({"evaluationStatus": "Pass",
                    "evaluationMessage": "No key found for rule type " + ruleType + " patterns in input rules file."});
                fs.writeFileSync(outputResultsFile, JSON.stringify(output));
                return resolve(true);
            }

            // Find all patterns
            findAllMatches(filesDirectory, inputPatterns, output, excludeDirs, (output) => {
                if (output.length == 0) {
                    output.push({"evaluationStatus": "Pass",
                        "evaluationMessage": "No matches found for rule type " + ruleType + "."});
                }

                // Write found patterns into output
                fs.writeFileSync(outputResultsFile, JSON.stringify(output));
                resolve(true);
            });
        } catch (ex) {
            log.error("ERROR WITH FINDING PATTERNS: " + ex);
            resolve(false);
        }
    });
}

/**
 * Loads the list of patterns from the input file and parses them, returning the
 * pattern if it matches the rule type and undefined if not.
 *
 * @param {[String, Buffer, URL]} inputFilepath
 * @param {String} ruleType
 *
 * @returns {Array} pattern list
 */
function loadRuleJSON(inputFilepath, ruleType) {
    let ruleData = fs.readFileSync(inputFilepath);
    let rules = JSON.parse(ruleData);

    // TODO: refactor the name found
    let found = rules.find((r) => ruleType in r);
    if (found) {
        return found[ruleType];
    }
    return found;
}

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
 * @param {Array} inputPatterns
 * @param {Array} output
 * @param {Array[String]} excludeDirs
 */
function findAllMatches(directoryPath, inputPatterns, output, excludeDirs, callback) {
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
            output = matchPatterns(i, fileData[i], file, inputPatterns, output);
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
 * @param {Array} inputPatterns
 * @param {Array} output
 * @param {Array} excludeDirs
 *
 * @returns {Array} output with list of new patterns found concatenated on it
 */
function matchPatterns(row, text, filename, inputPatterns, output) {
    inputPatterns.forEach((p) => {
        // Skips if filename is listed in excludeDirs for that specific pattern.
        // TODO: skip outside of this function for fewer calls.
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
 * Processes results from python script output object.
 *
 * @param {*} repo
 * @returns {Promise}
 */
function processPatterns(repo, inputPatternsFile, excludeDirs) {
    return new Promise((resolve, reject) => {
        findPatterns(repo, inputPatternsFile, excludeDirs)
            .then(response => {
                if (response) {
                    ioUtils.readFile(outputResultsFile, true)
                        .then(function(res) {
                            try {
                                const obj = JSON.parse(res);
                                fs.unlinkSync(outputResultsFile);
                                log.info("Pattern matcher Object created from python script");
                                return resolve(obj);
                            } catch (ex) {
                                log.error("****** " + ex);
                                return reject(ex);
                            }
                        });
                } else {
                    return reject(new Error("Pattern matching not generated correctly, check logs"));
                }
            });
    });
}

module.exports = {
    processPatterns: processPatterns
};