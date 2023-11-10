const UserModel = require("../models/userModel");
const reportModel = require("../models/reportModel");
const mongoose = require("mongoose");

exports.createReport = async (req, res) => {
    try {
        const getUserDetails = await UserModel.findById(req.user.id);
        if (!getUserDetails) {
            res.status(400).json({ message: "User does not exist" });
        }
        const newReport = new reportModel(req.body);

        newReport.user = getUserDetails._id;
        newReport.save();

        res.status(201).json({ message: "Report was sent to the Admin" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

exports.getAllReportDetails = async (req, res) => {
    try {
        const reports = await reportModel.find();

        res.status(200).json({ status: "Success", data: reports });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getSingleReportDetails = async (req, res) => {
    try {
        const reportDetails = await reportModel(req.query.reportID);

        if (!reportDetails) {
            req.status(400).json({ message: "report does not exist" });
        }

        res.status(200).json({ status: "Success", data: reportDetails });
    } catch (error) {
        res.status(error).json({ message: error });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const reportDetails = await reportModel(req.query.reportID);

        if (!reportDetails) {
            req.status(400).json({ message: "report does not exist" });
        }

        await reportModel.findByIdAndUpdate(reportDetails._id, req.body, { new: true });

        res.status(200).json({ message: "Report Updated Successfully" });
    } catch (error) {
        res.status(error).json({ message: error });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const reportDetails = await reportModel(req.query.reportID);

        if (!reportDetails) {
            req.status(400).json({ message: "report does not exist" });
        }

        await reportModel.findByIdAndDelete(reportDetails._id);

        res.status(200).json({ message: "Report Deleted Successfully" });
    } catch (error) {
        res.status(error).json({ message: error });
    }
};