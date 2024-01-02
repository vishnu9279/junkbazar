"use strict";

import asyncHandler from "../../utils/asyncHandler.js";
import userAddress  from "../../model/users/userAdress.model.js";
import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, AddAdressMessage
} from "../../utils/constants.js";

import ApiResponse from "../../utils/ApiSuccess.js";
import saveAddAddressHelper from "./saveAddressHelper.controller.js";

import {
    getNewMongoSession
} from "../../configuration/dbConnection.js";

const addAddress = asyncHandler (async (req, res) => {
    console.log("addAddress working", req.body);
    let  session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            stateCode, countryCode, pincode, address, city
        } = req.body;
        
        if ( fieldValidator(pincode) || fieldValidator(city) || fieldValidator(stateCode) || fieldValidator(countryCode) || fieldValidator(address)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
       
        const userAddressResp = await userAddress.find({
            address
        });

        console.log("address", userAddressResp, fieldValidator(userAddressResp));

        if (!fieldValidator(userAddressResp)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, AddAdressMessage.ADDRESS_ALREADY_EXIST);

        const resp = await saveAddAddressHelper(stateCode, countryCode, pincode, address, city, userId, session);

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);
      
        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, CommonMessage.DETAIL_SAVED_SUCCESSFULLY)
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

export default addAddress;