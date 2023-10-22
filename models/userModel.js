const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
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
        default: false
    },
    isVendor: {
        type: Boolean,
        default: false
    },
    documents: [ {
        name: { type: String },
        url: { type: String }
    } ]
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
