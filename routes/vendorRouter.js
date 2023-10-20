const express = require("express");
const router = express.Router();
const { createVendor } = require("../controllers/vendorController");

router.post("/register", createVendor);

module.exports = router;
