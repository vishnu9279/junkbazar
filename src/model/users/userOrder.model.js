"use strict";

import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema({
    amount: {
        required: true,
        type: Number 
    },
    isVendorUpdatedStatus: {
        type: Boolean
    },
    price: {
        required: true,
        type: Number
    },
    quantity: {
        required: true,
        type: Number 
    },
    quantityType: {
        type: String 
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
    },
    userAmount: {
        required: false,
        type: Number
    },
    userQuantity: {
        required: false,
        type: Number 
    },
    vendorAmount: {
        required: false,
        type: Number
    },
    vendorPrice: {
        required: false,
        type: Number
    },
    vendorQuantity: {
        required: false,
        type: Number
    }

}, {
    _id: false
});

const userPickupSchema = new mongoose.Schema(
    {
        address: {
            type: String
        },
        addressId: {
            type: String
        },
        addToCartId: {
            required: true,
            type: String
        },
        city: {
            type: String 
        },
        comment: {
            type: String
        },
        countryCode: {
            type: String
        },
        currentTime: {
            required: true,
            type: Number
        },
        dayNumber: {
            required: true,
            type: Number 
        },
        dialCode: {
            required: true,
            type: String
        },
        docUrl: {
            required: false,
            type: String
        },
        enabled: {
            default: true,
            type: Boolean
        },
        finalAmount: {
            required: true,
            type: Number
        },
        fullName: {
            required: true,
            type: String
        },
        isAdminApprovedPaymentStatus: {
            type: String
        },
        isPaid: {
            type: Boolean
        },
        
        items: [ orderItemSchema ],
        
        markupFee: {
            type: Number
        },
        markupFeePercentage: {
            required: false,
            type: Number
        },
        monthNumber: {
            required: true,
            type: Number
        },
        orderId: {
            required: true,
            type: String
        },
        orderStatus: {
            default: 0,
            required: true,
            type: Number
        },
        
        paymentDocUrl: {
            type: String 
        },
        
        paymentScreenShotImageKey: {
            type: String
        },
        paymentType: {
            type: String
        },
        phoneNumber: {
            required: true,
            type: Number
        },
        pincode: {
            type: Number
        },
        rating: {
            type: Number
        },
        rejectionReason: {
            type: String
        },
        stateCode: {
            type: String
        },
        totalQuantity: {
            required: true,
            type: Number
        },
        transactionOrUtrNumber: {
            type: String
        },
        userFinalAmount: {
            required: true,
            type: Number
        },
        userId: {
            ref: "user",
            required: true,
            type: String
        },
        userIdF_k: {
            ref: "user",
            required: true, 
            type: mongoose.Schema.Types.ObjectId
        },
        vendorFinalAmount: {
            required: false,
            type: Number
        },
        vendorId: {
            type: String  
        },
        VendorTotalScrapQuantity: {
            required: false,
            type: Number
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

// userPickupSchema.virtual("scraps", {
//     foreignField: "scrapId",
//     justOne: true,
//     localField: "scrapId",
//     ref: "Scrap"
// });
const UserOrderModel = mongoose.model("user_order", userPickupSchema);

export default UserOrderModel;
