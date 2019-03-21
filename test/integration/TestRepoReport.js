const chai = require("chai");
const expect = chai.expect;
const shelljs = require("shelljs");
const fse = require("fs-extra");

describe("Tool report is consistent", function() {
    it("Report output is consistent", () => {
        const toolcmd= "node src/app.js --giturl https://github.com/intuit/saloon.git  -r sample/rules.json"
        shelljs.exec(toolcmd, {silent:true}, ()=> {
           var sampleResult;
            return fse.readFile('test/resources/sample_results.csv')
                .then((sample)=>{
                    sampleResult = sample;
                    return(fse.readFile('reports/results.csv'))
                })
                .then((actualResult)=>{ 
                    var comparison = Buffer.compare(sampleResult, actualResult);
                    console.log(comparison);
                    return expect(comparison).to.eql(0);
                })
                .catch((err)=>{throw err;})
          });   
    });
});