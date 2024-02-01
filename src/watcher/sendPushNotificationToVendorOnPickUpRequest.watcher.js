import UserOrderModel  from "../model/users/userOrder.model.js";
import userAddress  from "../model/users/userAdress.model.js";
import UserModel  from "../model/users/user.model.js";
import fieldValidator from "../utils/fieldValidator.js";
import sendNotification from "../services/sendPushNotification.js";
const addressInfo = async (addressId) => {
    try {
        const address =  await userAddress.findOne({
            addressId
        }).lean();

        if (fieldValidator(address)) return false;

        return address;
    }
    catch (error) {
        console.error("Error While Getting Address", error);
    }
};

const vendors = async(city, stateCode) => {
    try {
        const vendorResp = await UserModel.find({
            $or: [{
                city: city
            },
            {
                stateCode: stateCode
            }]
        });

        if (fieldValidator(vendorResp)) return false;

        return vendorResp;
    }
    catch (error) {
        console.error("Error While Getting Vendors", error);
    }
};

async function sendPushNotificationToVendorOnPickUpRequest() {
    console.log("sendPushNotificationToVendorOnPickUpRequest working");
    try {
        const changeStream = await UserOrderModel.collection.watch([{
            $match: {
                operationType: "insert" 
            } 
        }]);

        console.log("Change stream is active...");

        // Set up event listener for insert events
        changeStream.on("change", async (change) => {
            console.log("Insert:", change);
            const doc = change.fullDocument;
            const addressDetail = await addressInfo(doc.addressId);
            const vendorArrayOfObjects = await vendors(addressDetail.city, addressDetail.stateCode);

            // console.log("vendorArrayOfObjects", vendorArrayOfObjects);
            const notificationData = {
                data: {},
                message: `Pickup Request with Quantity ${doc.totalQuantity} Final Amount is ${doc.finalAmount}`,
                title: "You Have New PickUp Request"
            };

            for (const vendorArrayOfObject of vendorArrayOfObjects)
                sendNotification(notificationData, vendorArrayOfObject.userId);
            
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

export default sendPushNotificationToVendorOnPickUpRequest;
