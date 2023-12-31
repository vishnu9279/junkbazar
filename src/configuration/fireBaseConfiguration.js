// firebaseSetup.js

import admin from "firebase-admin";
import helper from "../utils/helper.js";

let firebaseConf;

const initializeFirebasefun = async () => {
    console.log("initializeFirebasefun working");
    const fcm = await helper.getCacheElement("CONFIG", "FIREBASE_NOTIFICATION_JSON");

    firebaseConf = await admin.initializeApp({
        credential: admin.credential.cert(fcm),
        databaseURL: "https://junbazarapp-default-rtdb.firebaseio.com/"
    });
};

const initializeFirebase = () => {
    // const adminInstance = await initializeFirebasefun();

    // console.log("initializeFirebase", adminInstance);

    return firebaseConf;
};

export {
    initializeFirebase, initializeFirebasefun
};