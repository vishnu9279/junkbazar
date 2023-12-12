"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userScrapModel  from "../../../model/users/userScrapModel.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

const removeFormCart = asyncHandler(async (req, res) => {
    console.log("removeFormCart working");

    try {
        const userId = req.decoded.userId;
        const addToCartId = req.body.addToCartId;
        const scraps = await userScrapModel.findOneAndUpdate({
            addToCartId,
            userId
        }, {
            $set: {
                enabled: false
            }
        }, {
            new: true
        });

        // console.log(scraps);

        if (fieldValidator(scraps)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                CommonMessage.SOMETHING_WENT_WRONG
            );
        }

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                {},
                CommonMessage.DETAIL_DELETED_SUCCESSFULLY
            )
        );
    }
    catch (error) {
        console.error("Error on getting scrap", error.message);

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in removeFormCart:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default removeFormCart;
