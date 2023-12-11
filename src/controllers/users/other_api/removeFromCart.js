"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import addToCartSchema  from "../../../model/users/addToCart.model.js";
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
        const userIdF_k = req.decoded.userIdF_k;
        const addToCartId = req.body.addToCartId;
        const scraps = await addToCartSchema.findOneAndUpdate({
            addToCartId,
            userIdF_k
        }, {
            $set: {
                enabled: false
            }
        });

        if (fieldValidator(scraps.value)) {
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
