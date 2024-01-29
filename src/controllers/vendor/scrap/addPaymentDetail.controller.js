"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    ScrapMessage,
    OrderMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";

const addPaymentDetail = asyncHandler(async (req, res) => {
    console.log("addPaymentDetail working", req.body, req.decoded);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        
        const userId =  req.decoded.userId;
        const orderId = req.body.orderId;
        const paymentScreenShotImageKey = req.body.paymentScreenShotImageKey;
        const transactionOrUtrNumber = req.body.transactionOrUtrNumber;

        if (fieldValidator(paymentScreenShotImageKey) || fieldValidator(transactionOrUtrNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const obj = {};

        if (!fieldValidator(transactionOrUtrNumber) && !fieldValidator(paymentScreenShotImageKey)){
            obj.isPaid = true;
            obj.transactionOrUtrNumber = transactionOrUtrNumber;
            obj.paymentScreenShotImageKey = paymentScreenShotImageKey;
            obj.isAdminApprovedPaymentStatus = false;
        }
      
        const resp = await userOrderModel.findOneAndUpdate({
            orderId,
            vendorId: userId
        }, {
            $set: obj
        }, {
            new: true,
            session: session
        });

        if (fieldValidator(resp)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                ScrapMessage.SCRAP_ALREADY_EXIST
            );
        }

        console.log("resp", resp);
       
        await session.commitTransaction();
        await session.endSession();

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                {},
                OrderMessage.ORDER_UPDATED_SUCCESSFULLY
            )
        );
    }
    catch (error) {
        console.error("Error on getting scrap", error.message);
        await session.abortTransaction();
        await session.endSession();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in addPaymentDetail:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default addPaymentDetail;
