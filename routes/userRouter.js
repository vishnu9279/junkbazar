const express = require("express");
const router = express.Router();
const {
    createVendor,
    createCustomer,
    verifyUser,
    signInUser,
    forgetPassword,
    verify_reset_password_otp,
    resetPassword,
    userDocuments,
    getSingleUser,
    getAllUser
} = require("../controllers/userController");
const upload = require("../utils/multer");
const auth = require("../utils/auth");

router.route("/profile").get(auth, getSingleUser);
router.route("/").get(auth, getAllUser);
router.post("/register/vendor", createVendor);
router.post("/register/customer", createCustomer);
router.route("/login").post(signInUser);
router.route("/verify").patch(verifyUser);
router.route("/forget-password").patch(forgetPassword);
router.route("/verify-password-otp").patch(verify_reset_password_otp);
router.route("/reset-password").patch(resetPassword);
router.route("/upload").patch(
    upload.fields([
        // { name: 'avatar' },
        { name: "pan_card" },
        { name: "file3" },
    ]),
    userDocuments
);

module.exports = router;
