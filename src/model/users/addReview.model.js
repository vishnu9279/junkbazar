"use strict";

import mongoose from "mongoose";
const addReviewSchems = new mongoose.Schema(
    {
        comment: {
            type: String
        },
        
        rating: {
            type: Number
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

const addReviewModel = mongoose.model("review", addReviewSchems);

export default addReviewModel;
