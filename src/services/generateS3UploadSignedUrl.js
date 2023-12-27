"use strict";

import asyncHandler from "../utils/asyncHandler.js";
import fieldValidator from "../utils/fieldValidator.js";
import ApiError from "../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration
} from "../utils/constants.js";
import helper from "../utils/helper.js";
import ApiResponse from "../utils/ApiSuccess.js";
import uploadFile from "../utils/uploadFile.js";

const generateS3UploadSignedUrl = asyncHandler (async (req, res) => {
    console.log("generateS3UploadSignedUrl working", req.body);

    try {
        const {
            fileName, ContentType, uploadType, userId
        } = req.body;

        if (fieldValidator(fileName) || fieldValidator(ContentType) || fieldValidator(userId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const uploadTypeSchema = helper.getCacheElement("CONFIG", uploadType);

        console.log("uplodTypeschema", uploadTypeSchema);

        if (fieldValidator(uploadTypeSchema)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        console.log("uploadTypeSchema", uploadTypeSchema[uploadType]);

        // if (fieldValidator(uploadTypeSchema[uploadType])) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const imageSignedUrlObj =  await uploadFile(userId, uploadTypeSchema.toLowerCase(), fileName, ContentType);

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, imageSignedUrlObj, CommonMessage.SIGNED_URL_GENERATED_SUCCESSFULLY)
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

export default generateS3UploadSignedUrl;