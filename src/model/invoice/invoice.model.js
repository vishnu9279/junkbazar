"use strict";

import mongoose from "mongoose";

const vendorInvoiceSchema = new mongoose.Schema(
    {
       
        dayNumber: {
            required: true,
            type: Number 
        },
        
        enabled: {
            default: true,
            type: Boolean
        },
       
        invoiceId: {
            required: true,
            type: String
        },
        
        items: {
            required: true,
            type: Array
        },
        
        monthNumber: {
            required: true,
            type: Number
        },
        
        totalPlatformFee: {
            required: true,
            type: Number
        },
        totalSaleAmount: {
            required: false,
            type: Number
        },
        totalSaleQuantity: {
            required: true,
            type: Number
        },
        
        userId: {
            ref: "user",
            required: true,
            type: String
        },
        weekNumber: {
            required: true,
            type: Number
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

// vendorInvoiceSchema.virtual("scraps", {
//     foreignField: "scrapId",
//     justOne: true,
//     localField: "scrapId",
//     ref: "Scrap"
// });
const InvoiceModel = mongoose.model("invoice", vendorInvoiceSchema);

export default InvoiceModel;
