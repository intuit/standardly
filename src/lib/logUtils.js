const colors = require("colors");

/**
  * Style the initial command line interface
  * Creates beautiful Standardly text
  * and intro sentence
**/
/* eslint-disable no-console */
function clIntro() {
    const figlet = require("figlet");
    console.log(colors.green(figlet.textSync("Standardly", {font: "big"})));
    console.log(colors.bgGreen("DIY tool for Standards Governance\n"));
}
/* eslint-enable no-console */

/*
 * Custom error message
 * @param str
 */
function consoleErr(str) {
    console.error(colors.red(str)); // eslint-disable-line no-console
}

module.exports = {
    clIntro : clIntro,
    consoleErr : consoleErr
};