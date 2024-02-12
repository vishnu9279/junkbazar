"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    registerMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";
import RolesEnum from "../../../utils/roles.js";

const getVendorInfo = asyncHandler(async (req, res) => {
    console.log("getVendorInfo working", req.query);

    try {
        const userId = req.query.userId;

        const filterObj = {
            roles: RolesEnum.VENDOR,
            userId
        };

        console.log("====================================");
        console.log(filterObj);
        console.log("====================================");
        const vendor = await UserModel.findOne(filterObj);

        if (fieldValidator(userId))  throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (fieldValidator(vendor))  throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);

        vendor.profileUrl = await generateS3SignedUrl(vendor.profile);
        vendor.panUrl = await generateS3SignedUrl(vendor.panID);
        vendor.aadhaarUrl = await generateS3SignedUrl(vendor.aadhaarID);
        
        console.log("====================================");
        console.log(vendor);
        console.log("====================================");
        
        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                vendor,
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
            console.error("Error in getVendorInfo:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getVendorInfo;
