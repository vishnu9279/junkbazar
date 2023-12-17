"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import register from "../../controllers/vendor/register/register.controller.js";
import uploadDocument from "../../controllers/vendor/register/uploadDocuments.controller.js";
import login from "../../controllers/vendor/login/login.controller.js";
import otpVerify from "../../controllers/vendor/login/otpVerify.controller.js";
import get_country_state_cities from "../../controllers/other_api/get_countries_state_cities.js";
import resendOtp from "../../controllers/vendor/login/resendOtp.controller.js";
import getUserOrder from "../../controllers/vendor/scrap/getUserOrder.js";
import updateOrderStatus from "../../controllers/vendor/scrap/updateOrderStatus.js";
import logout from "../../controllers/vendor/logout.js";
import getCurrentUser from "../../controllers/vendor/getCurrentUser.js";
import generateS3UploadSignedUrl from "../../services/generateS3UploadSignedUrl.js";

router.route("/register").post(register);
router.route("/uploadDocument").post(uploadDocument);
router.route("/login").post(login);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/getCountries").get(get_country_state_cities);
router.route("/getUserOrder").get(authenticateJwtMiddleware, getUserOrder);
router.route("/updateOrderStatus").post(authenticateJwtMiddleware, updateOrderStatus);
router.route("/logout").get(authenticateJwtMiddleware, logout);
router.route("/getCurrentUser").get(authenticateJwtMiddleware, getCurrentUser);
router.route("/generateS3UploadSignedUrl").post(generateS3UploadSignedUrl); // generateS3SignedUrl

export default router;