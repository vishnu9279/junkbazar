"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import register from "../../controllers/users/register/register.controller.js";
import login from "../../controllers/users/login/login.controller.js";
import otpVerify from "../../controllers/users/login/otpVerify.controller.js";
import get_country_state_cities from "../../controllers/other_api/get_countries_state_cities.js";
import addScrap from "../../controllers/admin/addScrap.controller.js";
import addScrapQuantity from "../../controllers/users/scrap/addScrapQuantity.controller.js";
import getScrap from "../../controllers/users/scrap/getScrap.controller.js";
import addPickUpAddress from "../../controllers/users/scrap/addPickUpAddress.controller.js";
// import getUserPickupAddress from "../../controllers/users/scrap/getUserPickupAddress.controller.js";
// import confirmPickRequest from "../../controllers/users/scrap/confirmPickRequest.controller.js";
// import upload from "../../utils/multer.js";
import generateS3UploadSignedUrl from "../../services/generateS3UploadSignedUrl.js";
// import getUserScrap from "../../controllers/users/scrap/getUserScrap.controller.js";
import contactUs from "../../controllers/other_api/contactUs.js";

// Cart
import getAddToCart from "../../controllers/other_api/getAddToCart.js";
import addToCart from "../../controllers/users/scrap/addToCart.js";
import removeFormCart from "../../controllers/users/scrap/removeFromCart.js";
import resendOtp from "../../controllers/users/login/resendOtp.controller.js";

router.route("/resendOtp").post(resendOtp);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/otpVerify").post(otpVerify);
router.route("/getCountries").get(get_country_state_cities);
router.route("/getScrap").get(getScrap);
// router.route("/getUserScrap").get(authenticateJwtMiddleware, getUserScrap);
router.route("/addScrap").post(authenticateJwtMiddleware, addScrap);
// router.route("/confirmPickRequest").post(authenticateJwtMiddleware, confirmPickRequest);
router.route("/generateS3UploadSignedUrl").post(authenticateJwtMiddleware, generateS3UploadSignedUrl); // generateS3SignedUrl
router.route("/addScrapQuantity").post(authenticateJwtMiddleware, addScrapQuantity);
router.route("/addPickUpAddress").post(authenticateJwtMiddleware, addPickUpAddress);
router.route("/contactUs").post(contactUs);
// router.route("/getUserPickupAddress").get(authenticateJwtMiddleware, getUserPickupAddress);

// Cart
router.route("/getAddToCart").get(authenticateJwtMiddleware, getAddToCart);
router.route("/addToCart").post(authenticateJwtMiddleware, addToCart);
router.route("/removeFormCart").post(authenticateJwtMiddleware, removeFormCart);
// router.route("/getAddToCart").get(getAddToCart);

export default router;