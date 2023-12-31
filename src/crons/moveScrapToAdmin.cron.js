"use strict";

import CronJob from "node-cron";
import UserPickAddress  from "../model/users/userPickAddress.model.js";
import OrdersEnum from "../utils/orderStatus.js";
const ordersAssignToOrder = CronJob.schedule("* * * * *", async() => {
    console.log("ordersAssignToOrder working");
    try {
        const currentTimeStamp = new Date().getTime(); 
        const twoHrMillesecond =  currentTimeStamp + (2 * 60 * 60 * 1000);

        await UserPickAddress.updateMany({
            currentTime: {
                $lte: twoHrMillesecond
            },
            orderStatus: OrdersEnum.PENDING
        }, {
            $set: {
                orderStatus: OrdersEnum.ASSIGN_TO_ADMIN
            }
        });
    }
    catch (error) {
        console.error("Something went wrong", error);
    }
});

export default ordersAssignToOrder;