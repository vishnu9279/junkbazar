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
import updateOrderStatus from "../../controllers/vendor/scrap/updateOrderStatus.js";
import logout from "../../controllers/vendor/logout.js";
import getCurrentUser from "../../controllers/vendor/getCurrentUser.js";
import generateS3UploadSignedUrl from "../../services/generateS3UploadSignedUrl.js";

import getVendorOrder from "../../controllers/vendor/scrap/getVendorOrder.js";
import getVendorOrderInfo from "../../controllers/vendor/scrap/getVendorOrderInfo.js";

router.route("/register").post(register);
router.route("/uploadDocument").post(uploadDocument);
router.route("/login").post(login);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/getCountries").get(get_country_state_cities);
router.route("/getVendorOrder").get(authenticateJwtMiddleware, getVendorOrder);
router.route("/updateOrderStatus").post(authenticateJwtMiddleware, updateOrderStatus);
router.route("/logout").get(authenticateJwtMiddleware, logout);
router.route("/getCurrentUser").get(authenticateJwtMiddleware, getCurrentUser);
router.route("/generateS3UploadSignedUrl").post(generateS3UploadSignedUrl); // generateS3SignedUrl
router.route("/getVendorOrderInfo").get(authenticateJwtMiddleware, getVendorOrderInfo);

export default router;