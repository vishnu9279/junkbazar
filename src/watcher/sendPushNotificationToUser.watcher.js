import UserOrderModel  from "../model/users/userOrder.model.js";
import sendNotification from "../services/sendPushNotification.js";
import orderStatusMessageResponse from "../utils/orderStatusMessageResponse.js";

async function sendPushNotificationToUser() {
    console.log("sendPushNotificationToUser working");
    try {
        // Create a change stream with a filter for insert operations
        // const collection = UserOrderModel.collection;
        const changeStream = await UserOrderModel.collection.watch([{
            $match: {
                operationType: "updateLookup" 
            } 
        }]);

        console.log("Change stream is active...");

        // Set up event listener for insert events
        changeStream.on("change", async (change) => {
            console.log("Insert:", change);
            const doc = change.fullDocument;
            // const addressDetail = await addressInfo(doc.addressId);
            // const vendorArrayOfObjects = await vendors(addressDetail.city, addressDetail.stateCode);

            const notificationData = {
                data: {},
                message: orderStatusMessageResponse[doc.orderStatus],
                title: "You Order Status"
            };

            sendNotification(notificationData, doc.userId);
           
            // Handle the insert event here
        });
    
        // Set up event listener for other events
        changeStream.on("error", (error) => {
            console.error("Change stream error:", error);
        });
    
        changeStream.on("close", () => {
            console.log("Change stream closed");
        });
    }
    catch (error){
        console.error("Error In Oders Watcher", error);
    }
}

export default sendPushNotificationToUser;
