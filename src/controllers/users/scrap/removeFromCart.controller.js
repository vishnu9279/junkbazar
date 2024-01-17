"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import cartModel  from "../../../model/users/cart.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    ScrapMessage,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

const removeFormCart = asyncHandler(async (req, res) => {
    console.log("removeFormCart working");

    try {
        const userId = req.decoded.userId;
        const scrapId = req.body.scrapId;

        const scrap = await cartModel.findOne({
            enabled: true,
            // "items.scrapId": scrapId,
            userId
        });

        console.log("scrap", scrap);

        if (fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);

        const scrapInfo = scrap.items.find(el => el.scrapId === scrapId);

        if (fieldValidator(scrapInfo)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);

        const scraps = await cartModel.findOneAndUpdate({
            // "items.scrapId": scrapId,
            userId
        }, {
            $inc: {
                finalAmount: -scrapInfo.amount 
            },
            $pull: {
                items: {
                    scrapId: scrapId 
                }
            }
        }, {
            new: true
        });

        console.log("Scraps", scrap);

        if (scraps.items.length === 0){
            await cartModel.deleteOne({
                userId
            }); 
        }
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
