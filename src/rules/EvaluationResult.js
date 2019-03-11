"use strict";
const detailFieldName = "detail";

class EvaluationResult {
    constructor(ruleID, result, message, error, detail) {
        this.ruleID = ruleID;
        this.result = result;
        this.message = message;
        this.error = error;
        this.detail = detail;
    }

    /**
     * Surrounds the value with quotes if it contains ',' to append it to CSV string
     * @param {*} value
     */
    encodeValue(value) {
        if(value.indexOf(",") > -1) {
            value = "\"" + value + "\"";
        }
        return value;
    }

    /**
     * Gets the object as string
     * Retruns an array of strings
     */
    getAsString() {
        let result = "";
        if (this[detailFieldName] instanceof Array && this[detailFieldName].length > 0) {
            // we need to serialize each item of the detail as a line item
            // the line item contains the rest of the 'this' object as a prefix before appending the details
            const str = this.serialize(this, false);
            result = this.serializeDetailObjects(str, this[detailFieldName]);
        } else {
            result = this.serialize(this, false);
        }
        return result;
    }

    /**
     * Serialize details array
     * @param {*} str - string to include before serializing the details object
     * @param detail - the detail object to serialize
     * @returns serialized string
     */
    serializeDetailObjects(str, detail) {
        let result = "";
        detail.forEach(element => {
            result += str + "," + this.serialize(element, true) + "\n";
        });
        return result;
    }

    /**
     * Serializes an object
     * @param {*} object - the object to serialize
     * @param {*} includeKeyName - pass true if the field name should be serialized
     * @returns serialized string
     */
    serialize(object, includeKeyName) {
        let str = "";
        let separator = "";
        let array = Object.keys(object);
        array.forEach(element => {
            if(includeKeyName) {
                str += separator + element + " : " + object[element];
                separator = "; ";
            } else {
                if (element !== detailFieldName) {
                    str += separator + (this[element] === undefined? "" : this.encodeValue(this[element]));
                }
                separator = ",";
            }
        });
        if(includeKeyName) {
            str = this.encodeValue(str);
        }
        return str;
    }

    /**
     * Gets the object property names as a header
     * Returns a string
     */
    getFieldsAsString() {
        let fields = Object.getOwnPropertyNames(this);
        return fields.toString();
    }

}

EvaluationResult.ResultEnum = {
    PASS: "Pass",
    WARN: "Warning",
    FAIL: "Fail",
    UNKNOWN: "Unknown",
    ERROR: "Error"
};

module.exports = EvaluationResult;