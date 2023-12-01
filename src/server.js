"use strict";

function onSignalInterruptedHandler() {
    console.log("SIGINT signal received. Shutting down gracefully.");
    // Implement graceful shutdown logic here if needed
    process.exit(0);
}

function onUnhandledRejection(reason, p) {
    console.error("Unhandled Rejection at Promise", p, "\nReason:", reason);
    // Optionally, log the error or take other actions
}

function onUncaughtException(err) {
    console.error((new Date()).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);
    process.exit(1);
}

function setupServer(app) {
    process
        .on("SIGINT", () => onSignalInterruptedHandler())
        .on("unhandledRejection", (reason, p) => onUnhandledRejection(reason instanceof Error ? reason : new Error(reason), p))
        .on("uncaughtException", (err) => onUncaughtException(err));

    function startServer(port) {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }

    return {
        startServer
    };
}

export default setupServer;