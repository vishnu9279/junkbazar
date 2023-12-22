"use strict";

class ApiResponse {
    constructor(statusCode, successCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.successCode = successCode;
        // this.data = JSON.stringify(data);
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;
