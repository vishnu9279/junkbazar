"use strict";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRouter from "./routes/users/user.route.js";
import loggerLogs from "./utils/loggerLogs.js";
import {
    connect
} from "./configuration/dbConnection.js";
import sanitizeMiddleware from "./middleware/xssMiddleware.js";
import rateLimiter from "./middleware/rateLimit.js";
import {
    CommonErrorMessage
} from "./utils/constants.js";

import fetchConfigCollectionFromDb from "./configuration/fetchConfigCollectionFromDb.js";

const app = express();

async function connectTomongoDbConn() {
    try {
        await connect();
        console.log("Connected to the database");
        await fetchConfigCollectionFromDb();
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
        error: CommonErrorMessage.ERROR_MESSAGE_INTERNAL_SERVER_ERROR 
    });
}
async function setupMiddleware() {
    try {
        app.use(helmet());
        app.use(express.static("public"));
        app.use(
            cors({
                credentials: true,
                methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
                origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : undefined
            })
        );
        
        app.use(express.json({
            limit: "16kb" 
        }));
        app.use(express.urlencoded({
            extended: true,
            limit: "16kb" 
        }));
        
        // Use the XSS prevention middleware
        app.use(sanitizeMiddleware);
        //Rate Limiter
        app.use(rateLimiter);

        app.use(morgan("combined"));
        await connectTomongoDbConn();
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
    app.get("*", (req, res) => {
        res.status(404).send({
            error: CommonErrorMessage.ERROR_MESSAGE_NOT_FOUND 
        });
    });
}

async function initializeApp() {
    await setupMiddleware();
    setRoutes();
}

initializeApp();

export default app;