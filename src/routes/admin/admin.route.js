"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import registerCreateAdmin_v1 from "../../controllers/admin/register/createAdmin.controller.js";
import otpVerify from "../../controllers/admin/login/otpVerify.controller.js";
import resendOtp from "../../controllers/admin/login/resendOtp.controller.js";
import login from "../../controllers/admin/login/login.controller.js";
import logout from "../../controllers/admin/logout.controller.js";
import addScrap from "../../controllers/admin/scraps/addScrap.controller.js";
import getUser from "../../controllers/admin/users/getUser.controller.js";
import getUserScrap from "../../controllers/admin/users/getUserScrap.controller.js";

router.route("/addScrap").post(authenticateJwtMiddleware, addScrap);

router.route("/registerCreateAdmin_v1").post(registerCreateAdmin_v1);
router.route("/logout").get(authenticateJwtMiddleware, logout);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/login").post(login);

router.route("/getUser").get(authenticateJwtMiddleware, getUser);
router.route("/getUserScrap").get(authenticateJwtMiddleware, getUserScrap);

export default router;