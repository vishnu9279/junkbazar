"use strict";

import userAddress  from "../../model/users/userAdress.model.js";
import fieldValidator from "../../utils/fieldValidator.js";
import ApiError from "../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../../utils/constants.js";
import helper from "../../utils/helper.js";

import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

const saveAddAddressHelper =  async (stateCode, countryCode, pincode, address, city, userId, fullName, dialCode, phoneNumber, session ) => {
    console.log("saveAddAddressHelper working", stateCode, countryCode, pincode, address, city);
    
    const currentTime = new Date().getTime();

    try {
        if ( fieldValidator(pincode) || fieldValidator(city) || fieldValidator(stateCode) || fieldValidator(countryCode) || fieldValidator(address)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
      
        const addressObj = {
            address,
            addressId: uid.rnd(6),
            city,
            countryCode,
            currentTime,
            dayNumber: await helper.getDayNumber(),
            dialCode,
            fullName,
            monthNumber: await helper.getMonthNumber(),
            phoneNumber,
            pincode: parseInt(pincode),
            stateCode,
            userId,
            weekNumber: await helper.getWeekNumber()
        };
        const addressMap = new userAddress(addressObj);

        const resp = await addressMap.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        return resp;
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
       
        throw error;
    }
};

export default saveAddAddressHelper;