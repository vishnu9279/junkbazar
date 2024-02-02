"use strict";

import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    amount: {
        required: true,
        type: Number 
    },
    price: {
        required: true,
        type: Number
    },
    quantity: {
        required: true,
        type: Number 
    },
    scrapId: {
        ref: "scrap",
        required: true,
        type: String 
    },
    scrapIdF_K: {
        ref: "scrap",
        required: true,
        type: mongoose.Schema.Types.ObjectId
    }

}, {
    _id: false
});

const cartSchema = new mongoose.Schema(
    {
        addToCartId: {
            required: true, 
            type: String 
        },
        docUrl: {
            type: String
        },
        enabled: {
            default: true,
            type: Boolean
        },
        items: [ cartItemSchema ],
        // quantity: {
        //     required: true,
        //     type: Number
        // },
        // scrapId: {
        //     ref: "scrap",
        //     required: true,
        //     type: String
        // },
        // scrapIdF_K: {
        //     ref: "scrap",
        //     required: true,
        //     type: mongoose.Schema.Types.ObjectId
        // },
        userId: {
            required: true,
            type: String
        },
        userIdF_k: {
            ref: "user",
            required: true, 
            type: mongoose.Schema.Types.ObjectId
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

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;
