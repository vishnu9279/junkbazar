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
import RolesEnum  from "../../utils/roles.js";
import generateS3SignedUrl from "../../services/generateS3SignedUrl.js";

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("getCurrentUser working");

    try {
        const userId = req.decoded.userId;

        const user = await UserModel.findOne({
            roles: RolesEnum.VENDOR,
            userId
        });
        
        if (fieldValidator(user)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                registerMessage.ERROR_USER_NOT_FOUND
            );
        }

        const url = await generateS3SignedUrl(user.profile);

        user.docUrl = url;

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                user,
                CommonMessage.DETAIL_FETCHED_SUCCESSFULLY
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
            console.error("Error in getCurrentUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getCurrentUser;