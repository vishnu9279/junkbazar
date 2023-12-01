"use strict";

import {
    Router
} from "express";

const router = Router();

import register from "../../controllers/users/register/register.controller.js";
import login from "../../controllers/users/login/login.controller.js";
import otpVerify from "../../controllers/users/login/otpVerify.controller.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/otpVerify").post(otpVerify);
export default router;