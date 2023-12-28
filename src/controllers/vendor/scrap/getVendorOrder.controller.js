"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userPickAddress.model.js";
import UserModel  from "../../../model/users/user.model.js";
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
import OrdersEnum from "../../../utils/orderStatus.js";

const getVendorOrder = asyncHandler(async (req, res) => {
    console.log("getVendorOrder working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;
        let orderStatus = req.query.orderStatus;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        orderStatus = orderStatus.split(",").map(el => parseInt(el));
        console.log("orderStatus", orderStatus);
        const skip = page * limit;
        const user = await UserModel.findOne({
            userId
        });

        if (fieldValidator(user)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);

        if (!user.isActive){
            console.log("isActve Status if condition working" );

            return res.status(statusCodeObject.HTTP_STATUS_OK).json(
                new ApiResponse(
                    statusCodeObject.HTTP_STATUS_NO_CONTENT,
                    errorAndSuccessCodeConfiguration.HTTP_STATUS_NO_CONTENT,
                    {},
                    CommonMessage.DETAIL_FETCHED_SUCCESSFULLY
                )
            );
        }

        const orders = await UserPickAddress.aggregate([
            {
                $match: {
                    $or: [{
                        city: user.city
                    },
                    {
                        stateCode: user.stateCode
                    }],
                    orderStatus: {
                        $in: orderStatus
                    }
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
                $sort: {
                    createdAt: -1  // Sort in descending order based on the createdAt field
                }
            },
            {
                $unwind: "$scrapInfo"
            },
           
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);

        console.log("orders", orders);
        for (let index = 0; index < orders.length; index++){
            const scrapUrl = await generateS3SignedUrl(orders[index].scrapInfo.docPath);

            console.log("orders[index].orderStatus", orders[index].orderStatus);

            if (orders[index].orderStatus >= OrdersEnum.ACCEPTED){
                const user = await UserModel.findOne({
                    userId: orders[index].vendorId
                });

                console.log(user);

                if (user && user.profile){
                    const profileUrl = await generateS3SignedUrl(user.profile);

                    user.docUrl = profileUrl;
                    orders[index].vendorInfo = user;
                }
            }

            orders[index].scrapInfo.docUrl = scrapUrl;
        }
            
        const totalScrapCount = await UserPickAddress.countDocuments({
            $or: [{
                city: user.city
            },
            {
                stateCode: user.stateCode
            }],
            orderStatus: {
                $in: orderStatus
            }
        });
    
        const finalObj = {
            orders: orders,
            totalScrapCount
        };

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                finalObj,
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
            console.error("Error in getVendorOrder:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getVendorOrder;
