const mongoose = require("mongoose");
const RolesEnum = require("../../src/utils/roles");
const vendorSchema = new mongoose.Schema(
    {
        address: {
            type: String
            // required: true,
        },
        city: {
            type: String
            // required: true,
        },
        feedBack: {
            type: String
        },
        fullName: {
            required: true,
            type: String
        },
        avatar: String,
        landmark: {
            type: String
            // required: true,
        },
        adhar_card: String,
        OTP: {
            type: String
        },
        items: [
            {
                ref: "Item",
                type: mongoose.Schema.Types.ObjectId
            }
        ],
        password: {
            required: true,
            type: String
        },
        phoneNumber: {
            required: true,
            type: String,
            unique: true
        },
        pan_card: String,
    
        pincode: {
            type: String
            // required: true,
        },
        
        roles: {
            default: RolesEnum.USER,
            type: Number
        },

        // isVendor: {
        //   type: Boolean,
        //   default: false,
        // },
        // isAdmin: {
        //   type: Boolean,
        //   default: false,
        // },
        status: {
            default: "Offline",
            type: String
        },

        verified: {
            default: false,
            type: Boolean
        },
        
        working_hours: {
            type: String
        }
    },
    {
        timestamps: true 
    }
);

const Vendor = mongoose.model("users", vendorSchema);

module.exports = Vendor;
