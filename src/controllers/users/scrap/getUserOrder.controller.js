"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserOrderModel  from "../../../model/users/userOrder.model.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";
import OrdersEnum from "../../../utils/orderStatus.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getUserOrder = asyncHandler(async (req, res) => {
    console.log("getUserOrder working");

    try {
        const userId = req.decoded.userId;
        let limit = req.query.limit;
        let page = req.query.page;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const orders = await UserOrderModel.aggregate([
            {
                $match: {
                    enabled: true,
                    userId
                }
            },
            {
                $unwind: "$items" // Unwind the items array
            },
            {
                $lookup: {
                    as: "items.scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "items.scrapId"
                }
            },
            {
                $unwind: "$items.scrapInfo" // Unwind the scrapInfo array
            },
            {
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId"
                }
            },
            {
                $unwind: "$addressInfo"
            },
            {
                $group: {
                    _id: "$_id",
                    addressId: {
                        $first: "$addToCartId"
                    },
                    addressInfo: {
                        $first: "$addressInfo"
                    },
                    addToCartId: {
                        $first: "$addToCartId" 
                    },
                    createdAt: {
                        $first: "$createdAt" 
                    },
                    dialCode: {
                        $first: "$dialCode"
                    },
                    enabled: {
                        $first: "$enabled" 
                    },
                    finalAmount: {
                        $first: "$finalAmount"
                    },
                    fullName: {
                        $first: "$fullName"
                    },
                    items: {
                        $push: "$items" 
                    },
                    monthNumber: {
                        $first: "$monthNumber"
                    },
                    orderId: {
                        $first: "$orderId"
                    },
                    orderStatus: {
                        $first: "$orderStatus"
                    },
                    phoneNumber: {
                        $first: "$phoneNumber"
                    },
                    updatedAt: {
                        $first: "$updatedAt" 
                    },
                    userId: {
                        $first: "$userId" 
                    },
                    userIdF_k: {
                        $first: "$userIdF_k" 
                    },
                    weekNumber: {
                        $first: "$weekNumber"
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);
        
        // .aggregate([
        //     {
        //         $match: {
        //             userId
        //         }
        //     },
        //     {
        //         $lookup: {
        //             as: "scrapInfo",
        //             foreignField: "scrapId",
        //             from: "scraps",
        //             localField: "scrapId"
        //         }
        //     },
        //     {
        //         $sort: {
        //             createdAt: -1  // Sort in descending order based on the createdAt field
        //         }
        //     },
        //     {
        //         $unwind: "$scrapInfo"
        //     },
        //     {
        //         $skip: parseInt(skip)  // Add the skip stage
        //     },
        //     {
        //         $limit: parseInt(limit)  // Add the limit stage
        //     }
        // ]);

        for (let index = 0; index < orders.length; index++){
            orders[index].items.map(async(el) => {
                const url = await generateS3SignedUrl( el.scrapInfo.docPath);

                el.scrapInfo.docUrl = url;

                return el;
            });
            // const url = await generateS3SignedUrl(orders[index].items.scrapInfo.docPath);

            // orders[index].scrapInfo.docUrl = url;

            if ( orders[index].vendorId && orders[index].orderStatus >= OrdersEnum.ACCEPTED){
                const user = await UserModel.findOne({
                    userId: orders[index].vendorId
                });

                if (!fieldValidator(user.profile)){
                    const profileUrl = await generateS3SignedUrl(user.profile);
     
                    user.docUrl = profileUrl;
                    orders[index].vendorInfo = user;
                }
            }
        }
                    
        const totalScrapCount = await UserOrderModel.countDocuments({
            userId
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
            console.error("Error in getUserOrder:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getUserOrder;
