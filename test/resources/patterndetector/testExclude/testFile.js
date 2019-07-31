// This file should violate the FMNCP rules, but it shouldn't show up under the scan because it's
// under the directory node_modules.

let ssn = "876-54-3219";
let companyEmail = "company@company.com";

function testFunc() {
    ssn.concat("1234");
    companyEmail.concat("test");
}

module.exports = {
    testFunc: testFunc
}