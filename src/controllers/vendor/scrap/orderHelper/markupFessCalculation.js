"use strict";

import CountryModel from "../../../../model/countries.model.js";
import userOrderModel  from "../../../../model/users/userOrder.model.js";
import userAddress  from "../../../../model/users/userAdress.model.js";
import UserModel  from "../../../../model/users/user.model.js";

import fieldValidator from "../../../../utils/fieldValidator.js";
import ApiError from "../../../../utils/ApiError.js";
import {
    CommonMessage,
    statusCodeObject,
    errorAndSuccessCodeConfiguration
} from "../../../../utils/constants.js";
import helper from "../../../../utils/helper.js";

const markupFessCalculation = async (orderObj, session) => {
    console.log("markupFessCalculation working");

    try {
        const address =  await userAddress.findOne({
            addressId: orderObj.addressId
        }).lean();

        if (fieldValidator(address))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        const countryAndStateResp =  await CountryModel.aggregate([
            {
                $match: {
                    iso2: address.countryCode,
                    "states.state_code": address.stateCode
                }
            },
            {
                $project: {
                    _id: 0,
                    iso2: 1,
                    states: {
                        $filter: {
                            as: "state",
                            cond: {
                                $eq: [ "$$state.state_code",
                                    address.stateCode ] 
                            },
                            input: "$states"
                        }
                    }
                }
            }
        ]);

        if (countryAndStateResp.length === 0)  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        // const stateResp = countryAndStateResp[0].states.find(el => el.state_code === stateCode);

        const cityResp = countryAndStateResp[0].states[0].cities.find(el => el.name === address.city);

        console.log("countryAndStateResp", {
            cityResp,
            state: countryAndStateResp[0].states
        });

        if (fieldValidator(cityResp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        const markupFee = parseFloat((orderObj.vendorFinalAmount * (cityResp.marginFees / 100)).toFixed(2));
        const resp = await userOrderModel.findOneAndUpdate({
            orderId: orderObj.orderId,
            vendorId: orderObj.vendorId
        }, {
            $set: {
                markupFee: markupFee,
                markupFeePercentage: cityResp.marginFees
            }
        }, {
            new: true,
            session: session
        });

        const balance =  await helper.updateUserBalance(orderObj.vendorId, "inr", markupFee, "PAYMENT_DUE", orderObj.orderId, session, "due_payment");

        await helper.updateUserBalance("admin", "inr", markupFee, "total_earning", orderObj.orderId, session, "total_earning");

        await UserModel.findOneAndUpdate({
            userId: orderObj.vendorId
        }, {
            $inc: {
                platformFee: markupFee
            }
        }, {
            session: session
        });
        console.log("balance", balance);

        return resp.value;
    }
    catch (error) {
        console.error("Error on getting scrap", error.message);

        throw error;
    }
};

export default markupFessCalculation;
