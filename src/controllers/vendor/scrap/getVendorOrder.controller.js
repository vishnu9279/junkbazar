"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
import vendorBookingModel from "../../../model/vendor/vendorBooking.model.js";
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
// import OrdersEnum from "../../../utils/orderStatus.js";

const getVendorOrder = asyncHandler(async (req, res) => {
    console.log("getVendorOrder working", req.query);

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

        console.log("user,", user);

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

        const orders = await userOrderModel.aggregate([
            {
                $match: {
                    orderStatus: {
                        $in: orderStatus
                    }
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
                $unwind: "$items.scrapInfo"
            },
            {
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId",
                    pipeline: [{
                        $match: {
                            $or: [{
                                city: user.city
                            },
                            {
                                stateCode: user.stateCode
                            }]
                        }
                    }]
                }
            },
            {
                $unwind: "$addressInfo"
            },
            {
                $group: {
                    _id: "$_id",
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
                    vendorId: {
                        $first: "$vendorId"
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1  // Sort in descending order based on the createdAt field
                }
            },
            
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);

        // console.log("orders", orders);
        for (let index = 0; index < orders.length; index++){
            console.log("inside if condtionvendor ", orders[index].vendorId);

            orders[index].items.map(async(el) => {
                const url = await generateS3SignedUrl(el.scrapInfo.docPath);

                el.scrapInfo.docUrl = url;

                return el;
            });

            // if ( orders[index].vendorId && orders[index].orderStatus >= OrdersEnum.ACCEPTED){
            //     const vendor = await UserModel.findOne({
            //         userId: orders[index].vendorId
            //     });
                
            //     if (!fieldValidator(vendor.profile)){
            //         const profileUrl = await generateS3SignedUrl(vendor.profile);
                    
            //         vendor.docUrl = profileUrl;
            //         orders[index].vendorInfo = vendor;
            //     }
            // }
            
            // if ( orders[index].userId){
            //     const user = await UserModel.findOne({
            //         userId: orders[index].userId
            //     });

            //     console.log("inside if condtion user", orders[index].userId, user);

            //     if (!fieldValidator(user.profile)){
            //         const profileUrl = await generateS3SignedUrl(user.profile);
     
            //         user.docUrl = profileUrl;
            //     }

            //     orders[index].userInfo = user;
            // }
        }
            
        const totalScrapCount = await userOrderModel.aggregate([
            {
                $match: {
                    orderStatus: {
                        $in: orderStatus
                    }
                }
            },
            {
                $lookup: {
                    as: "addressInfo",
                    foreignField: "addressId",
                    from: "user_addresses",
                    localField: "addressId",
                    pipeline: [{
                        $match: {
                            $or: [{
                                city: user.city
                            },
                            {
                                stateCode: user.stateCode
                            }]
                        }
                    }]
                }
            },
            {
                $unwind: "$addressInfo"
            }
        ]);

        console.log("totalScrapCount", totalScrapCount.length);
        const bookingResp = await vendorBookingModel.find({
            vendorId: userId
        }).lean();
        const finalObj = {
            orders: orders.filter(order => !bookingResp.some(booking => booking.orderId === order.orderId)),
            totalScrapCount: totalScrapCount.length
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
