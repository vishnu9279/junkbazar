"use strict";

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // console.log("asyncHandler working");
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export default asyncHandler;
