const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    scrapItems: [ {
        scrapItems: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        totalPrice: { type: Number },
        totalQuantity: { type: Number }
    } ],
    fullName: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    pincode: {
        type: String,
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
    status: {
        type: String,
        default: "Pending"
    },
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
