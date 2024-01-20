"use strict";

import crypto from "crypto";
const oneDayMillisecond = 24 * 60 * 60 * 1000;
const oneWeekMillisecond = 7 * 24 * 60 * 60 * 1000;

import {
    getCache
} from "../configuration/fetchConfigCollectionFromDb.js";

import {
    amqConnectionHelper
} from "../configuration/rmqConnection.js";
import BalanceModel from "../model/vendor/balance.model.js";
import transactionHistoryModel from "../model/vendor/transaction_history.model.js";

function transactionLog(userId, amount, type, currency, transaction_id, before_balance, after_balance, transactionSession, wallet_type, callback) {
    const queryOptions = {};

    if (transactionSession)
        queryOptions.session = transactionSession.session;

    const transaction_object = {
        after_balance,
        amount,
        before_balance,
        currency,
        transaction_id,
        type,
        userId,
        wallet_type
    };

    transactionHistoryModel.insertOne(transaction_object, queryOptions, (err) => {
        if (err)
            callback(err);

        else
            callback(null);
    });
}

class Helper{
    phoneNumberValidation(phoneNumber){
        const regex = /^[6-9]\d{9}$/;
        
        return regex.test(phoneNumber);
    }
    
    getRandomOTP (min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
    
    async getCacheElement(config = "CONFIG", key){
        try {
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
        catch (error) {
            console.error("Error getCacheElement data:", error);
            throw new Error("getCacheElement failed");
        }
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
            console.error("Error ecrypting data:", error);
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

    publishQueueMessage(queueName, body) {
        console.log("amqpChannel" );
        console.log("Publising message in " + queueName, "body", JSON.stringify(body));

        amqConnectionHelper().sendToQueue(queueName, Buffer.from(JSON.stringify(body)), {
            persistent: true
        });
    }

    // socket events
    emitToUser(userId, eventName, data) {
        console.log("emitToUser", userId, eventName, data);
    
        this.publishQueueMessage("sockets", {
            data,
            eventName,
            module_name: "MODULE_SERVER",
            type: "emitToUser",
            userId
        });
    }    

    acknowledgeMessage(messageFromQueue) {
        console.log("acknowledgeMessage => ", messageFromQueue.fields.routingKey);

        amqConnectionHelper().ack(messageFromQueue);
    }

    async updateUserBalance(userId, currency, amount, type, transaction_id, transactionSession, wallet_type) {
        console.log("updateUserBalance", {
            amount,
            currency,
            type,
            userId,
            wallet_type
        });
    
        if (isNaN(amount)) 
            throw new Error("Invalid amount");

        let after_balance = 0;
        let before_balance = 0;
        let new_balance = 0;
        // Step 1: Get before_balance
        const queryOptions = {};
    
        if (transactionSession) 
            queryOptions.session = transactionSession.session;
    
        const beforeBalanceItem = await BalanceModel.collection("balances").findOne({
            currency: currency,
            userId: userId,
            wallet_type: wallet_type
        }, queryOptions);
    
        before_balance = beforeBalanceItem ? parseFloat(beforeBalanceItem.balance) : 0;
    
        // Step 2: Update balance
        const updateOptions = {
            returnOriginal: false,
            upsert: true
        };
    
        if (transactionSession) 
            updateOptions.session = transactionSession.session;
    
        const resp = await BalanceModel.findOneAndUpdate({
            currency: currency,
            userId: userId,
            wallet_type: wallet_type
        }, {
            $inc: {
                balance: amount
            },
            $set: {
                updated: new Date().getTime()
            },
            $setOnInsert: {
                currency: currency,
                userId: userId,
                wallet_type: wallet_type
            }
        }, updateOptions);
    
        const balance = parseFloat(resp.value.balance.toString());
    
        if (isNaN(balance) || balance < 0) 
            throw new Error("Insufficient Balance in " + currency.toUpperCase());
    
        // Step 3: Get after_balance
        const afterBalanceItem = await BalanceModel.findOne({
            currency: currency,
            userId: userId,
            wallet_type: wallet_type
        }, queryOptions);
    
        after_balance = afterBalanceItem ? parseFloat(afterBalanceItem.balance) : 0;
        new_balance = afterBalanceItem ? afterBalanceItem.balance.toString() : 0;
    
        // Step 4: Log the transaction
        await transactionLog(userId, amount, type, currency, transaction_id, before_balance, after_balance, transactionSession, wallet_type);
    
        console.log({
            after_balance,
            before_balance,
            new_balance
        });
    
        // Return new_balance
        return new_balance;
    }
}

export default new Helper();