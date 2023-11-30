const UserModel = require("../models/userModel");
const PickUpModel = require("../models/pickUpModel");

const mongoose = require("mongoose");

const generateOrderID = () => {
    let digits = "0123456789";
    let OTPCode = "";
    for (let i = 0; i < 6; i++) {
        OTPCode += digits[ Math.floor(Math.random() * 10) ];
    }
    return OTPCode;
};
exports.sendPickUpRequest = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) res.status(404).json("User does not exist");
        const orderID = generateOrderID();
        const PickUpRequest = new PickUpModel(req.body);

        PickUpRequest.user = user._id;
        PickUpRequest.orderId = orderID;
        PickUpRequest.save();

        res.status(201).json({ message: "Pickup Request as been created" });
    } catch (error) {
        res.status(500).json({ message: error });
        console.log(error);
    }
};

exports.updatePickUpRequest = async (req, res) => {
    try {
        const getPickUpDetails = await PickUpModel.findById(req.query.PickUpRequestId);
        if (!getPickUpDetails) res.status(400).json({ message: "Pickup Request does not exist" });

        await PickUpModel.findByIdAndUpdate(getPickUpDetails._id, req.body, { new: true });

        res.status(200).json({ message: "Pickup Request as been Updated" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.deletePickUpRequest = async (req, res) => {
    try {
        const getPickUpDetails = await PickUpModel.findById(req.query.PickUpRequestId);
        if (!getPickUpDetails) res.status(400).json({ message: "Pickup Request does not exist" });

        await PickUpModel.findByIdAndDelete(getPickUpDetails._id);

        res.status(200).json({ message: "Pickup Request as been Deleted" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getAllPickUpRequest = async (req, res) => {
    try {
        const getPickUpList = await PickUpModel.find().populate("scrapItem");
        if (getPickUpList < 1) res.status(400).json({ message: "Know Pickup Request Foundt" });

        res.status(200).json({
            status: "Successful",
            data: getPickUpList
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getPickUpRequestDetails = async (req, res) => {
    try {
        const getPickUpDetails = await PickUpModel.findById(req.query.PickUpRequestId);
        if (!getPickUpDetails) res.status(400).json({ message: "Pickup Request does not exist" });;

        res.status(200).json({
            status: "Successful",
            data: getPickUpDetails
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};