"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import uploadFile from "../../../utils/uploadFile.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();
const uniqueId = uid.rnd(6);

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
const addScrap = asyncHandler (async (req, res) => {
    console.log("addScrap working", req.body);
    let  session;
    const currentTime = new Date().getTime();

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        let scrapName = req.body.scrapName;
        const {
            price, quantityType, stateCode, countryCode
        } = req.body;
        const files = req.file;

        if (fieldValidator(scrapName) || fieldValidator(price) || fieldValidator(quantityType) || fieldValidator(files)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        scrapName = scrapName.toLowerCase();
        const scrap = await Scrap.findOne({
            $or: [
                {
                    scrapId: uniqueId
                },
                {
                    scrapName
                }
            ]
        });

        if (!fieldValidator(scrap)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        const imageObj =  await uploadFile(files, userId, "scrap");
        const scrapSaveObj = {
            countryCode,
            currentTime,
            docId: imageObj.docId,
            docPath: imageObj.docPath,
            docUrl: imageObj.url,
            price,
            quantityType,
            scrapId: uniqueId,
            scrapName,
            stateCode,
            userId
        };
        
        const ScrapModelObj = new Scrap(scrapSaveObj);

        const resp = await ScrapModelObj.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, ScrapMessage.SCRAP_SUCCESSFULLY_SAVED)
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

export default addScrap;