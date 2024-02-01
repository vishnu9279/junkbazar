"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import AdminModel  from "../../model/admin/admin.model.js";
import BalanceModel from "../../model/vendor/balance.model.js";

import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    registerMessage
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../services/generateS3SignedUrl.js";

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("getCurrentUser working");

    try {
        const userId = req.decoded.userId;
        const user = await AdminModel.findOne({
            userId
        }, {
            salt: 0
        });
        
        if (fieldValidator(user)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                registerMessage.ERROR_USER_NOT_FOUND
            );
        }

        const balance = await BalanceModel.findOne({
            userId: "admin",
            wallet_type: "total_earning_due"
        });

        // console.log("balance", balance);

        if (!fieldValidator(user.profile)){
            const profileUrl = await generateS3SignedUrl(user.profile);
   
            user.profileUrl = profileUrl;
        }

        user.balance = balance ? balance.balance.toFixed(2) : 0;

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
