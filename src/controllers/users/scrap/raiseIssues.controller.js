"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import raiseIssuesModel  from "../../../model/users/raiseIssues.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, registerMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";

const raiseIssues = asyncHandler (async (req, res) => {
    console.log("raiseIssues working", req.body);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            comment, vendorId, scrapId, addToCartId
        } = req.body;
        
        if (fieldValidator(scrapId) || fieldValidator(comment) || fieldValidator(vendorId) || fieldValidator(addToCartId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const obj = {
            addToCartId,
            comment,
            scrapId,
            userId,
            vendorId
        };
        const respValue = await raiseIssuesModel.create(obj, session);

        if (fieldValidator(respValue)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, registerMessage.ERROR_USER_NOT_FOUND);
       
        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, CommonMessage.DETAIL_UPDATED_SUCCESSFULLY)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
        await session.abortTransaction();
        await session.endSession();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in registerUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default raiseIssues;