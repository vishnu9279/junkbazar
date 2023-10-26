const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    scrapItems: [ {
        scrapItems: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "scrapItem"
        },
        totalPrice: { type: Number },
        totalQuantity: { type: Number }
    } ],
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
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
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
