"use strict";

import {
    Router
} from "express";

const router = Router();

// import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import register from "../../controllers/vendor/register/register.controller.js";
import uploadDocument from "../../controllers/vendor/register/uploadDocuments.controller.js";
import login from "../../controllers/vendor/login/login.controller.js";
import otpVerify from "../../controllers/vendor/login/otpVerify.controller.js";
import get_country_state_cities from "../../controllers/other_api/get_countries_state_cities.js";
import resendOtp from "../../controllers/vendor/login/resendOtp.controller.js";

router.route("/register").post(register);
router.route("/uploadDocument").post(uploadDocument);
router.route("/login").post(login);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/getCountries").get(get_country_state_cities);

export default router;