"use strict";

import {
    Router
} from "express";

const router = Router();

import authenticateJwtMiddleware from "../../middleware/authenticateJwtMiddleware.js";

import get_country_state_cities from "../../controllers/other_api/get_countries_state_cities.controller.js";
import appVersion from "../../controllers/other_api/appVersion.controller.js";
import saveFcmToken from "../../controllers/other_api/saveFcmToken.controller.js";
import dummy from "../../controllers/other_api/dummy.controller.js";

router.route("/getCountries").get(get_country_state_cities);
router.route("/appVersion").get(appVersion);
router.route("/dummy").get(dummy);
router.route("/saveFcmToken").post(authenticateJwtMiddleware, saveFcmToken);
export default router;