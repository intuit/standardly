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
 * @param {} excludeDirs
 * @param {} fileLocation
 * @param {} rootDir
 */
function checkNonEmptyFileExists(fileName, fileDict, excludeDirs, fileLocation, rootDir) {
    return new Promise(resolve => {
        let exists = (fileName in fileDict);
        if (exists) {
            if (excludeDirs && checkExcludedDir(fileDict[fileName], excludeDirs)) {
                exists = false;
            } else {
                if (fileLocation && fileLocation.length >= 1) {
                    for (let i = 0; i < fileDict[fileName].length; i++){
                        let filePath = fileDict[fileName][i];
                        let file = filePath.slice(0, filePath.lastIndexOf("/"));
                        if (rootDir.substr(-1) === "/"){
                            rootDir = rootDir.slice(0, -1);
                        }
                        if ((rootDir.toUpperCase() == file.toUpperCase() && fileLocation=="/") || (rootDir+"/"+fileLocation).toUpperCase() == file.toUpperCase()) {
                            checkNonEmptyFile(filePath).then(res => {
                                return resolve(res);
                            });
                        }
                    }
                    resolve(false);
                } else {
                    let res = checkAnyFileNonEmpty(fileDict[fileName]);
                    return resolve(res);
                }
            }
        } else {
            resolve(exists);
        }
    });
}

/**
 * Checks if atleast one of the files in the list is non-empty
 * @param {} fileList - input file list
 */
function checkAnyFileNonEmpty(fileList) {
    let results = [];
    let exists = false;
    fileList.forEach(filePath => {
        results.push(checkNonEmptyFile(filePath));
    });
    return Promise.all(results).then(results => {
        results.forEach(res => {
            exists = exists || res;
        });
        return exists;
    });
}

/**
 * Checks if a file is non-empty
 * @param {} file - input file
 */
function checkNonEmptyFile(file){
    return new Promise(resolve => {
        fs.readFile(file, {encoding: "utf-8"}, function(err, data) {
            if (err){
                resolve(false);
            }else if (data.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

/**
 * Checks if file belongs to an excluded directory
 * @param {} fileList - the list of files to check in the excludeDirs
 * @param {} excludeDirs - the directory list to be excluded in scans/pattern matches
 */
function checkExcludedDir(fileList, excludeDirs) {
    for (let i = 0; i < excludeDirs.length; i++) {
        for (let j = 0; j < fileList.length; j++) {
            if (fileList[j].includes("/") && fileList[j].toUpperCase().split("/").includes(excludeDirs[i].toUpperCase())) {
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