"use strict";
const fs = require("fs");

let logger = require("bunyan");
let log = logger.createLogger({ name: "std-gov-oos" });

/**
 * Promisified function to write to a file asynchronously
 * @param {*} filePath
 * @param {*} data
 * @returns {Promise}
 */
function writeFile(fileName, data) {
    return new Promise(function(resolve) {
        fs.writeFile(fileName, data, function(err) {
            if (err) {
                log.error(err);
                resolve(false);
            } else {
                log.info("Data is written to " + fileName);
                resolve(true);
            }
        });
    });
}

/**
 *
 * @param {*} filePath
 * @returns {Promise}
 */
function checkFileExists(filePath) {
    return new Promise(function(resolve) {
        if (!fs.existsSync(filePath)) {
            resolve(false);
        }
        resolve(true);
    });
}

/**
 *
 * @param {*} filePath - the path of the file to read.
 * @param defaultEncoding - true if no special encoding needed
 * @returns {Promise}
 */
function readFile(filePath, defaultEncoding) {
    return new Promise(function(resolve, reject) {
        if (!fs.existsSync(filePath)) {
            reject(filePath + " doesn't exist");
        }
        let opts = defaultEncoding ? {} : {encoding: "utf-8" };

        fs.readFile(filePath, opts, function(err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

/**
 * Checks if file name exists in fileDict and the file is nonempty
 * @param {} fileName
 * @param {} fileDict
 * @param {*} includeDirs
 */
function checkNonEmptyFileExists(fileName, fileDict, excludeDirs) {
    return new Promise((resolve, reject) => {
        let exists = (fileName in fileDict);
        if (exists) {
            if (excludeDirs && checkExcludedDir(fileDict[fileName], excludeDirs)) {
                exists = false;
            } else {
                fs.readFile(fileDict[fileName], {encoding: "utf-8"}, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        exists = (data.length > 0);
                    }
                });
            }
        }
        resolve(exists);
    });
}

/**
 * Checks if file belongs to an excluded directory
 * @param {} fileList - the list of files to check in the excludeDirs
 * @param {} excludeDirs - the directory list to be excluded in scans/pattern matches
 */
function checkExcludedDir(fileList, excludeDirs) {
    // TODO - will not be needed when we change both dictionaries to map to a list of files
    let fileArray = Array.isArray(fileList) ? fileList : [fileList];
    for (let i = 0; i < excludeDirs.length; i++) {
        for (let j = 0; j < fileArray.length; j++) {
            if (fileArray[j].includes("/") && fileArray[j].toUpperCase().split("/").includes(excludeDirs[i].toUpperCase())) {
                return true;
            }
        }
    }
    return false;
}
/*
 * Creates the folder that is passed in
 */
function mkDirIfNotExists(folder) {
    fs.mkdir(folder, {recursive: true}, (err) => {
        if (err) {
            throw err;
        }
    });
}

module.exports = {
    checkNonEmptyFileExists: checkNonEmptyFileExists,
    writeFile: writeFile,
    checkFileExists: checkFileExists,
    readFile: readFile,
    checkExcludedDir: checkExcludedDir,
    mkDirIfNotExists: mkDirIfNotExists
};