"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userOrder.model.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    ScrapMessage,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";
import OrdersEnum from "../../../utils/orderStatus.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getVendorOrderInfo = asyncHandler(async (req, res) => {
    console.log("getVendorOrderInfo working");

    try {
        const orderId = req.query.orderId;
        const order = await UserPickAddress.aggregate([
            {
                $match: {
                    orderId
                }
            },
            {
                $lookup: {
                    as: "scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "scrapId"
                }
            },
            {
                $unwind: "$scrapInfo"
            }
        ]);

        if (fieldValidator(order)) throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);

        for (let index = 0; index < order.length; index++){
            const url = await generateS3SignedUrl(order[index].scrapInfo.docPath);

            order[index].scrapInfo.docUrl = url;

            if (order[index].orderStatus >= OrdersEnum.ACCEPTED){
                const user = await UserModel.findOne({
                    userId: order[index].vendorId
                });

                const profileUrl = await generateS3SignedUrl(user.profile);

                user.docUrl = profileUrl;
                order[index].vendorInfo = user;
            }
        }

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                order[0],
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
            console.error("Error in getVendorOrderInfo:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getVendorOrderInfo;
