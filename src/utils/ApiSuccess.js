"use strict";

import {
    basicConfigurationObject
} from "../utils/constants.js";
console.log(typeof basicConfigurationObject.JSON_STRINGIFY);
class ApiResponse {
    constructor(statusCode, successCode, data, message = "Success") {
        console.log("basicConfigurationObject.JSON_STRINGIFY", basicConfigurationObject.JSON_STRINGIFY);
        this.statusCode = statusCode;
        this.successCode = successCode;
        this.data = (basicConfigurationObject.JSON_STRINGIFY === "true") ? data : JSON.stringify(data);
        // this.data =  JSON.stringify(data);
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;
