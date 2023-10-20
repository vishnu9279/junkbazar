const Vendor = require("../models/vendorModel");
const otpService = require("../services/otpService");
const { validationResult } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");

exports.createVendor = async (req, res) => {
    try {
        validate(req, res);

        const { fullName, phoneNumber, pincode, address, city, landmark } =
            req.body;
        const otp = otpService.generateOTP();
        const otpSent = await otpService.sendOTP(phoneNumber, otp);

        if (otpSent) {
            const vendor = new Vendor({
                fullName,
                phoneNumber,
                pincode,
                address,
                city,
                landmark,
            });
            await vendor.save();

            res.status(201).json({
                message: "Customer created successfully. OTP sent for verification.",
            });
        } else {
            res.status(500).json({ error: "Failed to send OTP." });
        }
    } catch (error) {
        console.error("Error creating customer:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the customer." });
    }
};
