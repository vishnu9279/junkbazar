import mongoose from "mongoose";
import { basicConfigurationObject } from "../utils/constants.js";

function createDatabaseConn(uri = basicConfigurationObject.MONGODB_URI || "") {
    console.log('Mongo is trying to connect');
    if (!uri) {
        console.error("MONGODB_URI is missing");
        process.exit(1);
    }

    async function connect() {
        try {
            
            // const options = {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            // };

            await mongoose.connect(uri);
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            process.exit(1);
        }
    }

    async function disconnect() {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }

    return {
        connect,
        disconnect,
    };
}

export default createDatabaseConn;
