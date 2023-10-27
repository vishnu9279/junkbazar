const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        OTP: {
            type: String,
        },
        pincode: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        isVendor: {
            type: Boolean,
            default: false,
        },
        avatar: String,
        pan_card: String,
        file3: String,
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
            },
        ],
    },
    { timestamps: true }
);

const Vendor = mongoose.model("users", vendorSchema);

module.exports = Vendor;
