const chai = require("chai");
const expect = chai.expect;
const shelljs = require("shelljs");
const csv = require("csvtojson");
const common = require("../../src/lib/common");
const appPath = common.appPath;

describe("Tool report is consistent", function() {
    it("Report output is consistent", () => {
        return new Promise(resolve => {
            //TODO: change repo to test standarly once it is public
            const toolCmd = 'node src/app.js --giturl https://github.com/intuit/saloon.git -r sample/rules.json';
            shelljs.exec(toolCmd, resolve)
          })
          .then(() => Promise.all([
            csv().fromFile(appPath + '/test/resources/sample_results.csv'),
            csv().fromFile(appPath + '/reports/results.csv')
          ]))
          .then(([sample, actual]) => {
            //Assert that both files have the same object count
            expect(Object.keys(sample).length).to.be.eql(Object.keys(actual).length);
                for(obj in sample) {
                    //Assert that for each object,the result is the same
                    expect(sample[obj].result).to.be.eql(actual[obj].result,"obj #"+obj+" with rule "+ sample[obj].ruleID + " has a different result" );       
                }

          })
    }).timeout(4000);
});
