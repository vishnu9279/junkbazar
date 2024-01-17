"use strict";

import {
    basicConfigurationObject, CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";
import jsonwebtoken from "jsonwebtoken";
import helper from "../utils/helper.js";
import UserModel from "../model/users/user.model.js";
import AdminModel from "../model/admin/admin.model.js";
import Session from "../model/users/session.model.js";
import fieldValidator from "../utils/fieldValidator.js";
import RolesEnum from "../utils/roles.js";

const authenticateJwtMiddleware =  async(req, res, next) => {
    const authHeader = req.headers.authorization;
    // const ip = req.headers.ip;
    let user;

    try {
        if (!authHeader) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Authorization header is missing");

        const tokenParts = authHeader.split(" ");
        
        if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== "bearer") throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Invalid Authorization header format");
        
        const token = tokenParts[1];
        const currentTime = new Date().getTime();
        // Verify the token using the secret key (replace 'your_secret_key' with your actual secret key)
        const decoded = jsonwebtoken.verify(token, basicConfigurationObject.ACCESS_TOKEN_SECRET);

        // console.log({
        // authHeader,
        // decoded,
        // ip,
        // tokenParts
        // });

        // console.log("decoded", decoded);
        const encryptObj = await helper.decryptAnyData(decoded.encrypt);

        // console.log("encryptObj", encryptObj);
        // if (encryptObj.ip !== ip) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "unauthorized Token");

        if (currentTime > encryptObj.expiryTime) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Token Expired");

        // Attach the decoded payload to the request for later use in routes
        delete encryptObj.originalUrl;

        if (encryptObj.userRole < RolesEnum.ADMIN){
            console.log("User/Vendor Block Working in auth Middleware", encryptObj.userRole);

            user = await UserModel.findOne({
                userId: encryptObj.userId
            });
        }
        else {
            console.log("Admin Block Working in auth Middleware", encryptObj.userRole);
            user = await AdminModel.findOne({
                userId: encryptObj.userId
            }); 
        }

        if (user.accountBlocked) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Account Blocked");

        const SessionObj =  await Session.findOne({
            jwtId: encryptObj.jwtId,
            userId: encryptObj.userId
        });

        // console.log("SessionObj", SessionObj);

        if (fieldValidator(SessionObj)) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Session Expired");
        
        if (!SessionObj.enabled) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Session Expired");

        if (currentTime > SessionObj.expiryTime) throw new ApiError(statusCodeObject.HTTP_STATUS_UNAUTHORIZED, errorAndSuccessCodeConfiguration.HTTP_STATUS_UNAUTHORIZED, "Session Expired");

        req.decoded = encryptObj;
  
        next();
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

            return res.status(statusCodeObject.HTTP_STATUS_UNAUTHORIZED).json({
                error: "Invalid token" 
            });
        }
    }
};

export default authenticateJwtMiddleware;