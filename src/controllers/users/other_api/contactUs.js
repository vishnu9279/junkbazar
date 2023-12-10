"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import contactUsModel  from "../../../model/users/contactUs.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();
const uniqueId = uid.rnd(6);

const contactUs = asyncHandler (async (req, res) => {
    console.log("UserPickAddress working", req.body);
   
    const currentTime = new Date().getTime();

    try {
        const {
            fullName,  pincode, dialCode, phoneNumber, address, message
        } = req.body;

        if (fieldValidator(fullName) || fieldValidator(message) || fieldValidator(pincode) || fieldValidator(dialCode) || fieldValidator(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
    
        const contactUsObj = {
            address,
            contactUsId: uniqueId,
            currentTime,
            dialCode,
            fullName,
            message,
            phoneNumber,
            pincode: parseInt(pincode)
        };
        
        const contact = new contactUsModel(contactUsObj);

        const resp = await contact.save();

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, CommonMessage.DETAIL_SAVED_SUCCESSFULLY)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
   
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

export default contactUs;