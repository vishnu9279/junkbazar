// import mongoose from "mongoose";
// import {
//     basicConfigurationObject 
// } from "../utils/constants.js";

// function createDatabaseConn(uri = basicConfigurationObject.MONGODB_URI || "") {
//     console.log("Mongo is trying to connect");

//     if (!uri) {
//         console.error("MONGODB_URI is missing");
//         process.exit(1);
//     }

//     let mongooseClient;

//     async function connect() {
//         try {
//             const options = {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true
//             };

//             const db =  await mongoose.connect(uri, options);

//             mongooseClient = db;
//             console.log("Connected to MongoDB");
//         }
//         catch (error) {
//             console.error("MongoDB connection error:", error);
//             process.exit(1);
//         }
//     }

//     async function disconnect() {
//         await mongoose.disconnect();
//         console.log("Disconnected from MongoDB");
//     }
//     function getNewMongoSession (){
//         return mongooseClient.startSession();
//     }

//     return {
//         connect,
//         disconnect,
//         getNewMongoSession
//     };
// }

// export default createDatabaseConn;

import mongoose from "mongoose";
import {
    basicConfigurationObject 
} from "../utils/constants.js";
let mongooseClient;

async function connect(uri = basicConfigurationObject.MONGODB_URI || "") {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        const db = await mongoose.connect(uri, options);

        mongooseClient = db;
        console.log("Connected to MongoDB");

        return db;
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

async function disconnect() {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
}

function getNewMongoSession() {
    return mongooseClient.startSession();
}

export  {
    connect,
    disconnect,
    getNewMongoSession 
};
