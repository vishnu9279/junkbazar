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
import PDFDocument from "pdfkit";

function createTable(doc, headers, data, columnWidths) {
    // Add headers
    for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], {
            align: "left",
            continued: true
          
        });
        doc.text(" ", {
            align: "left",
            continued: true,
            width: columnWidths[i]
        });
    }

    doc.moveDown();

    // Add data rows
    for (const row of data) {
        for (let i = 0; i < row.length; i++) {
            const cellValue = row[i].toString();

            doc.text(cellValue, {
                align: "center"
                // width: columnWidths[i] 
            });
        }

        doc.moveDown();
    }
}

const downloadInvoice = asyncHandler(async (req, res) => {
    console.log("downloadInvoice working");

    try {
        const doc = new PDFDocument();

        const userId =  req.decoded.userId;
        const orderId = req.query.orderId;

        if (fieldValidator(orderId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        const order = await userOrderModel.findOne({
            orderId,
            vendorId: userId
        });

        console.log({
            order,
            orderId,
            userId
        });

        if (fieldValidator(order)) throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, OrderMessage.ORDER_NOT_FOUND);
        
        // Create a new PDF document

        const logoPath = "src/assets/junk_bazar.png"; // Replace with the actual path to your logo

        doc.image(logoPath, 50, 50, {
            width: 100 
        });
        doc.moveDown();
        doc.fontSize(20).text("Invoice", {
            align: "right"
        });

        doc.fontSize(10).text("Billing Information:", {
            align: "left"
        });

        const leftAlignedLabels = [
            "Name: John Doe",
            "Address: Test Colony, City"
        ];

        leftAlignedLabels.forEach(label => {
            doc.fontSize(10).text(`${label},  `, {
                align: "left",
                continued: true
            });
        });

        doc.text(`Invoice Number: ${order.orderId}`, {
            align: "right"
        });

        doc.text(`Date: ${new Date().toLocaleDateString()}`, {
            align: "right"
        });

        doc.moveDown();
        const tableData = [];
        
        const headers = [ "PRODUCT DETAILS",
            "QUANTITY",
            "OUANTITY TYPE",
            "PRICE",
            "TOTAL" ];

        for (const item of order.items){
            const scrap = await ScrapModel.findOne({
                scrapId: item.scrapId
            });
            
            tableData.push([ scrap.scrapName,
                item.vendorQuantity,
                item.quantityType,
                item.price,
                item.vendorAmount ]);
            // addItemToInvoice(doc, scrap.scrapName, item.vendorQuantity, item.quantityType, item.price, item.vendorAmount);
        }
        const columnWidths = [ 200,
            100,
            10,
            10,
            10 ];

        console.log("tableData", tableData);
        createTable(doc, headers, tableData, columnWidths);
      
        doc.moveDown();
        doc.text("Total: $" + order.vendorFinalAmount, {
            align: "right" 
        });
      
        // Finalize the PDF
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            
            // Set response headers for PDF download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

            // Send the PDF as the response
            res.status(statusCodeObject.HTTP_STATUS_OK).json(
                new ApiResponse(
                    statusCodeObject.HTTP_STATUS_OK,
                    errorAndSuccessCodeConfiguration.HTTP_STATUS_OK,
                    pdfData,
                    CommonMessage.DETAIL_FETCHED_SUCCESSFULLY
                )
            );
            // res.status(statusCodeObject.HTTP_STATUS_OK).send();
        });

        // End the PDF creation
        doc.end();
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
