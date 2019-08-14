"use strict";
const appRoot = require("app-root-path");
const logger = require("bunyan");
const log = logger.createLogger({ name: "standardly" });


module.exports = {
    appRoot: appRoot,
    appPath : appRoot.path,
    log : log
};