"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserModel  from "../../../model/users/user.model.js";
import BalanceModel from "../../../model/vendor/balance.model.js";
import UserOrderModel from "../../../model/users/userOrder.model.js";

import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import RolesEnum from "../../../utils/roles.js";

const stats = asyncHandler(async (req, res) => {
    console.log("stats working");

    try {
        // const balanceResp = await BalanceModel.aggregate([
        //     {
        //         $group: {
        //             _id: null,
        //             totalBalance: {
        //                 $sum: "$balance" 
        //             }
        //         }
        //     }
        // ]);
        const balanceResp = await BalanceModel.findOne({
            userId: "admin",
            wallet_type: "main"
        });

        // console.log("balance", balanceResp);
        const balanceDueResp = await BalanceModel.findOne({
            userId: "admin",
            wallet_type: "total_earning_due"
        });

        // console.log("balance", balanceResp);

        const platformFee = balanceResp ? balanceResp.balance.toFixed(2) : 0;
        const duePlatformFee = balanceDueResp.length ? balanceDueResp.balance.toFixed(2) : 0;
        const totalSale = await UserOrderModel.aggregate([{
            $group: {
                _id: null,
                totalAmount: {
                    $sum: "$vendorFinalAmount"
                }
            }
    
        }]);
        const totalPlatformSale = totalSale.length > 0 ? totalSale[0].totalAmount.toFixed(2) : 0;
        const userCount = await UserModel.countDocuments({
            roles: RolesEnum.USER
        });
        const vendorCount = await UserModel.countDocuments({
            roles: RolesEnum.VENDOR
        });

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                {
                    duePlatformFee,
                    platformFee,
                    totalPlatformSale,
                    userCount,
                    vendorCount
                },
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
            console.error("Error in stats:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default stats;
