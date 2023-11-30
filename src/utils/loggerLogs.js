import winston from "winston";

// Configure Winston logger
const loggerLogs = winston.createLogger({
    format: winston.format.simple(),
    level: "info",
    transports: [
        new winston.transports.Console(),
        // You can add more transports as needed, such as file or database transports
    ],
});

export default  loggerLogs;
