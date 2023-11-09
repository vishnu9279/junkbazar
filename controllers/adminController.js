const UserModel = require("../models/userModel");
const otpService = require("../services/otpService");
const { validate } = require("../middleware/validationMiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createAdmin = async (req, res) => {
  try {
    validate(req, res);

    const { fullName, phoneNumber, password } = req.body;
    const otp = otpService.generateOTP();
    // const otpSent = await otpService.sendOTP(phoneNumber, otp);
    const salt = await bcrypt.genSalt(15);
    const hashed = await bcrypt.hash(password, salt);

    // if (otpSent) {
    const admin = new UserModel({
      fullName,
      phoneNumber,
      OTP: otp,
      password: hashed,
      isAdmin: true,
    });
    await admin.save();
    res.status(201).json({
      message: "admin created successfully. OTP sent for verification." + otp,
      data: admin._id,
    });
    // } else {
    //     res.status(500).json({ error: "Failed to send OTP.", message: otp });
    // }
  } catch (error) {
    console.error("Error admin:", error);
    res.status(500).json({
      error: "An error occurred while creating the admin." + error.message,
    });
  }
};

exports.verifyAdmin = async (req, res) => {
  try {
    validate(req, res);

    const admin = await UserModel.findById(req.query.adminID);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { otp } = req.body;

    if (!admin.OTP || admin.OTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await UserModel.findByIdAndUpdate(
      admin._id,
      { OTP: "", verified: true },
      { new: true }
    );

    return res.status(200).json({ message: "Admin Verification Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.signInAdmin = async (req, res) => {
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
