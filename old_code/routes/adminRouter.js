const express = require("express");
const router = express.Router();
const {
  createAdmin,
  signInAdmin,
  verifyAdmin,
} = require("../controllers/adminController");
const auth = require("../utils/auth");

router.post("/register/admin", createAdmin);
router.route("/login").post(signInAdmin);
router.route("/verify/admin").patch(verifyAdmin);

module.exports = router;
