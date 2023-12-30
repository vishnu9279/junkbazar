"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import AppVersion  from "../../model/appVersion.model.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";

const appVersion = asyncHandler(async (req, res) => {
    console.log("appVersion working");

    try {
        const platform = req.headers.platform;

        const appVersion = await AppVersion.findOne({
            type: platform
        })
            .sort({
                createdAt: -1 
            }) // Sort in descending order based on the createdAt field
            .exec();

        console.log("appVersion", appVersion, platform);

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                appVersion,
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
            console.error("Error in appVersion:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default appVersion;
