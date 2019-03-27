"use strict";
const Json2csvParser = require("json2csv").Parser;

function convertJsonToCsv(fields, data) {
    return new Promise(function(resolve, reject) {
        try {
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(data);
            if(csv) {
                resolve(csv);
            } else {
                reject(Error("Error in parsing the json data into csv"));
            }
        } catch(err) {
            reject(Error(err));
        }
    });
}

module.exports = {
    convertJsonToCsv: convertJsonToCsv
};
