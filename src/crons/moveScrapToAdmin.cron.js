"use strict";

import CronJob from "node-cron";
import UserOrderModel  from "../model/users/userOrder.model.js";
import OrdersEnum from "../utils/orderStatus.js";
const ordersAssignToOrder = CronJob.schedule("* * * * *", async() => {
    console.log("ordersAssignToOrder working");
    try {
        const currentTimeStamp = new Date().getTime(); 
        const twoHrMillesecond =  currentTimeStamp - (2 * 60 * 60 * 1000);

        console.log({
            currentTimeStamp,
            twoHrMillesecond
        });
        const resp = await UserOrderModel.updateMany({
            currentTime: {
                $lte: twoHrMillesecond
            },
            orderStatus: OrdersEnum.PENDING
        }, {
            $set: {
                currentTime: currentTimeStamp,
                orderStatus: OrdersEnum.ASSIGN_TO_ADMIN
            }
        });

        console.log("Update Value", resp);
    }
    catch (error) {
        console.error("Something went wrong", error);
    }
});

export default ordersAssignToOrder;