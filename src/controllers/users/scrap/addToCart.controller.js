"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import cartModel  from "../../../model/users/cart.model.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage, AddToCartMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import helper from "../../../utils/helper.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

const addToCart = asyncHandler (async (req, res) => {
    console.log("addToCart working", req.body);
    let  session;
    const currentTime = new Date().getTime();
    const uniqueId = uid.rnd(6);

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const userIdF_k = req.decoded.userIdF_k;

        const {
            scrapId, addScrapQuantity
        } = req.body;

        if (fieldValidator(scrapId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        const pickAddress = await cartModel.findOne({
            enabled: true,
            "items.scrapId": scrapId,
            userId
        });

        if (!fieldValidator(pickAddress)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, AddToCartMessage.SCRAP_ALREADY_IN_CART);

        const scrap = await Scrap.findOne({
            scrapId
        });
    
        if (fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);
        
        const cartResp = await cartModel.findOne({
            userId
        }).lean();

        const addToCartSaveObj = {
            currentTime,
            dayNumber: await helper.getDayNumber(),
            monthNumber: await helper.getMonthNumber(),
           
            userId,
            userIdF_k,
            weekNumber: await helper.getWeekNumber()
        };

        if (fieldValidator(cartResp)) 
            addToCartSaveObj.addToCartId = uniqueId;
        // else 
        //     addToCartSaveObj.addToCartId = cartResp.addToCartId;

        const quantity = addScrapQuantity || 1;
        const amount = parseFloat((quantity * scrap.price).toFixed(2));
        const items = [{
            amount,
            price: scrap.price,
            quantity,
            scrapId,
            scrapIdF_K: scrap._id

        }];

        const resp = await cartModel.findOneAndUpdate({
            userId
        }, {
            $push: {
                items
            },
            $set: addToCartSaveObj
        }, {
            new: true,
            session: session,
            upsert: true
        });

        console.log("resp", resp);

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, AddToCartMessage.SCRAP_SUCCESSFULLY_SAVED_IN_CART)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
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
            console.error("Error in registerUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default addToCart;