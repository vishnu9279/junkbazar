"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";
import RolesEnum from "../../../utils/roles.js";

const getVendor = asyncHandler(async (req, res) => {
    console.log("getVendor working");

    try {
        let limit = req.query.limit;
        let page = req.query.page;
        const filterValue = req.query.filterValue;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {
            roles: RolesEnum.VENDOR
        };

        if (!fieldValidator(filterValue)){
            filterObj.$or = [
                {
                    firstName: new RegExp(filterValue, "i")
                },
                {
                    lastName: new RegExp(filterValue, "i")
                }
            ];
        }

        const vendor = await UserModel.find(filterObj)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        if (!fieldValidator(vendor)) {
            for (let index = 0; index < vendor.length; index++){
                const url = await generateS3SignedUrl(vendor[index].profile);
                const pan = await generateS3SignedUrl(vendor[index].panID);
                const aadhaar = await generateS3SignedUrl(vendor[index].aadhaarID);

                vendor[index].profileUrl = url;
                vendor[index].panUrl = pan;
                vendor[index].aadhaarUrl = aadhaar;
            }
        }

        const totalScrapCount = await UserModel.countDocuments(filterObj);

        const finalObj = {
            totalScrapCount,
            vendor: vendor
        };

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                finalObj,
                ScrapMessage.SCRAP_SUCCESSFULLY_SAVED
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
            console.error("Error in getVendor:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getVendor;
