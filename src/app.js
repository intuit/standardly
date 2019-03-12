"use strict";
const RulesParser = require("./rules/RulesParser.js");
const common = require("./lib/common");
const appPath = common.appPath;
const app = require("commander");
const path = require("path");
const reporter = require("./rules/complianceReporter.js");
const log = require("./lib/common.js").log;
const shelljs = require("shelljs");
const gitHubUtils = require("./lib/gitHubUtils");
const fse = require("fs-extra");
const tmpDir = path.join(appPath, "/tmp");
const header = require("./lib/logUtils").clIntro;
const consoleErr = require("./lib/logUtils").consoleErr;
const mkDirIfNotExists = require("./lib/ioUtils").mkDirIfNotExists;


function doRun() {
    header();
    let target = {};
    setCLOptions();
    app.parse(process.argv);

    if (!process.argv || !process.argv.length > 0) {
        displayHelp(true);
    }

    if (!app.giturl && !app.localdir) {
        consoleErr("At least one of giturl or localdir must be provided"); // eslint-disable-line no-console
        displayHelp(true);
    }

    if (app.giturl && app.localdir) {
        consoleErr("Only one of giturl or localdir must be provided"); // eslint-disable-line no-console
        displayHelp(true);
    }

    if (app.localdir) {
        target.localdir = app.localdir;
    }

    if (!app.rulesfile) {
        consoleErr("A Rules json file must be provided"); // eslint-disable-line no-console
        displayHelp(true);
    }

    if (app.excludeDirs) {
        if (app.excludeDirs.indexOf(",") > 0) {
            app.excludeDirs = app.excludeDirs.split(",");
        } else {
            app.excludeDirs = [app.excludeDirs];
        }
    }

    if (app.giturl) {
        target.giturl = app.giturl;
        return fse.emptyDir(tmpDir)
            .then(() => {
                return gitHubUtils.cloneGitRepo(app.giturl, tmpDir)
                    .then((response) => {
                        target.localdir = response;
                        return validate(target, app.rulesfile, app.excludeDirs);
                    })
                    .catch((err) => {
                        log.err(err);
                    })
                    .finally(() => {
                        shelljs.rm("-rf", tmpDir); // may not always have a tmpdir, but no harm in trying to del
                    });
            });
    } else {
        return validate(target, app.rulesfile, app.excludeDirs);
    }
}

function validate(target, rulesfile, excludeDirs) {
    return new Promise((resolve, reject) => {
        const rp = new RulesParser(target, rulesfile, excludeDirs);
        return rp.parse()
            .then((results) => {
                mkDirIfNotExists(app.outputdir);
                const resultsfile = path.join(app.outputdir, "results.csv");
                return reporter.reportCompliance(results, resultsfile)
                    .then(() => {
                        log.info("Printed results into " + resultsfile);
                        resolve(true);
                    }).catch((err) => {
                        log.err(err);
                        reject(err);
                    });
            });
    });
}

function setCLOptions() {
    app.option("-l, --localdir <dir>", "Local Directory to scan. Only one of Local Directory or Git URL must be provided.");
    app.option("-g, --giturl <url>", "Git URL to scan. Only one of Local Directory or Git URL must be provided.");
    app.option("-r, --rulesfile <file>", "Rules.json file to use for the scan");
    app.option("-o, --outputdir <file>", "Results.csv file to output the scan results to", path.join(appPath, "reports"));
    app.option("-e, --excludeDirs <file>", "Comma seprated list of directories to be excluded from scanning");
}

function displayHelp(exit) {
    app.outputHelp();
    if (exit) {
        process.exit(1);
    }
}

doRun();