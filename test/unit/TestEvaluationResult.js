"use strict";
const chai = require("chai");
const expect = chai.expect;
const EvaluationResult = require("../../src/rules/EvaluationResult");

const erOneDetArray = new EvaluationResult("ruleID", "result", "message", "error", [{ "file": "app.js", "col": "10", "line": "10" }]);
const erNoDetArray = new EvaluationResult("OOS-FMNCP-0010", "Fail", "Possible internal github found", "Error", []);

describe("Test Evaulation Result", function() {

    describe("Test getAsString method", function() {
        it("Gets the object as a string when the details message exists", () => {
            expect(erOneDetArray.getAsString()).to.be.equal("ruleID,error,file : app.js; col : 10; line : 10\n");
        });

        it("Gets the object as a string when the details message does not exist", () => {
            expect(erNoDetArray.getAsString()).to.be.equal("OOS-FMNCP-0010,Error");
        });

    });

    describe("Check ResultEnum is accessible", () => {
        it("Checks ResultEnum pass", () => {
            expect(EvaluationResult.ResultEnum.PASS).to.equal("Pass");
        });

        it("Checks ResultEnum fail", () => {
            expect(EvaluationResult.ResultEnum.FAIL).to.equal("Fail");
        });

        it("Checks ResultEnum unknown", () => {
            expect(EvaluationResult.ResultEnum.UNKNOWN).to.equal("Unknown");
        });

        it("Checks ResultEnum error", () => {
            expect(EvaluationResult.ResultEnum.ERROR).to.equal("Error");
        });

        it("Checks ResultEnum warning", () => {
            expect(EvaluationResult.ResultEnum.WARN).to.equal("Warning");
        });
    });

    describe("Test encodeValue method", () => {
        it("encodes a value that contains a comma at the end of the string", () => {
            const stringWithComma = "stringWithComma,";
            expect(erOneDetArray.encodeValue(stringWithComma)).to.equal("\"stringWithComma,\"");
        });

        it("encodes a value that contains only a comma", () => {
            const stringWithComma = ",";
            expect(erOneDetArray.encodeValue(stringWithComma)).to.equal("\",\"");
        });

        it("encodes a value that contains no comma", () => {
            const stringWithoutComma = "HI";
            expect(erOneDetArray.encodeValue(stringWithoutComma)).to.equal("HI");
        });

        it("encodes a value that contains the empty string", () => {
            const emptyString = "";
            expect(erOneDetArray.encodeValue(emptyString)).to.equal("");
        });
    });

    describe("Test getFieldsAsString method", () => {
        it("Returns all of an evaluationResults objects property names as a string", () => {
            expect(erOneDetArray.getFieldsAsString()).to.equal("ruleID,result,message,error,detail");
            expect(erNoDetArray.getFieldsAsString()).to.equal("ruleID,result,message,error,detail");
        });
    });

    describe("Test serializeDetailObjects method", () => {
        const detArrayTwoObjects = [{"a" : "valuea", "b": "valueb"}, {"a" : "valuea1", "b": "valueb1"}];
        const detArrayOneObject = [{"a" : "valuea", "b": "valueb"}];
        const detArrayEmpty = [];
        const pref = "somestring";
        const emptyPref = "";
        const erWithDetArray = new EvaluationResult("ruleid1", "Fail", "some failure message", "Error", [{"a" : "valuea", "b": "valueb"}, {"a" : "valuea1", "b": "valueb1"}]);
        it("Add the generated details message with the an evaluationResults object details data", () => {
            expect(erOneDetArray.serializeDetailObjects(pref, detArrayTwoObjects)).to.equal("somestring,a : valuea; b : valueb\nsomestring,a : valuea1; b : valueb1\n");
            expect(erWithDetArray.serializeDetailObjects(pref, detArrayOneObject)).to.equal("somestring,a : valuea; b : valueb\n");
        });
        it("Add a zero length details message with the erWithDetArray details data", () => {
            expect(erWithDetArray.serializeDetailObjects(emptyPref, detArrayEmpty)).to.equal("");
        });
    });

    describe("Test serialize method", () => {
        const detArrayOneString = ["fileName  /Users/sampleUser/nameOfProject"];
        const detArrayMultStrings = ["fileName  /Users/sampleUser/nameOfProject", "Some other message"];
        it("Checks if details message is in new string format when details message contains one message", () => {
            expect(erOneDetArray.serialize(detArrayOneString, true)).to.equal("0 : fileName  /Users/sampleUser/nameOfProject");
        });

        it("Checks if details message is in new string format when details message contains multiple messages", () => {
            expect(erNoDetArray.serialize(detArrayMultStrings, true)).to.equal("0 : fileName  /Users/sampleUser/nameOfProject; 1 : Some other message");
        });

        it("Checks if entire block is in new string method", () => {
            expect(erNoDetArray.serialize(erNoDetArray, false)).to.equal("OOS-FMNCP-0010,Error");
        });
    });
});