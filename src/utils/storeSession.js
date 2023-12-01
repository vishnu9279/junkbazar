"use strict";

import Session  from "../model/session.model.js";
const storeSession = async(data, jwtOption, exipryHr, milliseconds) => {
    // console.log("storeSession working", data);
    try {
        const currentTime = new Date().getTime();
        const obj = {
            encrypt: data.encrypt,
            exipryHr,
            expiryTime: milliseconds + currentTime,
            jwtId: jwtOption.jwtid,
            originalUrl: data.originUrl,
            phoneNumber: data.phoneNumber,
            platform: data.platform,
            userId: data.userId
        };

        console.log(obj);
        await Session.create(obj);
        // await 
    }
    catch (error) {
        console.error("Creating Errror", error); 
        throw error;
    }
};

export default storeSession;