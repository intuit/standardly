"use strict";
const path = require("path");
const ioUtils = require("./ioUtils");
const notfound = "404: Not Found";
const fs = require("fs");
let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

/**
 * Validates if the file exists
 * @param {*} dir
 * @param {*} filename
 */
function validateFileExists(dir, filename) {
    const filePath = getFullFileName(dir, filename);
    return new Promise((resolve, reject) => {
        ioUtils
            .readFile(filePath)
            .then(function(content) {
                if (!content) {
                    reject("File " + filename + " not found");
                }
                resolve(content);
            })
            .catch(function(err) {
                log.error(err);
                reject(err);
            });
    });
    // TODO if fileName starts with *, it should be validated recursively in the subfolders. e.g. */.DS_Store
}

/**
 * Gets a requested file for github
 * @param filename - the name of the file to retrieve
 * @param org - the org under which this file is
 * @param repo - the repo to retrieve from
 * @param branch - the branch to retrieve the file from, if null, "master" is assumed
 * @returns
 */
function validateFileNotExists(dir, filename) {
    const filePath = getFullFileName(dir, filename);
    return new Promise((resolve, reject) => {
        ioUtils
            .checkFileExists(filePath)
            .then(function(result) {
                if (result === false) {
                    resolve("ok");
                }
                reject("File " + filename + "  found");
            })
            .catch(function(err) {
                reject(err);
                log.error(err);
            });
    });

    // TODO if fileName starts with *, it should be validated recursively in the subfolders. e.g. */.DS_Store
}

/**
 * Gets a requested file for github
 * @param filename - the name of the file to retrieve
 * @param org - the org under which this file is
 * @param repo - the repo to retrieve from
 * @param branch - the branch to retrieve the file from, if null, "master" is assumed
 * @param expression - regular expression to check the pattern
 * @returns
 */
function validateFilePatternExists(dir, filename, ruleExpression) {
    const filePath = getFullFileName(dir, filename);
    return new Promise((resolve, reject) => {
        ioUtils
            .readFile(filePath)
            .then(content => {
                if (content.startsWith(notfound)) {
                    reject("File " + filename + " not found");
                }
                let expression = new RegExp(ruleExpression, "g");
                let check = {};
                if (content.match(expression)) {
                    check.result = "Pass";
                    check.error = "";
                } else {
                    check.result = "Fail";
                    check.error =
            "Did not find [" + ruleExpression + "] in file " + filename;
                }
                resolve(check);
            })
            .catch(err => {
                reject(err);
            });
    });
    // TODO if fileName starts with *, it should be validated recursively in the subfolders. e.g. */.DS_Store
}

/**
 * Get the full file name - dir and fileName concatenated
 * @param dir - the directory where file is expected to be
 * @param fileName - name of the file
 * @returns concatenated directory and fileName, adding path.sep if needed.
 */
function getFullFileName(dir, fileName) {
    dir = dir || ".";
    let fullFileName;

    if (dir.charAt(dir.length - 1) === path.sep) {
        fullFileName = dir + fileName;
    } else {
        fullFileName = dir + path.sep + fileName;
    }
    return fullFileName;
}

/**
 * Validates if the file exists and is not empty
 * @param {*} fileName
 * @param {*} fileDict
 * @param {*} excludeDirs
 * @returns true if non empty file found, false if not
 */
function validateNonEmptyFileExists(fileName, fileDict, excludeDirs, fileLocation, rootDir) {
    return ioUtils.checkNonEmptyFileExists(fileName, fileDict, excludeDirs, fileLocation, rootDir);
}

/**
 * Recursively finds all the files in a directory synchronously
 * @param {*} dir
 * @param {*} fileList
 * @param {*} includeDirs
 * @returns list of files
 */
function getfileListRecursive(dir, fileList, includeDirs) {
    let files = fs.readdirSync(dir);
    fileList = fileList || [];
    files.forEach(function(file) {
        let absFileName = path.join(dir, file);
        let stats = fs.lstatSync(absFileName);
        if (!stats.isSymbolicLink()) { // skip on symlinks
            if (stats.isDirectory()) {
                if (includeDirs) {
                    fileList.push(absFileName);
                }
                fileList = getfileListRecursive(absFileName, fileList, includeDirs);
            } else {
                fileList.push(absFileName);
            }
        }
    });
    return fileList;
}

/**
 * Returns an array of two dictionary objects with filename and extension as the key respectively
 * and the corresponding file path as the values
 * @param {*} dir
 * @param {*} includeDirs
 * @returns dictionary objects
 */
function getDicts(dir, includeDirs) {
    let fileList = getfileListRecursive(dir, [], includeDirs);
    let fileDict = {};
    let fileExtensionDict = {};
    fileList.forEach(filePath => {
        let fileName = path.basename(filePath);
        let index = fileName.indexOf(".");
        if (index > 0 && !fs.lstatSync(filePath).isDirectory()){
            let file = fileName.split(".")[0].toUpperCase();
            if (file in fileDict) {
                fileDict[file].push(filePath);
            } else {
                fileDict[file] = [filePath];
            }
            let fileExtension = fileName.substring(index).toUpperCase();
            if (fileExtension in fileExtensionDict) {
                fileExtensionDict[fileExtension].push(filePath);
            } else {
                fileExtensionDict[fileExtension] = [filePath];
            }
        } else {
            let file = fileName.toUpperCase();
            if (file in fileDict) {
                fileDict[file].push(filePath);
            } else {
                fileDict[file] = [filePath];
            }
        }
    });
    return [fileDict, fileExtensionDict];
}

module.exports = {
    validateNonEmptyFileExists: validateNonEmptyFileExists,
    validateFileExists: validateFileExists,
    validateFileNotExists: validateFileNotExists,
    validateFilePatternExists: validateFilePatternExists,
    getfileListRecursive: getfileListRecursive,
    getDicts: getDicts
};