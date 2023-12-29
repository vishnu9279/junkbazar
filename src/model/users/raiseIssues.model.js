"use strict";

import mongoose from "mongoose";
const raiseIssuesSchems = new mongoose.Schema(
    {
        addToCartId: {
            required: true,
            type: String
        },
        
        comment: {
            required: true,
            type: String
        },
       
        scrapId: {
            required: true,
            type: String
        },
        userId: {
            required: true,
            type: String
        },
        
        VendorId: {
            required: true,
            type: String
        }
    },
    {
        timestamps: true 
    }
);

const raiseIssuesModel = mongoose.model("raise_issues", raiseIssuesSchems);

export default raiseIssuesModel;
