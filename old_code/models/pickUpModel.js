const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    address: {
        required: true,
        type: String
    },
    city: {
        required: true,
        type: String
    },
    fullName: {
        type: String
    },
    landmark: {
        required: true,
        type: String
    },
    notification: {
        default: true,
        type: Boolean 
    },
    orderId: {
        required: true,
        type: String
    },
    payment_method: {
        type: String 
    },
    payment_status: {
        type: String 
    },
    phoneNumber: {
        type: String
    },
    PickUp_Request_Status: {
        default: "Vendor_Only",
        type: String
    },
    pincode: {
        type: String
    },
    price: {
        type: Number 
    },
    quantity: {
        type: Number 
    },
    scrapItem: {
        ref: "Item",
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String
    },
    user: {
        ref: "user",
        type: mongoose.Schema.Types.ObjectId
    },
    vendorID: {
        ref: "user",
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true 
});

const Vendor = mongoose.model("pickUp", vendorSchema);

module.exports = Vendor;
