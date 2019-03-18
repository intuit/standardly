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
                log.debug("Data is written to " + fileName);
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
 * @param {} location
 * @param {} localdir
 * @returns true if a non-empty file exists with given fileName, and location or excludeDirs, else @returns false
 */
function checkNonEmptyFileExists(fileName, fileDict, excludeDirs, location, localdir) {
    return new Promise(resolve => {
        let exists = (fileName in fileDict);
        if (exists) {
            let files = fileDict[fileName];
            if (excludeDirs) {
                files = checkExcludedDir(files, excludeDirs);
                if (!files){
                    return resolve(false);
                }
            }  
            if (location && location.length >= 1) {
                for (let i = 0; i < files.length; i++){
                    let file = files[i];
                    let filedir = file.slice(0, file.lastIndexOf("/"));
                    if (localdir.substr(-1) === "/"){
                        localdir = localdir.slice(0, -1);
                    }
                    if ((localdir.toUpperCase() == filedir.toUpperCase() && location=="/") || (localdir+"/"+location).toUpperCase() == filedir.toUpperCase()) {
                        return checkNonEmptyFile(file).then(res => {
                            return resolve(res);
                        });
                    }
                }
                resolve(false);
            } else {
                let res = checkAnyFileNonEmpty(fileDict[fileName]);
                return resolve(res);
            }

        } else {
            resolve(exists);
        }
    });
}

/**
 * Checks if atleast one of the files in the list is non-empty
 * @param {} fileList - input file list
 * @returns true as soon as one file in the list has length > 0 else @returns false
 */
function checkAnyFileNonEmpty(fileList) {
    let results = [];
    let exists = false;
    fileList.forEach(filePath => {
        results.push(checkNonEmptyFile(filePath));
    });
    return Promise.all(results).then(results => {
        for (let i = 0; i < results.length; i++) {
            exists = exists || results[i];
            if (exists) {
                return exists;
            }
        }
        return false;
    });
}

/**
 * Checks if a file is non-empty
 * @param {} file - input file
 * @returns true if the given file has length > 0 else @returns false
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
 * @returns outputArray which is a filtered list of files that do not lie in the excluded dirs
 */
function checkExcludedDir(fileList, excludeDirs) {
    let fileArray = Array.isArray(fileList) ? fileList : [fileList];
    let outputArray = [];
    for (let i = 0; i < fileArray.length; i++) {
        let found = false;
        for (let j = 0; j < excludeDirs.length; j++) {
            if (fileArray[i].includes("/") && fileArray[i].toUpperCase().split("/").includes(excludeDirs[j].toUpperCase())) {
                found = true;
                break;
            }
        }
        if (!found){
            outputArray.push(fileArray[i]);
        }
    }
    return outputArray;
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