"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userPickAddress.model.js";
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
import OrdersEnum from "../../../utils/orderStatus.js";

const updateOrderStatus = asyncHandler(async (req, res) => {
    console.log("updateOrderStatus working", req.body);

    try {
        let orderStatus = req.body.orderStatus;
        const orderId = req.body.orderId;
        const userId =  req.decoded.userId;

        if (fieldValidator(orderId) || fieldValidator(orderStatus)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        orderStatus = parseInt(orderStatus);
        const order = await UserPickAddress.findOne({
            orderId
        });

        if (fieldValidator(order)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, OrderMessage.ORDER_NOT_FOUND);

        if (order.orderStatus === OrdersEnum.ACCEPTED) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, OrderMessage.ORDER_ALREADY_ACCEPTED);

        const obj = {
            orderStatus
        };

        if (orderStatus === OrdersEnum.ACCEPTED) obj.vendorId = userId;

        const resp = await UserPickAddress.findOneAndUpdate({
            orderId
        }, {
            $set: obj
        });

        if (fieldValidator(resp)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                ScrapMessage.SCRAP_ALREADY_EXIST
            );
        }

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
});

export default updateOrderStatus;
