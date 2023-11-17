const UserModel = require("../models/userModel");
const ItemModel = require("../models/itemModel");
const otpService = require("../services/otpService");
// const { validationResult } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
require("dotenv").config();

exports.createVendor = async (req, res) => {
    try {
        validate(req, res);

        const {
            fullName,
            phoneNumber,
            landmark,
            password,
        } = req.body;
        const otp = otpService.generateOTP();
        // const otpSent = await otpService.sendOTP(phoneNumber, otp);
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        // if (otpSent) {
        const vendor = new UserModel({
            fullName,
            phoneNumber,
            landmark,
            OTP: otp,
            password: hashed,
            isVendor: true,
        });
        await vendor.save();
        res.status(201).json({
            message: "Vendor created successfully. OTP sent for verification." + otp,
            data: vendor._id
        });
        // } else {
        //     res.status(500).json({ error: "Failed to send OTP.", message: otp });
        // }
    } catch (error) {
        console.error("Error Vendor:", error);
        res.status(500).json({
            error: "An error occurred while creating the Vendor." + error.message,
        });
    }
};
exports.createCustomer = async (req, res) => {
    try {
        validate(req, res);

        const {
            fullName,
            phoneNumber,
            pincode,
            address,
            city,
            landmark,
            password,
        } = req.body;
        const otp = otpService.generateOTP();
        // const otpSent = await otpService.sendOTP(phoneNumber, otp);
        const salt = await bcrypt.genSalt(15);
        const hashed = await bcrypt.hash(password, salt);

        // if (otpSent) {
        const vendor = new UserModel({
            fullName,
            phoneNumber,
            pincode,
            address,
            city,
            landmark,
            OTP: otp,
            password: hashed,
            isVendor: false,
        });
        await vendor.save();
        // console.log(otp);
        res.status(201).json({
            message: "Customer created successfully. OTP sent for verification." + otp,
            data: vendor._id
        });
        // } else {
        //     res.status(500).json({ error: "Failed to send OTP.", message: otp });
        // }
    } catch (error) {
        // console.error("Error Vendor:", error);
        res.status(500).json({
            error: "An error occurred while creating the customer." + error.message,
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const userId = req.query.userID;
        const otp = otpService.generateOTP();

        await UserModel.findByIdAndUpdate(userId, { OTP: otp }, { new: true });

        res.status(200).json({ message: "The otp as been send to your phone number: " + otp });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        validate(req, res);
        const vendor = await UserModel.findById(req.query.userID);
        const { otp } = req.body;

        if (vendor.OTP != otp) {
            res.status(400).json({ message: "Invalid OTP" });
        }

        await UserModel.findByIdAndUpdate(
            vendor._id,
            { OTP: "", verified: true },
            { new: true }
        );

        res.status(200).json({ message: "User Verification Successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

exports.signInUser = async (req, res) => {
    try {
        validate(req, res);
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

        const userToken = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({
            status: "Success",
            data: userToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        validate(req, res);
        const { phoneNumber } = req.body;
        const user = await UserModel.findOne({ phoneNumber: phoneNumber });

        if (!user) {
            res.status(400).json({ message: "User does not exist" });
        }
        const otp = otpService.generateOTP();
        // const otpSent = await otpService.sendOTP(phoneNumber, otp);

        // if (!otpSent) {
        //     res.status(400).json({ message: "OTP not sent" });
        // }
        await UserModel.findByIdAndUpdate(user._id, { OTP: otp }, { new: true });

        res.status(200).json({ message: "An OTP have been sent to Your Phone OTP: " + otp, data: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verify_reset_password_otp = async (req, res) => {
    try {
        validate(req, res);
        const vendor = await UserModel.findById(req.query.userID);
        const { otp } = req.body;

        if (vendor.OTP != otp) {
            res.status(400).json({ message: "Invalid OTP" });
        }

        res
            .status(200)
            .json({ message: "User verified, You can change your password" });

        res.status(200).json({ message: "User Verification Successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await UserModel.findById(req.query.userID);

        if ((user.OTP = "")) {
            res
                .status(403)
                .json({ message: "You'er not Authorize to perform this action" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await UserModel.findByIdAndUpdate(
            user._id,
            {
                OTP: "",
                password: hashed,
            },
            { new: true }
        );

        res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await UserModel.findById(req.user.id);

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await UserModel.findByIdAndUpdate(
            user._id,
            {
                password: hashed,
            },
            { new: true }
        );

        res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.userDocuments = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);

        if (!user) res.status(400).json({ message: "User does not exist" });
        if (!user.verified) {
            res.status(400).json({ message: "User is not Verified" });
        }

        const files = req.files;
        // const urls = [];
        const image = async (path) => await cloudinary.uploads(path, "Images");

        if (!files) {
            res.status(400).json({ message: "Know file Uploaded" });
        }

        const updateObject = {};

        for (const fieldName of Object.keys(files)) {
            const file = files[ fieldName ][ 0 ]; // Access the file object using the field name
            const { path } = file;
            const newPath = await image(path);

            updateObject[ fieldName ] = newPath.url;
            fs.unlinkSync(path);
        }

        await UserModel.findByIdAndUpdate(user._id, updateObject, { new: true });

        res.status(200).json({ message: "Documents as been Uploaded" });

        // console.log(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

exports.getSingleUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.query.userID);

        if (!user) {
            res.status(404).json({ message: "User does not exist" });
        }

        res.status(200).json({
            status: "Success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUser = async (req, res) => {
    try {
        const users = await UserModel.find();

        if (users.length < 1) {
            res.status(403).json({ message: "No User Found" });
        }

        res.status(200).json({
            status: "Success",
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try {
        // const { name, quantity, price } = req.body;
        const userDetails = await UserModel.findById(req.user.id);

        if (!userDetails) res.status(400).json({ message: "You can not perform this Operation" });

        if (req.file) {
            const result = await cloudinary.uploads(req.file.path, "Images");
            userDetails.avatar = result.url;
        }

        await UserModel.findByIdAndUpdate(userDetails._id, req.body, { new: true });

        res.status(200).json({ message: "User updated successfully." });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: error });
    }
};
