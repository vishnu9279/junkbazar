"use strict";

import onHeaders from "on-headers";

function logHeaders(req, res, next) {
    if (!req.headers.ip) {
        if (req.headers["cf-connecting-ip"])
            req.headers.ip = req.headers["cf-connecting-ip"];

        else if (req.headers["x-forwarded-for"])
            req.headers.ip = req.headers["x-forwarded-for"];

        else if (req.connection.remoteAddress)
            req.headers.ip = req.connection.remoteAddress;
    }

    onHeaders(res, () => {
        if (res.statusCode === 200 || res.statusCode === 304)
            console.log(`${req.method} : ${req.originalUrl} => ${res.statusCode} => ${req.headers.ip}`);

        else
            console.error(`${req.method} : ${req.originalUrl} => ${res.statusCode} => ${req.headers.ip}`);
    });

    next();
}
export default logHeaders;
