"use strict";

const asyncHandler = (requestHandler) => {
    console.log("async handler working");
    
    return (req, res, next) => {
        // console.log("asyncHandler working");
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export default asyncHandler;
