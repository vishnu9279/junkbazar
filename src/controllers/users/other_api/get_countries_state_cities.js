"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import Country  from "../../../model/countries.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration 
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";

const get_country_state_cities = asyncHandler (async (req, res) => {
    console.log("get_country_state_cities working", req.body);
    
    try {
        const country = await Country.findOne({
            iso2: "IN"
        });

        if (fieldValidator(country)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_NO_CONTENT, errorAndSuccessCodeConfiguration.HTTP_STATUS_NO_CONTENT, registerMessage.ERROR_USER_NOT_FOUND);
        
        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, country, CommonMessage.MESSAGE_SUCCESS)
        );
    }
    catch (error) {
        console.error("Error while Login User", error.message);
        // await session.abortTransaction();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in loginUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default get_country_state_cities;