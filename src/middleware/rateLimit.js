"use strict";

import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, registerMessage
} from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";

function createRateLimiter() {
    const rateLimitMap = new Map();

    function isRateLimitExceeded(entry) {
        return entry.count > 10;
    }

    function cleanupRateLimitMap() {
        const now = Date.now();

        rateLimitMap.forEach((entry, ip) => {
            if (now - entry.lastAccess > 40 * 1000) 
                rateLimitMap.delete(ip);
        });
    }

    function middleware(req, res, next) {
        const clientIP = req.ip;

        if (!clientIP) {
            // Handle the case where clientIP is undefined (e.g., if req.ip is not available)
            throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, registerMessage.ERROR_USER_NOT_FOUND);
        }

        if (!rateLimitMap.has(clientIP)) {
            rateLimitMap.set(clientIP, {
                count: 1,
                lastAccess: Date.now() 
            });
        }
        
        else {
            const entry = rateLimitMap.get(clientIP);

            entry.count += 1;
            entry.lastAccess = Date.now();

            if (isRateLimitExceeded(entry)) 
                throw new ApiError(statusCodeObject.HTTP_STATUS_TOO_MANY_REQUESTS, errorAndSuccessCodeConfiguration.HTTP_STATUS_TOO_MANY_REQUESTS, CommonMessage.ERROR_MESSAGE_TOO_MANY_REQUESTS);
        }

        cleanupRateLimitMap();

        next();
    }

    return middleware;
}

const rateLimiter = createRateLimiter();

export default rateLimiter;
