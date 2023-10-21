const UserModel = require("../models/userModel");
const otpService = require("../services/otpService");
const { validationResult } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createVendor = async (req, res) => {
    try {
        validate(req, res);

        const { fullName, phoneNumber, pincode, address, city, landmark, password } =
            req.body;
        const otp = otpService.generateOTP();
        const otpSent = await otpService.sendOTP(phoneNumber, otp);
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        if (otpSent) {
            const vendor = new UserModel({
                fullName,
                phoneNumber,
                pincode,
                address,
                city,
                landmark,
                OTP: otp,
                password: hashed,
                isVendor: true
            });
            await vendor.save();
            console.log(otp);
            res.status(201).json({
                message: "Vendor created successfully. OTP sent for verification.",
            });
        } else {
            res.status(500).json({ error: "Failed to send OTP." });
        }
    } catch (error) {
        console.error("Error Vendor:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the customer." + error.message });
    }
};
exports.createCustomer = async (req, res) => {
    try {
        validate(req, res);

        const { fullName, phoneNumber, pincode, address, city, landmark, password } =
            req.body;
        const otp = otpService.generateOTP();
        const otpSent = await otpService.sendOTP(phoneNumber, otp);
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        if (otpSent) {
            const vendor = new UserModel({
                fullName,
                phoneNumber,
                pincode,
                address,
                city,
                landmark,
                OTP: otp,
                password: hashed,
                isVendor: false
            });
            await vendor.save();
            console.log(otp);
            res.status(201).json({
                message: "Vendor created successfully. OTP sent for verification.",
            });
        } else {
            res.status(500).json({ error: "Failed to send OTP." });
        }
    } catch (error) {
        console.error("Error Vendor:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the customer." + error.message });
    }
};

exports.verifyVendor = async (req, res) => {
    try {
        const vendor = await UserModel.findById(req.query.vendorID);
        const { otp } = req.body;

        if (vendor.OTP != otp) {
            res.status(400).json({ message: "Invalid OTP" });
        }

        await UserModel.findByIdAndUpdate(vendor._id, { OTP: "", verified: true }, { new: true });

        res.status(200).json({ message: "User Verification Successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

exports.signInVendor = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await UserModel.findOne({ phoneNumber: phoneNumber });

        if (!user) {
            res.status(400).json({ message: "User does not exist" });
        }
        if (!user.verified) {
            res.status(400).json({ message: "User is not Verified" });
        }

        const checkedPassword = await bcrypt.compare(password, user.password);
        if (!checkedPassword) {
            res.status(400).json({ message: "Incorrect Password" });
        }

        const userToken = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRED_DATE });

        res.status(200).json({
            status: "Success",
            data: userToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};