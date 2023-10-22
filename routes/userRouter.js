const express = require("express");
const router = express.Router();
const { createVendor, createCustomer, verifyUser, signInUser, forgetPassword, verify_reset_password_otp, resetPassword, userDocuments } = require("../controllers/userController");
const upload = require("../utils/multer");

router.post("/register/vendor", createVendor);
router.post("/register/customer", createCustomer);
router.route("/login").post(signInUser);
router.route("/verify").patch(verifyUser);
router.route("/forget-password").patch(forgetPassword);
router.route("/verify-password-otp").patch(verify_reset_password_otp);
router.route("/reset-password").patch(resetPassword);
router.route("/upload").post(upload.array("documents"), userDocuments);

module.exports = router;
