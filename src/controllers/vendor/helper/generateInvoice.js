"use strict";

import InvoiceModel  from "../../../model/invoice/invoice.model.js";
// import ApiError from "../../../utils/ApiError.js";
// import {
//     CommonMessage, registerMessage, statusCodeObject, errorAndSuccessCodeConfiguration, loginMessage
// } from "../../../utils/constants.js";
// import ApiResponse from "../../../utils/ApiSuccess.js";
import helper from "../../../utils/helper.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

const generateInvoice = async (orderObj, session) => {
    console.log("generateInvoice working", orderObj);

    try {
        const monthNumber = await helper.getMonthNumber();
        const weekNumber = await helper.getWeekNumber();
        const dayNumber = await helper.getDayNumber();

        // await InvoiceModel.findOneAndUpdate(
        //     {
        //         monthNumber,
        //         userId: orderObj.vendorId
        //     },
        //     {
        //         $addToSet: {
        //             items: orderObj.orderId
        //         },
        //         $inc: {
        //             totalPlatformFee: orderObj.markupFee,
        //             totalSaleAmount: orderObj.vendorFinalAmount,
        //             totalSaleQuantity: orderObj.VendorTotalScrapQuantity

        //         },
        //         $setOnInsert: {
        //             invoiceId: uid.rnd(6),
        //             monthNumber,
        //             type: "MONTHLY_INVOICE",
        //             userId: orderObj.vendorId
        //         }
        //     },
        //     {
        //         new: true,
        //         session: session,
        //         upsert: true
        //     }
        // );

        // await InvoiceModel.findOneAndUpdate(
        //     {
        //         userId: orderObj.vendorId,
        //         weekNumber
        //     },
        //     {
        //         $addToSet: {
        //             items: orderObj.orderId
        //         },
        //         $inc: {
        //             totalPlatformFee: orderObj.markupFee,
        //             totalSaleAmount: orderObj.vendorFinalAmount,
        //             totalSaleQuantity: orderObj.VendorTotalScrapQuantity

        //         },
        //         $setOnInsert: {
        //             invoiceId: uid.rnd(6),
        //             type: "WEEKLY_INVOICE",
        //             userId: orderObj.vendorId,
        //             weekNumber
        //         }
        //     },
        //     {
        //         new: true,
        //         session: session,
        //         upsert: true
        //     }
        // );
        const resp = await InvoiceModel.findOneAndUpdate(
            {
                dayNumber,
                userId: orderObj.vendorId
            },
            {
                $addToSet: {
                    items: orderObj.orderId
                },
                $inc: {
                    totalPlatformFee: orderObj.markupFee,
                    totalSaleAmount: orderObj.vendorFinalAmount,
                    totalSaleQuantity: orderObj.VendorTotalScrapQuantity

                },
                $setOnInsert: {
                    dayNumber,
                    invoiceId: uid.rnd(6),
                    monthNumber,
                    // type: "DAILY_INVOICE",
                    userId: orderObj.vendorId,
                    
                    weekNumber
                }
            },
            {
                new: true,
                session: session,
                upsert: true
            }
        );

        return resp;
    }
    catch (error) {
        console.error("Error while Creating Invoice", error);
        throw error;
    }
};

export default generateInvoice;