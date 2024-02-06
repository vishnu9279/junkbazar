import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel from "../../../model/users/userOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    OrderMessage
} from "../../../utils/constants.js";

import {
    createObjectCsvWriter 
} from "csv-writer";
import fs from "fs";
import OrdersRespEnum from "../../../utils/OrdersRespEnum.js";
import Scrap from "../../../model/users/scrap.model.js";
import userAddress from "../../../model/users/userAdress.model.js";
import helper from "../../../utils/helper.js";

const downloadCsv = asyncHandler(async (req, res) => {
    console.log("downloadCsv working", req.query);

    try {
        const vendorId = req.query.vendorId;
        const from = req.query.from;
        const to = req.query.to;

        if (fieldValidator(vendorId)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_BAD_REQUEST,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST,
                CommonMessage.ERROR_FIELD_REQUIRED
            );
        }

        const filterObj = {
            vendorId
        };

        if (!fieldValidator(from) && !fieldValidator(to)){
            const startDate = new Date(from);

            startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day (00:00:00.000)

            const endDate = new Date(to);

            endDate.setHours(23, 59, 59, 999); // Set to the end of the day (23:59:59.999)

            const startOfDayMilliseconds = startDate.getTime();
            const endOfDayMilliseconds = endDate.getTime();

            console.log({
                dayNumber: await helper.getDayNumber(startOfDayMilliseconds) + 1,
                dayNumber1: await helper.getDayNumber(endOfDayMilliseconds)
            });
            filterObj.$and = [{
                dayNumber: {
                    $gte: await helper.getDayNumber(startOfDayMilliseconds) + 1
                }
            },
        
            {
                dayNumber: {
                    $lte: await helper.getDayNumber(endOfDayMilliseconds)
                }
            }];
        }

        console.log({
            filterObj: JSON.stringify(filterObj)
        });
        const orders = await userOrderModel.find(filterObj);

        if (fieldValidator(orders)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                OrderMessage.ORDER_NOT_FOUND
            );
        }

        const data = [];

        for (const order of orders) {
            const address = await userAddress.findOne({
                addressId: order.addressId
            });

            let totalProductAmount = 0;

            for (const item of order.items) {
                const obj = {};

                obj.orderId = order.orderId;
                obj.amount = order.vendorFinalAmount;
                obj.vendorpaymentstatus = fieldValidator(order.isPaid) ? "NO" : "YES";
                obj.adminapprovedstatus = fieldValidator(order.isAdminApprovedPaymentStatus) ? "" : order.isAdminApprovedPaymentStatus;
                obj.transactionOrUtrNumber = fieldValidator(order.transactionOrUtrNumber) ? "" : order.transactionOrUtrNumber;
                obj.platformfee = fieldValidator(order.markupFee) ? 0 : order.markupFee;
                obj.markupFeePercentage = fieldValidator(order.markupFeePercentage) ? 0 : order.markupFeePercentage;
                obj.orderstatus = OrdersRespEnum[order.orderStatus];
                obj.date = new Date(order.createdAt).toLocaleDateString();
                obj.phone = `${address.dialCode} ${address.phoneNumber}`;
                obj.name = address.fullName;
                obj.address = address.address;
                obj.city = address.city;
                obj.pincode = address.pincode;
                obj.stateCode = address.stateCode;

                obj.productamount = item.amount;
                obj.quantity = item.quantity;
                obj.quantityType = item.quantityType;
                obj.productprice = item.price;

                const scrap = await Scrap.findOne({
                    scrapId: item.scrapId
                });

                obj.scrapname = scrap.scrapName;

                data.push(obj);

                totalProductAmount += item.amount;
            }

            // Add a row for the total amount of the order
            const totalRow = {
                orderId: order.orderId,
                productAmount: totalProductAmount,
                productamount: "Total Amount"
            };

            data.push(totalRow);
            data.push({}, {});
        }

        const csvWriter = createObjectCsvWriter({
            header: [
                {
                    id: "date",
                    title: "Date" 
                },
                
                {
                    id: "name",
                    title: "Name" 
                },
                {
                    id: "phone",
                    title: "Phone Number" 
                },
                {
                    id: "vendorpaymentstatus",
                    title: "Vendor Payment Status" 
                },
                {
                    id: "adminapprovedstatus",
                    title: "Admin Approved Status" 
                },
                {
                    id: "orderstatus",
                    title: "Order Status" 
                },
                {
                    id: "transactionOrUtrNumber",
                    title: "Transcation Id"
                },
               
                {
                    id: "stateCode",
                    title: "State Code"
                },
                {
                    id: "pincode",
                    title: "Pin Code"
                },
                {
                    id: "city",
                    title: "City"
                },
                {
                    id: "address",
                    title: "Address"
                },
                {
                    id: "orderId",
                    title: "Order Id" 
                },
                {
                    id: "scrapname",
                    title: "Scrap Name"
                },
                {
                    id: "productprice",
                    title: "Price"
                },
                {
                    id: "quantityType",
                    title: "Quantity Type"
                },
                {
                    id: "quantity",
                    title: "Quantity"
                },
                {
                    id: "productamount",
                    title: "Product Amount"
                },
                {
                    id: "platformfee",
                    title: "Platform Fee"
                },
                {
                    id: "markupFeePercentage",
                    title: "Platform Fee Percentage"
                },
                {
                    id: "productAmount",
                    title: "Total Amount" 
                }
            ],
            path: "output.csv"
        });
        
        csvWriter.writeRecords(data).then(() => {
            // Send the generated CSV file as a response
            res.download("output.csv", "output.csv", (err) => {
                // Cleanup: Delete the temporary CSV file after sending
                if (!err) 
                    fs.unlinkSync("output.csv");
            });
        });
    }

    catch (error) {
        console.error("Error on getting scrap", error.message);

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            console.error("Error in downloadCsv:", error);

            return res
                .status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR)
                .json({
                    error: CommonMessage.SOMETHING_WENT_WRONG
                });
        }
    }
});

export default downloadCsv;
