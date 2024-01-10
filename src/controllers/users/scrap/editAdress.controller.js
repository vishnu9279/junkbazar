"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import userAddress  from "../../../model/users/userAdress.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, AddAdressMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";

const editAddress = asyncHandler (async (req, res) => {
    console.log("editAddress working", req.body);
    let  session;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const {
            stateCode, countryCode, pincode, address, city, addressId
        } = req.body;
        
        if ( fieldValidator(addressId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
       
        const userAddressResp = await userAddress.find({
            address
        });

        console.log("address", userAddressResp, fieldValidator(userAddressResp));

        if (fieldValidator(userAddressResp)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, AddAdressMessage.ADDRESS_NOT_FOUND);

        const updateObj = {};

        if (!fieldValidator(stateCode)) updateObj.stateCode = stateCode;

        if (!fieldValidator(countryCode)) updateObj.countryCode = countryCode;

        if (!fieldValidator(pincode)) updateObj.pincode = pincode;

        if (!fieldValidator(address)) updateObj.address = address;

        if (!fieldValidator(city)) updateObj.city = city;

        const resp = await userAddress.findOneAndUpdate({
            addressId,
            userId
        }, {
            $set: updateObj
        }, {
            session: session
        });

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

export default editAddress;