import amqp from "amqplib";

import {
    basicConfigurationObject 
} from "../utils/constants.js";
let amqpChannel;

async function connectToRabbitMQ() {
    try {
        // console.log("====================================");
        // console.log(basicConfigurationObject.RABBIT_MQ_URL);
        // console.log("====================================");
        const connection = await amqp.connect(basicConfigurationObject.RABBIT_MQ_URL);

        console.log("Platform Rabbit MQ Connected");

        const channel = await connection.createChannel();

        amqpChannel = channel;
    }
    catch (err) {
        // Handle errors
        console.error(err);
        throw err; // Optional: rethrow the error if needed
    }
}

function amqConnectionHelper(){
    return amqpChannel;
}

export {
    amqConnectionHelper,
    connectToRabbitMQ
};