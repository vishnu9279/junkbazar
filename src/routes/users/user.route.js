import {
    Router
} from "express";

const router = Router();

import register from "../../controllers/users/register/register.controller.js";
import login from "../../controllers/users/login/login.controller.js";

router.route("/register").post(register);
router.route("/login").post(login);
export default router;