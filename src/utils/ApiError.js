class ApiError extends Error {
    constructor(statusCode, errorCode, message = "Something Went Wrong", errors = [], data = null, stack = "") {
        super(message);
        this._message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.errorCode = errorCode;
        this.success = false;
        this.errors = errors;

        if (stack) 
            this.stack = stack;
        
        else 
            Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
