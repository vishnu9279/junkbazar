"use strict";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRouter from "./routes/users/user.route.js";
import vendorRouter from "./routes/vendor/vendor.route.js";
import adminRouter from "./routes/admin/admin.route.js";
import otherRouter from "./routes/other/other.route.js";
import watcher from "./routes/watcher/watcher.js";
import loggerLogs from "./utils/loggerLogs.js";
import {
    connect
} from "./configuration/dbConnection.js";
import sanitizeMiddleware from "./middleware/xssMiddleware.js";
import rateLimiter from "./middleware/rateLimit.js";
import {
    CommonMessage, basicConfigurationObject
} from "./utils/constants.js";

import {
    fetchConfigCollectionFromDb
} from "./configuration/fetchConfigCollectionFromDb.js";
import {
    initializeFirebasefun
} from "./configuration/fireBaseConfiguration.js";
// import helper from "./utils/helper.js";
import checkForForceUpdate from "./middleware/checkForForceUpdate.js";
import logHeaders from "./middleware/logHeaders.js";

const app = express();

async function connectTomongoDbConn() {
    try {
        await connect();
        console.log("Connected to the database");
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}

/* eslint-disable no-unused-vars */
function errorHandlerMiddleware(err, req, res, next) {
    loggerLogs.error("Error caught by error handling middleware:", err);
    res.status(500).send({
        error: CommonMessage.ERROR_MESSAGE_INTERNAL_SERVER_ERROR 
    });
}
async function setupMiddleware() {
    try {
        console.log(basicConfigurationObject.CORS_ORIGIN.split(","));
        app.use(cors());
        app.use(helmet());
        app.use(checkForForceUpdate);
        app.use(express.static("public"));
        app.use(express.json({
            limit: "16kb" 
        }));
        app.use(express.urlencoded({
            extended: true,
            limit: "16kb" 
        }));
        app.use(logHeaders);
        // Use the XSS prevention middleware
        app.use(sanitizeMiddleware);
        //Rate Limiter
        app.use(rateLimiter);

        app.use(morgan("combined"));
        await connectTomongoDbConn();
        await fetchConfigCollectionFromDb();
        await initializeFirebasefun();
        // Error handling middleware
        app.use(errorHandlerMiddleware);
    }
    catch (error) {
        console.error("Error setting up middleware:", error);
        process.exit(1);
    }
}

function setRoutes() {
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1/vendor", vendorRouter);
    app.use("/api/v1/admin", adminRouter);
    app.use("/api/v1/other", otherRouter);
    app.use(watcher);
    app.get("*", (req, res) => {
        res.status(404).send({
            error: CommonMessage.ERROR_MESSAGE_NOT_FOUND 
        });
    });
}

async function initializeApp() {
    await setupMiddleware();
    setRoutes();
}

initializeApp();

export default app;