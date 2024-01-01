"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserPickAddress  from "../../../model/users/userOrder.model.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    ScrapMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import generateS3SignedUrl from "../../../services/generateS3SignedUrl.js";

const getPendingOrdersAssignToAdmin = asyncHandler(async (req, res) => {
    console.log("getPendingOrdersAssignToAdmin working");

    try {
        let limit = req.query.limit;
        let page = req.query.page;
        const filterValue = req.query.filterValue;
        const userId = req.decoded.userId;
        const scrapName = req.query.scrapName;

        if (fieldValidator(limit) || isNaN(page)) limit = 10;

        if (fieldValidator(page) || isNaN(page)) page = page || 0;

        const skip = page * limit;
        const filterObj = {};
        const scrapFilterObj = {};

        if (!fieldValidator(filterValue)){
            filterObj.$or = [
                {
                    fullName: new RegExp(filterValue, "i")
                },
                {
                    phoneNumber: new RegExp(filterValue, "i")
                },
                {
                    city: new RegExp(filterValue, "i")
                },
                {
                    stateCode: new RegExp(filterValue, "i")
                }
            ];
        }

        if (!fieldValidator(scrapName))
            scrapFilterObj.scrapName = new RegExp(scrapName, "i");

        const scraps = await UserPickAddress.aggregate([
            {
                $match: filterObj
            },
            {
                $lookup: {
                    as: "scrapInfo",
                    foreignField: "scrapId",
                    from: "scraps",
                    localField: "scrapId",
                    pipeline: [{
                        $match: scrapFilterObj
                    }]
                }
            },
            
            {
                $unwind: "$scrapInfo"
            },
            {
                $sort: {
                    createdAt: -1  // Sort in descending order based on the createdAt field
                }
            },
            {
                $skip: parseInt(skip)  // Add the skip stage
            },
            {
                $limit: parseInt(limit)  // Add the limit stage
            }
        ]);

        for (const scrap of scraps){
            const vendors =  await UserModel.find({
                $or: [{
                    city: scrap.city
                },
                {
                    stateCode: scrap.stateCode
                }],
                managedBy: userId
            });

            if (!fieldValidator(vendors))
                scrap.vendors = vendors;
            
            const url = await generateS3SignedUrl(scrap.scrapInfo.docPath);

            scrap.scrapInfo.docUrl = url;
        }

        const totalScrapCount = await UserPickAddress.countDocuments(filterObj);

        const finalObj = {
            scrap: scraps,
            totalScrapCount
        };

        // console.log("finalObj", finalObj, filterObj);

        return res.status(statusCodeObject.HTTP_STATUS_OK).json(
            new ApiResponse(
                statusCodeObject.HTTP_STATUS_OK,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                finalObj,
                ScrapMessage.SCRAP_SUCCESSFULLY_SAVED
            )
        );
    }
    catch (error) {
        console.error("Error on getting scrap", error.message);

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in getPendingOrdersAssignToAdmin:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default getPendingOrdersAssignToAdmin;
