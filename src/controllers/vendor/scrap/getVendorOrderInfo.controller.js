"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
// import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    ScrapMessage,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";
// import OrdersEnum from "../../../utils/orderStatus.js";
import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getVendorOrderInfo = asyncHandler(async (req, res) => {
    console.log("getVendorOrderInfo working");

    try {
        const orderId = req.query.orderId;
        const order = await userOrderModel.aggregate([
            {
                $match: {
                    orderId
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
                    localField: "addressId"
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
                    isAdminApprovedPaymentStatus: {
                        $first: "$isAdminApprovedPaymentStatus"
                    },
                    isPaid: {
                        $first: "$isPaid"
                    },
                    items: {
                        $push: "$items" 
                    },
                    markupFee: {
                        $first: "$markupFee"
                    },
                    markupFeePercentage: {
                        $first: "$markupFeePercentage"
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
            }
        ]);
        
        if (fieldValidator(order)) throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);
        
        const orderObj = order[0];
        
        for (let index = 0; index < orderObj.items.length; index++){
            const url = await generateS3SignedUrl(orderObj.items[index].scrapInfo.docPath);
            
            orderObj.items[index].scrapInfo.docUrl = url;
        }
                
        // console.log("order", JSON.stringify(orderObj));

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                orderObj,
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
