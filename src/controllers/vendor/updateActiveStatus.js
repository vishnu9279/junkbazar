"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import UserModel  from "../../model/users/user.model.js";
import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    registerMessage
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";

const updateActiveStatus = asyncHandler(async (req, res) => {
    console.log("updateActiveStatus working", req.body);

    try {
        const isActive = req.body.isActive;
        const userId =  req.decoded.userId;

        if (fieldValidator(isActive)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const resp = await UserModel.findOneAndUpdate({
            userId
        }, {
            $set: {
                isActive: JSON.parse(isActive)
            }
        });

        if (fieldValidator(resp)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                registerMessage.ERROR_USER_NOT_FOUND
            );
        }

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                {},
                CommonMessage.DETAIL_UPDATED_SUCCESSFULLY
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
            console.error("Error in updateActiveStatus:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default updateActiveStatus;
