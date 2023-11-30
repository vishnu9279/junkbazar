const express = require("express");
const router = express.Router();

const { sendPickUpRequest, updatePickUpRequest, deletePickUpRequest, getAllPickUpRequest, getPickUpRequestDetails } = require("../controllers/pickUpController");
const auth = require("../utils/auth");

router.route("/").get(getAllPickUpRequest);
router.route("/create").post(auth, sendPickUpRequest);
router.route("/update").patch(updatePickUpRequest);
router.route("/delete").delete(deletePickUpRequest);
router.route("/details").get(getPickUpRequestDetails);

module.exports = router;