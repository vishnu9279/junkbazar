"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import get_country_state_cities from "../../controllers/other_api/get_countries_state_cities.controller.js";
import getVendorOrderInfo from "../../controllers/vendor/scrap/getVendorOrderInfo.controller.js";
import updateOrderStatus from "../../controllers/vendor/scrap/updateOrderStatus.controller.js";
import updateActiveStatus from "../../controllers/vendor/updateActiveStatus.controller.js";
import uploadDocument from "../../controllers/vendor/register/uploadDocuments.controller.js";
import generateS3UploadSignedUrl from "../../services/generateS3UploadSignedUrl.js";
import register from "../../controllers/vendor/register/register.controller.js";
import getScrapHistory from "../../controllers/vendor/scrap/getScrapHistory.controller.js";
import otpVerify from "../../controllers/vendor/login/otpVerify.controller.js";
import resendOtp from "../../controllers/vendor/login/resendOtp.controller.js";
import getVendorOrder from "../../controllers/vendor/scrap/getVendorOrder.controller.js";
import getCurrentUser from "../../controllers/vendor/getCurrentUser.controller.js";
import login from "../../controllers/vendor/login/login.controller.js";
import logout from "../../controllers/vendor/logout.controller.js";

import updateProfile from "../../controllers/vendor/updateProfile.controller.js";
import getPaymentType from "../../controllers/vendor/scrap/getPaymentType.controller.js";
import updatePaymentMethod from "../../controllers/vendor/scrap/updatePaymentMethod.controller.js";
import vendorScrapOrderConfirmation from "../../controllers/vendor/scrap/vendorScrapOrderConfirmation.controller.js";

router.route("/updateOrderStatus").post(authenticateJwtMiddleware, updateOrderStatus);
router.route("/getVendorOrderInfo").get(authenticateJwtMiddleware, getVendorOrderInfo);
router.route("/getScrapHistory").get(authenticateJwtMiddleware, getScrapHistory);
router.route("/getVendorOrder").get(authenticateJwtMiddleware, getVendorOrder);
router.route("/getCurrentUser").get(authenticateJwtMiddleware, getCurrentUser);
router.route("/generateS3UploadSignedUrl").post(generateS3UploadSignedUrl); // generateS3SignedUrl
router.route("/logout").get(authenticateJwtMiddleware, logout);
router.route("/getCountries").get(get_country_state_cities);
router.route("/uploadDocument").post(uploadDocument);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/updateActiveStatus").post(authenticateJwtMiddleware, updateActiveStatus);

router.route("/updateProfile").post(authenticateJwtMiddleware, updateProfile);
router.route("/getPaymentType").get(authenticateJwtMiddleware, getPaymentType);
router.route("/updatePaymentMethod").post(authenticateJwtMiddleware, updatePaymentMethod);

router.route("/vendorScrapOrderConfirmation").post(authenticateJwtMiddleware, vendorScrapOrderConfirmation);

export default router;