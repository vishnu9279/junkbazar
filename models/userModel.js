const mongoose = require("mongoose");
const RolesEnum = require('../utils/roles')
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
      // required: true,
    },
    address: {
      type: String,
      // required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    landmark: {
      type: String,
      // required: true,
    },
    feedBack: {
      type: String,
    },
    working_hours: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    roles:{
      type:Number,
      default:RolesEnum.USER
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
      type: String,
      default: "Offline",
    },
    avatar: String,
    pan_card: String,
    adhar_card: String,
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
