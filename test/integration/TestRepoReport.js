const chai = require("chai");
const expect = chai.expect;
const shelljs = require("shelljs");
const fse = require("fs-extra");

describe("Tool report is consistent", function() {
    it("Report output is consistent", () => {
        return new Promise(resolve => {
            //TODO: change repo to test standarly once its plublic
            const toolCmd = 'node src/app.js --giturl https://github.com/intuit/saloon.git -r sample/rules.json';
            shelljs.exec(toolCmd, resolve)
          })
          .then(() => Promise.all([
            fse.readFile('test/resources/sample_results.csv'),
            fse.readFile('reports/results.csv')
          ]))
          .then(([sample, actual]) => expect(Buffer.compare(sample, actual)).to.be.eql(0))
    }).timeout(4000);
});