import asyncHandler from "../../../utils/asyncHandler.js";
import userOrderModel  from "../../../model/users/userOrder.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ScrapModel  from "../../../model/users/scrap.model.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    OrderMessage
} from "../../../utils/constants.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import puppeteer from "puppeteer";
const downloadInvoice = asyncHandler(async (req, res) => {
    console.log("downloadInvoice working");

    try {
        const userId =  req.decoded.userId;
        const orderId = req.query.orderId;

        if (fieldValidator(orderId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        let pdfData = [];
        const order = await userOrderModel.findOne({
            orderId,
            vendorId: userId
        });
        
        if (fieldValidator(order)) throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, OrderMessage.ORDER_NOT_FOUND);
        
        for (const item of order.items){
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
        const browser = await puppeteer.launch({
            headless: "new"
        });
        const page = await browser.newPage();
        // Replace the following line with the actual path to your HTML file
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .billing-info {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .total {
              text-align: right;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
        
        <div class="invoice-header">
          <img src="https://junkbazarassets.s3.ap-south-1.amazonaws.com/junk_bazar.png" alt="Logo" width="100">
          <h1>Invoice</h1>
        </div>
        
        <div class="billing-info">
          <p><strong>Billing Information:</strong></p>
          <p>Name: John Doe</p>
          <p>Address: 123 Main Street, City, Country</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Product Details</th>
              <th>Quantity</th>
              <th>Quantity Type</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${pdfData.map((el) => `
                <tr>
                <td>${orderId}</td>
                <td>${el.scrapName}</td>
                <td>${el.vendorQuantity}</td>
                <td>${el.quantityType}</td>
                <td>${el.price}</td>
                <td>${el.vendorAmount}</td>
                </tr>
            `).join("")}
            </tbody>
        </table>
        
        <div class="total">
          <p>Total: $100.00</p>
        </div>
        <div class="total">
          <p>Platform Fee: ${order.markupFee}</p>
        </div>
        
        </body>
        </html>`;

        await page.setContent(htmlContent);
        // Generate PDF buffer
        const pdfBuffer = await page.pdf();

        // Close the browser
        await browser.close();
        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
      
        res.status(statusCodeObject.HTTP_STATUS_OK).json(
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

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG
            });
        }
    }
});

export default downloadInvoice;

