const express = require("express");
const router = express.Router();
const {
  createPickup,
  getPickupRequests,
  updatePickupRequest,
  cancelPickupRequest,
} = require("../controllers/pickupController");

router.post("/create", createPickup);

router.get("/requests", getPickupRequests);

router.put("/update/:id", updatePickupRequest);

router.put("/cancel/:id", cancelPickupRequest);

module.exports = router;
