"use strict";

import fieldValidator from "../utils/fieldValidator.js";
function checkForForceUpdate(req, res, next) {
    const platform = req.headers.platform;
    const version = req.headers.version;

    if (platform === "web")
        return next();

    if (fieldValidator(platform)) {
        return res.status(500).send({
            data: null,
            message: "Platform is Missing"
        });
    }

    if (platform === "android" || platform === "ios") {
        if (fieldValidator(version)) {
            return res.status(500).send({
                data: null,
                message: "Platform is Missing"
            });
        }

        else
            return next();
    }

    else {
        return res.status(500).send({
            data: null,
            message: "Platform is Missing"
        });
    }
}

export default checkForForceUpdate;