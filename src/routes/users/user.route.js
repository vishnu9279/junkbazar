import {
    Router
} from "express";

const router = Router();

import register from "../../controllers/users/register/register.controller.js";

router.route("/register").post(register);
export default router;