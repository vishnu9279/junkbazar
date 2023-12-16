"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userScrapModel  from "../../../model/users/userScrapModel.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage, AddToCartMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const addScrapQuantity = asyncHandler (async (req, res) => {
    let  session;
    
    try {
        session = await getNewMongoSession();
        
        session.startTransaction();
        const userId = req.decoded.userId;

        console.log("addScrapQuantity working", req.body, userId);
        let quantity = req.body.addScrapQuantity;
        const {
            scrapId
        } = req.body;

        quantity = parseInt(quantity);

        if (fieldValidator(scrapId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const scrap = await userScrapModel.findOne({
            enabled: true,
            scrapId,
            userId
        });

        if (fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        const resp = await userScrapModel.findOneAndUpdate({
            enabled: true,
            scrapId,
            userId
        }, {
            $set: {
                quantity
            }
        }, {
            session: session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();
        await session.endSession();

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, AddToCartMessage.SCRAP_QUANTITY_UPDATE)
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

export default addScrapQuantity;