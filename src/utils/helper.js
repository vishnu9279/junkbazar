"use strict";

import cache from "memory-cache";
import crypto from "crypto";
const oneDayMillisecond = 24 * 60 * 60 * 1000;
const oneWeekMillisecond = 7 * 24 * 60 * 60 * 1000;

class Helper{
    getRandomOTP (min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
    getCacheElement(config = "CONFIG", key){
        console.log("getCacheElement working", {
            config,
            key
        });
        // console.log("response object", cache.get(config));
        const Obj = cache.get(config);

        // console.log("response object", Obj[key]);

        return Obj[key];
    }

    encryptAnyData(messages) {
        console.log("incoming message To encrypt = >", messages);
        const algorithm = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
        const initVector = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
        const Securitykey = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");

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

    decryptAnyData(encryptedData) {
        console.log("incoming message To decrypt = >", encryptedData);
        const algorithm = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
        const initVector = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
        const Securitykey = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");

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
    getMonthNumber(date) {
        const reference_date = new Date(this.getCacheElement("CONFIG", "REFERENCE_START_DATE"));
        const currentDate = date ? new Date(date) : new Date();

        let months = (currentDate.getFullYear() - reference_date.getFullYear()) * 12;

        months -= reference_date.getMonth();
        months += currentDate.getMonth();

        return months <= 0 ? 0 : months;
    }
    getWeekNumber(date) {
        const currentDate = date ? new Date(date).getTime() : new Date().getTime();

        const reference_date = new Date(this.getCacheElement("CONFIG", "REFERENCE_START_DATE"));
        const reference_week_start = this.getCacheElement("CONFIG", "REFERENCE_START_DATE") - (reference_date.getDay() * oneDayMillisecond);

        const difference = currentDate - reference_week_start;
        const week_difference = difference / oneWeekMillisecond;

        return Math.floor(week_difference);
    }
    getDayNumber(date) {
        const currentDate = date ? new Date(date).getTime() : new Date().getTime();
        const difference = currentDate - this.getCacheElement("CONFIG", "REFERENCE_START_DATE");
        const day_difference = difference / oneDayMillisecond;

        return Math.floor(day_difference);
    }
}

export default new Helper();