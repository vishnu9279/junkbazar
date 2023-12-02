"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import register from "../../controllers/users/register/register.controller.js";
import login from "../../controllers/users/login/login.controller.js";
import otpVerify from "../../controllers/users/login/otpVerify.controller.js";
import get_country_state_cities from "../../controllers/users/other_api/get_countries_state_cities.js";
import addScrap from "../../controllers/users/scrap/addScrap.controller.js";
import getScrap from "../../controllers/users/scrap/getScrap.controller.js";
import upload from "../../utils/multer.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/otpVerify").post(otpVerify);
router.route("/getCountries").get(get_country_state_cities);
router.route("/getScrap").get(authenticateJwtMiddleware, getScrap);
router.route("/addScrap").post(authenticateJwtMiddleware, upload.single("scrapImage"), addScrap);
export default router;