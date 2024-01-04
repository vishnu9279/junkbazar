"use strict";

import {
    basicConfigurationObject
} from "../utils/constants.js";
import fieldValidator from "../utils/fieldValidator.js";

class ApiResponse {
    constructor(statusCode, successCode, data, message = "Success") {
        console.log("basicConfigurationObject.JSON_STRINGIFY", basicConfigurationObject.JSON_STRINGIFY);
        this.statusCode = statusCode;
        this.successCode = successCode;
        // this.data = (!fieldValidator(basicConfigurationObject.JSON_STRINGIFY)) ? data : JSON.stringify(data);
        this.data =  JSON.stringify(data);
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;
