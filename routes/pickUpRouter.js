const express = require("express");
const router = express.Router();

const { sendPickUpRequest, updatePickUpRequest, deletePickUpRequest, getAllPickUpRequest, getPickUpRequestDetails } = require("../controllers/pickUpController");

router.route("/").get(getAllPickUpRequest);
router.route("/create").post(sendPickUpRequest);
router.route("/update").patch(updatePickUpRequest);
router.route("/delete").delete(deletePickUpRequest);
router.route("/details").get(getPickUpRequestDetails);

module.exports = router;