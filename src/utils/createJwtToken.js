import jsonwebtoken from "jsonwebtoken";
import {
    basicConfigurationObject
} from "../utils/constants.js";

"use strict";

import helper from "../utils/helper.js";
import storeSession from "./storeSession.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

function convertStringToMilliseconds(timeString) {
    const match = timeString.match(/(\d+)([hms])/);

    if (!match) {
        // Handle invalid input or return default value
        return null;
    }

    const [ , value,
        unit ] = match;
    const numericValue = parseInt(value, 10);

    switch (unit) {
        case "h":
            return numericValue * 60 * 60 * 1000; // Convert hours to milliseconds
        case "m":
            return numericValue * 60 * 1000; // Convert minutes to milliseconds
        case "s":
            return numericValue * 1000; // Convert seconds to milliseconds
        default:
            // Handle unknown unit or return default value
            return null;
    }
}

const createJwtToken = async(userObj, originUrl, platform) => {
    console.log("createJwtToken", {
        originUrl,
        platform,
        userObj
    });
    try {
        const uniqueId = uid.stamp(32);
        const tokenExpiry = basicConfigurationObject.ACCESS_TOKEN_EXPIRY;
        const data = {
            ...userObj,
            originUrl,
            platform
        };

        const jwtOption = {
            algorithm: "HS256",
            audience: originUrl,
            expiresIn: tokenExpiry, 
            issuer: basicConfigurationObject.JWT_ISSSUER,
            jwtid: uniqueId
        };

        const encrypt = helper.encryptAnyData(data);

        data.encrypt = encrypt;
        const token = await jsonwebtoken.sign({
            encrypt
        }, basicConfigurationObject.ACCESS_TOKEN_SECRET, jwtOption);
        const match = tokenExpiry.match(/\d/);
        const exipryHr = (match) ? Number(match[0]) : "";
        const milliseconds = convertStringToMilliseconds(tokenExpiry);

        // console.log("token", token);
        await storeSession(data, jwtOption, exipryHr, milliseconds);

        return token;
    }
    catch (error) {
        console.error("Creating Errror", error); 
        throw error;
    }
};

export default createJwtToken;