"use strict";

import {
    Router
} from "express";

const router = Router();

import sendPushNotificationToVendorOnPickUpRequest from "../../watcher/sendPushNotificationToVendorOnPickUpRequest.watcher.js";
// import sendPushNotificationToUser from "../../watcher/sendPushNotificationToUser.watcher.js";

sendPushNotificationToVendorOnPickUpRequest();
// sendPushNotificationToUser();
export default router;
