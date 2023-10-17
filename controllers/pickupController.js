const Pickup = require("../models/pickup");
const { sendOTP } = require("../services/otpService");
const { generateOTP } = require("../utils/otpUtils");
const { check, validationResult } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");

exports.createPickup = async (req, res) => {
  try {
    const validationRules = [
      check("userId").notEmpty(),
      check("pickupDate").notEmpty(),
      check("timeSlot").notEmpty(),
      check("address").notEmpty(),
      check("landmark").notEmpty(),
      check("pincode").notEmpty(),
      check("city").notEmpty(),
      check("mobileNumber").notEmpty(),
    ];

    validationRules.forEach((rule) => rule(req, res, () => {}));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      pickupDate,
      timeSlot,
      address,
      landmark,
      pincode,
      city,
      mobileNumber,
    } = req.body;

    const otp = generateOTP();
    const otpSent = await sendOTP(mobileNumber, otp);

    if (!otpSent) {
      return res.status(400).json({ message: "OTP verification failed." });
    }

    const pickup = new Pickup({
      userId,
      pickupDate,
      timeSlot,
      address,
      landmark,
      pincode,
      city,
      mobileNumber,
      otp,
      status: "Pending",
    });

    await pickup.save();

    res.status(201).json({ message: "Pickup request created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create pickup request." });
  }
};

exports.getPickupRequests = async (req, res) => {
  try {
    const pickupRequests = await Pickup.find();
    res.status(200).json(pickupRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve pickup requests." });
  }
};

exports.updatePickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Status is required for updating pickup request." });
    }

    const updatedPickup = await Pickup.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPickup) {
      return res.status(404).json({ message: "Pickup request not found." });
    }

    res.status(200).json(updatedPickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update pickup request." });
  }
};

exports.cancelPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const canceledPickup = await Pickup.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      { new: true }
    );

    if (!canceledPickup) {
      return res.status(404).json({ message: "Pickup request not found." });
    }

    res.status(200).json(canceledPickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel pickup request." });
  }
};
