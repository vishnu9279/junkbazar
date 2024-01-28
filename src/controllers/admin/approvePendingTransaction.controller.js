"use strict";

import UserOrderModel from "../../model/users/userOrder.model.js";
import UserModel  from "../../model/users/user.model.js";
import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiSuccess.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    OrderMessage
} from "../../utils/constants.js";
import helper from "../../utils/helper.js";
import {
    getNewMongoSession
} from "../../configuration/dbConnection.js";

const approvePendingTransaction = async (req, res) => {
    console.log("approvePendingTransaction working");
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const orderId = req.body.orderId;
        const isAdminApprovedPaymentStatus = req.body.isAdminApprovedPaymentStatus;

        if (fieldValidator(orderId) || fieldValidator(isAdminApprovedPaymentStatus)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const order = await UserOrderModel.findOne({
            orderId
        }).lean();

        if (fieldValidator(order)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, OrderMessage.ORDER_NOT_FOUND);

        await helper.updateUserBalance(order.vendorId, "inr", -order.markupFee, "PAYMENT_DUE", orderId, session, "due_payment");
        await helper.updateUserBalance(order.vendorId, "inr", order.markupFee, "PAYMENT_CLEAR", orderId, session, "main");

        await helper.updateUserBalance("admin", "inr", -order.markupFee, "total_earning_due", orderId, session, "total_earning_due");
        await helper.updateUserBalance("admin", "inr", order.markupFee, "total_earning", orderId, session, "main");

        await UserOrderModel.findOneAndUpdate({
            orderId
        }, {
            $set: {
                isAdminApprovedPaymentStatus: true
            }
        }, {
            session: session
        });

        await UserModel.findOneAndUpdate({
            userId: order.vendorId
        }, {
            $inc: {
                platformFee: -order.markupFee
            }
        }, {
            session: session
        });

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
        console.error("Error", error.message);
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
            console.error("Error in updateOrderStatus:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
};

export default approvePendingTransaction;
