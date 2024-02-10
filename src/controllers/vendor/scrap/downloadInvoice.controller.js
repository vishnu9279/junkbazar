import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel from "../../../model/users/userOrder.model.js";
import UserModel  from "../../../model/users/user.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ScrapModel from "../../../model/users/scrap.model.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    OrderMessage,
    registerMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import puppeteer from "puppeteer";
const downloadInvoice = asyncHandler(async (req, res) => {
    console.log("downloadInvoice working");

    try {
        const userId = req.decoded.userId;
        const orderId = req.query.orderId;

        if (fieldValidator(orderId)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_BAD_REQUEST,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST,
                CommonMessage.ERROR_FIELD_REQUIRED
            );
        }

        let pdfData = [];
        const order = await userOrderModel.findOne({
            orderId,
            vendorId: userId
        });

        if (fieldValidator(order)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                OrderMessage.ORDER_NOT_FOUND
            );
        }

        const user = await UserModel.findOne({
            userId: order.vendorId
        });

        if (fieldValidator(user)) {
            throw new ApiError(
                statusCodeObject.HTTP_STATUS_CONFLICT,
                errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT,
                registerMessage.ERROR_USER_NOT_FOUND
            );
        }

        for (const item of order.items) {
            const scrap = await ScrapModel.findOne({
                scrapId: item.scrapId
            });

            item.scrapName = scrap.scrapName;
        }
        pdfData = [ ...order.items ];

        console.log({
            //     items: order.items,
            pdfData
        });

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const formattedDate = `${day}-${month}-${year}`;

        console.log(formattedDate);
        const browser = await puppeteer.launch({
            args: [ "--no-sandbox",
                "--disable-setuid-sandbox" ],
            headless: "new"
        });
        const page = await browser.newPage();
        // Replace the following line with the actual path to your HTML file
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Invoice</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 20px;
              }
        
              h1 {
                text-align: end;
                font-size: 58px;
              }
        
              table {
                border-collapse: collapse;
                width: 100%;
              }
        
              th,
              td {
                border: 1px solid black;
                padding: 5px;
              }
        
              th {
                text-align: left;
              }
              .container {
                width: 80%;
                position: relative;
                margin: 0 auto;
              }
              .__second_parent {
                width: 100%;
                display: flex;
              }
              .__second_parent_child {
                text-align: end;
                width: 100%;
              }
              .__second_parent_child__ {
                width: 100%;
              }
              .__gross_total {
                text-align: end;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="__parent">
                <img
                  src="https://junkbazarassets.s3.ap-south-1.amazonaws.com/junk_bazar.png"
                  alt="invoice"
                />
                <h1 class="__parent_title">Invoice</h1>
              </div>
              <div class="__second_parent">
                <div class="__second_parent_child__">
                  <p>Customer:</p>
                  <ul>
                    <li>${user.firstName} ${user.lastName}</li>
                    <li>${user.dialCode} ${user.phoneNumber}</li>
                    <li>${user.address} ${user.city} ${user.stateCode} ${user.pincode}</li>
                  </ul>
                </div>
                <div class="__second_parent_child">
                  <p>Invoice number: ${order.orderId}</p>
                  <p>Date: ${formattedDate}</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>OrderId</th>
                    <th>Product Detail</th>
                    <th>Quantity</th>
                    <th>Quantity Type</th>
                    <th>Platform Fee Paid</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
            ${pdfData
        .map(
            (el) => `
                <tr>
                <td>${orderId}</td>
                <td>${el.scrapName}</td>
                <td>${el.vendorQuantity}</td>
                <td>${el.quantityType}</td>
                <td>${(order.isPaid) ? "Yes" : "No"}
                <td>${el.price}</td>
                <td>${el.vendorAmount}</td>
                </tr>
            `
        )
        .join("")}
            </tbody>
              </table>
              <div class="__gross_total">
              <p>Platform Fee: ${order.markupFee}</p>
              <p>Final Amount : ${order.vendorFinalAmount}</p>
              </div>
              <p>Thank you!</p>
              <div class="__second_parent">
               

                <div class="__second_parent_child">
                  <p>Address</p>
                  <p>Kankarbagh Main Rd, Kumhar Toli,
                  Ghrounda, Patna, Bihar India 800020</p>
                </div>
              </div>
            </div>
          </body>
        </html>`;

        //   <div class="__second_parent_child__">
        //   <p>PAYMENT INFORMATION:</p>
        //   <ul>
        //     <li>Briard Bank</li>
        //     <li>Account Name: Samira Hadid</li>
        //     <li>Account No: 123-456-7890</li>
        //   </ul>
        // </div>
        await page.setContent(htmlContent);
        // Generate PDF buffer
        const pdfBuffer = await page.pdf();

        // Close the browser
        await browser.close();
        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

        res
            .status(statusCodeObject.HTTP_STATUS_OK)
            .json(
                new ApiResponse(
                    statusCodeObject.HTTP_STATUS_OK,
                    errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                    pdfBuffer,
                    CommonMessage.DETAIL_FETCHED_SUCCESSFULLY
                )
            );
    // res.status(statusCodeObject.HTTP_STATUS_OK).send();
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
            console.error("Error in downloadInvoice:", error);

            return res
                .status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR)
                .json({
                    error: CommonMessage.SOMETHING_WENT_WRONG
                });
        }
    }
});

export default downloadInvoice;
