"use strict";

import xss from "xss";

// Sanitization middleware using xss
const sanitizeMiddleware = (req, res, next) => {
    for (const key in req.body) {
        if (Object.hasOwnProperty.call(req.body, key)) 
            req.body[key] = xss(req.body[key]);
    }
    next();
};

export default sanitizeMiddleware;