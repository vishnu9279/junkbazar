"use strict";

const OrdersEnum = {
    ACCEPTED: 1,
    ARRVIED: 3,
    ASSIGN_TO_ADMIN: 6,
    ON_THE_WAY: 2,
    PENDING: 0,
    REASSIGNED_TO_VENDOR: 7,
    REJECTED: 5,
    SCRAP_PICKED: 4
};

export const OrdersRespEnum = {
    0: "Order In Pending",
    1: "Orders Accepted",
    2: "On the Way",
    3: "Arrived",
    4: "Picked The Scrap",
    5: "Order Rejected"
};
  
export default OrdersEnum;