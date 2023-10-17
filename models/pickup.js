const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Completed", "Cancelled"],
    default: "Pending",
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
});

const Pickup = mongoose.model("Pickup", pickupSchema);

module.exports = Pickup;
