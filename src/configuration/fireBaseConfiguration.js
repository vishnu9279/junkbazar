// firebaseSetup.js

import admin from "firebase-admin";
import helper from "../utils/helper.js";

const initializeFirebasefun = async () => {
    console.log("initializeFirebasefun working");
    const fcm = await helper.getCacheElement("CONFIG", "FIREBASE_NOTIFICATION_JSON");

    await admin.initializeApp({
        credential: admin.credential.cert(fcm)
    });
    
    return admin;
};

const initializeFirebase = async () => {
    const adminInstance = await initializeFirebasefun();

    console.log("initializeFirebase", adminInstance);

    return adminInstance;
};

export default initializeFirebase;