const express = require("express");
const router = express.Router();
const { createCustomer } = require("../controllers/customerController");

router.post("/register", createCustomer);

module.exports = router;
