"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    OrderMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";

const vendorScrapOrderConfirmation = asyncHandler(async (req, res) => {
    console.log("vendorScrapOrderConfirmation working", req.body, req.decoded);
    let session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        let quantity = req.body.quantity;
        let price = req.body.price;
        const orderId = req.body.orderId;
        const userId =  req.decoded.userId;
        const scrapId = req.body.scrapId;
        let vendorFinalAmount = req.body.vendorFinalAmount;
        let VendorTotalScrapQuantity = req.body.VendorTotalScrapQuantity;

        if (fieldValidator(orderId) || fieldValidator(quantity) || fieldValidator(price) || fieldValidator(scrapId) || fieldValidator(VendorTotalScrapQuantity)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
       
        quantity = parseFloat(quantity);
        price = parseFloat(price);
        VendorTotalScrapQuantity = parseFloat(VendorTotalScrapQuantity);
        vendorFinalAmount = parseFloat(vendorFinalAmount);
        const order = await userOrderModel.findOne({
            orderId,
            vendorId: userId
        });

        if (fieldValidator(order)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, OrderMessage.ORDER_NOT_FOUND);
       
        const vendorAmount = parseFloat((quantity * price).toFixed(2));
        
        const resp = await userOrderModel.findOneAndUpdate({
            "items.scrapId": scrapId,
            orderId,
            vendorId: userId
        }, {
            $set: {
                finalAmount: vendorFinalAmount,
                "items.$.amount": vendorAmount,
                "items.$.isVendorUpdatedStatus": true,
                "items.$.quantity": quantity,
                "items.$.vendorAmount": vendorAmount,
                "items.$.vendorQuantity": quantity,
                vendorFinalAmount,
                VendorTotalScrapQuantity
            }
        }, {
            new: true,
            session: session,
            upsert: true
        });

        console.log("resp", resp.value);
        await session.commitTransaction();
        await session.endSession();

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                {
                    vendorFinalAmount
                },
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
            console.error("Error in vendorScrapOrderConfirmation:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default vendorScrapOrderConfirmation;
