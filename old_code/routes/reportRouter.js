const express = require("express");
const router = express.Router();

const { createReport, getAllReportDetails, getSingleReportDetails, updateReport, deleteReport } = require("../controllers/reportController");
const auth = require("../utils/auth");

router.route("/").get(getAllReportDetails);
router.route("/create").post(auth, createReport);
router.route("/update").patch(updateReport);
router.route("/delete").delete(deleteReport);
router.route("/details").get(getSingleReportDetails);

module.exports = router;