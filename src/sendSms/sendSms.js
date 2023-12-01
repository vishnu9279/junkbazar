import axios from "axios";
// import qs from "qs";
import helper from "../utils/helper.js";
import {
    basicConfigurationObject 
} from "../utils/constants.js";

const sendSms = async (phoneNumber, otp) => {
    try {
        // const obj = {
            
        //     templatename: ,
        //     to: phoneNumber
        // };
        
        // console.log("obj", obj);
        // const data = qs.stringify(obj);
        
        // const config = {
        //     data: data,
        //     headers: {},
        //     maxBodyLength: Infinity,
        //     method: "post"
        // };
        const apiUrl =  "https://2factor.in/API/R1/";
        const apiKey = basicConfigurationObject.TWO_FACTOR_API_SMS_SERVICE;
        const senderId = helper.getCacheElement("CONFIG", "SENDER_ID");
        const templateName = helper.getCacheElement("CONFIG", "TEMPLATE_NAME");
        const module = "TRANS_SMS";
        const url = `${apiUrl}?module=${module}&apikey=${apiKey}&to=${phoneNumber}&from=${senderId}&templatename=${templateName}&var1=${otp}`;
        
        const response = await axios.get(url);

        console.log(JSON.stringify(response.data));

        return response.data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};

export default sendSms;
