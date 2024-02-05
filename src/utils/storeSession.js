"use strict";

import Session  from "../model/users/session.model.js";
const storeSession = async(data, jwtOption, exipryHr, milliseconds) => {
    console.log("storeSession working");
    try {
        const currentTime = new Date().getTime();
        const obj = {
            created: new Date().getTime(),
            encrypt: data.encrypt,
            exipryHr,
            expiryTime: milliseconds + currentTime,
            jwtId: jwtOption.jwtid,
            originalUrl: data.originUrl,
            phoneNumber: data.phoneNumber,
            platform: data.platform,
            userId: data.userId,
            userIdF_k: data.userIdF_k
        };

        // console.log(obj);
        await Session.create(obj);
        // await 
    }
    catch (error) {
        console.error("Creating Errror", error); 
        throw error;
    }
};

export default storeSession;