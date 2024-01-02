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
import generateS3UploadSignedUrl from "../../controllers/admin/scraps/generateS3UploadSignedUrl.js";
import editScrap from "../../controllers/admin/scraps/editScrap.controller.js";
import getScrap from "../../controllers/admin/scraps/getScrap.controller.js";
import getVendor from "../../controllers/admin/vendor/getVendor.controller.js";
import getPendingOrdersAssignToAdmin from "../../controllers/admin/orders/getPendingOrdersAssignToAdmin.js";
import createVendor from "../../controllers/admin/vendor/createVendor.controller.js";
import assignOrderToVendor from "../../controllers/admin/orders/assignOrderToVendor.controller.js";
import "../../crons/moveScrapToAdmin.cron.js";

router.route("/addScrap").post(authenticateJwtMiddleware, addScrap);

router.route("/registerCreateAdmin_v1").post(registerCreateAdmin_v1);
router.route("/logout").get(authenticateJwtMiddleware, logout);
router.route("/resendOtp").post(resendOtp);
router.route("/otpVerify").post(otpVerify);
router.route("/login").post(login);

router.route("/getUser").get(authenticateJwtMiddleware, getUser);
router.route("/getScrap").get(authenticateJwtMiddleware, getScrap);
router.route("/getUserScrap").get(authenticateJwtMiddleware, getUserScrap);
router.route("/generateS3UploadSignedUrl").post(authenticateJwtMiddleware, generateS3UploadSignedUrl);
router.route("/editScrap").post(authenticateJwtMiddleware, editScrap);
router.route("/getVendor").get(authenticateJwtMiddleware, getVendor);
router.route("/getPendingOrdersAssignToAdmin").get(authenticateJwtMiddleware, getPendingOrdersAssignToAdmin);
router.route("/createVendor").post(authenticateJwtMiddleware, createVendor);
router.route("/assignOrderToVendor").post(authenticateJwtMiddleware, assignOrderToVendor);
export default router;