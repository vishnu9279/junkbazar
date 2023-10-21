const express = require("express");
const router = express.Router();
const { createVendor, createCustomer, verifyVendor, signInVendor } = require("../controllers/userController");

router.post("/register/vendor", createVendor);
router.post("/register/customer", createCustomer);
router.route("/login").post(signInVendor);
router.route("/verify").patch(verifyVendor);

module.exports = router;
