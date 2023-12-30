"use strict";

// import NodeCache from "node-cache";
import crypto from "crypto";
const oneDayMillisecond = 24 * 60 * 60 * 1000;
const oneWeekMillisecond = 7 * 24 * 60 * 60 * 1000;

import {
    getCache
} from "../configuration/fetchConfigCollectionFromDb.js";
class Helper{
    phoneNumberValidation(phoneNumber){
        const regex = /^[6-9]\d{9}$/;
        
        return regex.test(phoneNumber);
    }
    
    getRandomOTP (min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
    
    async getCacheElement(config = "CONFIG", key){
        // const cache = new NodeCache();
        const cache = await getCache();

        // Alternatively, you can use getCache after fetchConfigCollectionFromDb

        console.log("getCacheElement working", {
            config,
            key
        });
        // console.log("response object", cache.get(config));
        // console.log("response object", cachedInstance.get("CONFIG"));
        const Obj = cache.get(config);

        // console.log("response object", Obj[key]);

        return Obj[key];
    }

    async encryptAnyData(messages) {
        console.log("incoming message To encrypt = >", messages);
        try {
            const algorithm = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
            const initVector = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
            const Securitykey = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");
    
            // console.log({
            //     algorithm,
            //     initVector,
            //     Securitykey
            // });
            const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
            let encryptedData = cipher.update(JSON.stringify(messages), "utf-8", "hex");
    
            encryptedData += cipher.final("hex");
    
            return encryptedData;
        }
        catch (error) {
            console.error("Error decrypting data:", error);
            throw new Error("Encryption failed"); 
        }
    }

    async decryptAnyData(encryptedData) {
        console.log("incoming message To decrypt = >");
        try {
            const algorithm = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
            const initVector = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
            const Securitykey = await this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");
    
            // console.log({
            //     algorithm,
            //     initVector,
            //     Securitykey
            // });
            const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    
            let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    
            decryptedData += decipher.final("utf8");
            
            const inObjectDecryptData = JSON.parse(decryptedData);
    
            return inObjectDecryptData;
        }
        catch (error) {
            console.error("Error decrypting data:", error);
            throw new Error("Decryption failed"); 
        }
    }
    async getMonthNumber(date) {
        const reference_date = new Date( await this.getCacheElement("CONFIG", "REFERENCE_START_DATE"));
        const currentDate = date ? new Date(date) : new Date();

        let months = (currentDate.getFullYear() - reference_date.getFullYear()) * 12;

        months -= reference_date.getMonth();
        months += currentDate.getMonth();

        return months <= 0 ? 0 : months;
    }
    async getWeekNumber(date) {
        const currentDate = date ? new Date(date).getTime() : new Date().getTime();

        const reference_date = new Date(await this.getCacheElement("CONFIG", "REFERENCE_START_DATE"));
        const reference_week_start = await this.getCacheElement("CONFIG", "REFERENCE_START_DATE") - (reference_date.getDay() * oneDayMillisecond);

        const difference = currentDate - reference_week_start;
        const week_difference = difference / oneWeekMillisecond;

        return Math.floor(week_difference);
    }
    async getDayNumber(date) {
        const currentDate = date ? new Date(date).getTime() : new Date().getTime();
        const difference = currentDate - await this.getCacheElement("CONFIG", "REFERENCE_START_DATE");
        const day_difference = difference / oneDayMillisecond;

        return Math.floor(day_difference);
    }
}

export default new Helper();