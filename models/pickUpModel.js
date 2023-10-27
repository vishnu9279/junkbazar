const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    scrapItems: [ {
        scrapItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        price: { type: Number },
        qty: { type: Number }
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
    },
    payment_method: { type: String },
    totalPrice: { type: Number },
    totalQuantity: { type: Number },
    notification: { type: Boolean, default: true },
}, { timestamps: true });

const Vendor = mongoose.model("pickUp", vendorSchema);

module.exports = Vendor;
