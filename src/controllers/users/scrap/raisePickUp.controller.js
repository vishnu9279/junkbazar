"use strict";

import asyncHandler from "../../../utils/asyncHandler.js";
import UserOrderModel  from "../../../model/users/userOrder.model.js";
import userAddress  from "../../../model/users/userAdress.model.js";
import CountryModel from "../../../model/countries.model.js";

import cartModel  from "../../../model/users/cart.model.js";
import UserModel  from "../../../model/users/user.model.js";
import Scrap  from "../../../model/users/scrap.model.js";
import fieldValidator from "../../../utils/fieldValidator.js";
import ApiError from "../../../utils/ApiError.js";
import {
    CommonMessage, statusCodeObject, errorAndSuccessCodeConfiguration, ScrapMessage, OrderMessage, AddToCartMessage, AddAdressMessage
} from "../../../utils/constants.js";
import helper from "../../../utils/helper.js";

import ApiResponse from "../../../utils/ApiSuccess.js";
import saveAddAddressHelper from "../saveAddressHelper.controller.js";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

import {
    getNewMongoSession
} from "../../../configuration/dbConnection.js";
import OrdersEnum from "../../../utils/orderStatus.js";
const raisePickUp = asyncHandler (async (req, res) => {
    console.log("UserPickAddress working", req.body);
    let addressResp, session;
    const currentTime = new Date().getTime();
    let finalAmount = 0;
    let totalQuantity = 0;

    try {
        session = await getNewMongoSession();
    
        session.startTransaction();
        const userId = req.decoded.userId;
        const userIdF_k = req.decoded.userIdF_k;
        let scrapIds = req.body.scrapIds;
        const {
            fullName, stateCode, countryCode, pincode, dialCode, phoneNumber, address, city, addToCartId, addressId
        } = req.body;
        
        if (fieldValidator(fullName) || fieldValidator(dialCode) || fieldValidator(phoneNumber) || fieldValidator(scrapIds) || fieldValidator(addToCartId)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);
        
        if (!helper.phoneNumberValidation(phoneNumber)) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.PLEASE_ENTER_VALID_PHONE_NUMBER);
        
        const countryAndStateResp =  await CountryModel.aggregate([
            {
                $match: {
                    iso2: countryCode,
                    "states.state_code": stateCode
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
                                    stateCode ] 
                            },
                            input: "$states"
                        }
                    }
                }
            }
        ]);

        if (countryAndStateResp.length === 0)  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        console.log("countryAndStateResp", countryAndStateResp[0].states);
        const stateResp = countryAndStateResp[0].states.map(el => el.state_code === stateCode);
        const cityResp = stateResp.cities.find(el => el.name === city);

        if (fieldValidator(cityResp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);

        scrapIds = scrapIds.split(",").map(el => el.trim());
        console.log("scrapIds", scrapIds);
        
        const scraps = await Scrap.find({
            scrapId: {
                $in: scrapIds
            }
        });

        console.log(scraps.length, scrapIds.length, fieldValidator(scraps));

        if (scraps.length !== scrapIds.length) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_NOT_FOUND);
    
        const ordersObj = {
            addToCartId,
            currentTime,
            dayNumber: await helper.getDayNumber(),
            dialCode,
            fullName,
            monthNumber: await helper.getMonthNumber(),
            orderId: uid.rnd(6),
            phoneNumber,
            userId,
            userIdF_k,
            weekNumber: await helper.getWeekNumber()
        };

        if (fieldValidator(addressId) && (fieldValidator(stateCode) || fieldValidator(countryCode) || fieldValidator(pincode) || fieldValidator(address) || fieldValidator(city))) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, CommonMessage.ERROR_FIELD_REQUIRED);

        if (fieldValidator(addressId)){
            addressResp = await saveAddAddressHelper(stateCode, countryCode, pincode, address, city, userId, fullName, dialCode, phoneNumber, session);
            ordersObj.addressId = addressResp.addressId;
        }
        else {
            const userAddressResp = await userAddress.find({
                addressId
            });
        
            if (fieldValidator(userAddressResp)) 
                throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, AddAdressMessage.ADDRESS_NOT_FOUND);

            ordersObj.addressId = addressId;
        }

        const userCart = await cartModel.find({
            addToCartId,
            userId
        }).lean();

        console.log("userCart", userCart[0].items);

        if (fieldValidator(userCart))  throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, AddToCartMessage.SCRAP_NOT_FOUND);

        const ordersItemArray = [];

        for (const scrap of scraps) {
            const userCartQuantity = userCart[0].items.find(el => el.scrapId === scrap.scrapId);

            console.log("userCartQuantity", userCartQuantity);

            if (fieldValidator(userCartQuantity) || userCartQuantity.quantity <= 0) throw new ApiError(statusCodeObject.HTTP_STATUS_BAD_REQUEST, errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST, OrderMessage.SCRAP_QUANTITY);

            const inidividualOrderPrice = parseFloat((userCartQuantity.quantity * scrap.price).toFixed(2));

            finalAmount += inidividualOrderPrice;
            totalQuantity += userCartQuantity.quantity;
            ordersItemArray.push({
                amount: inidividualOrderPrice,
                price: scrap.price,
                quantity: userCartQuantity.quantity,
                quantityType: scrap.quantityType,
                scrapId: scrap.scrapId,
                scrapIdF_K: scrap._id
            });
        }
        const markupFee = parseFloat(finalAmount * (cityResp.marginFees / 100));

        ordersObj.items = ordersItemArray;
        ordersObj.finalAmount = finalAmount;
        ordersObj.totalQuantity = totalQuantity;
        ordersObj.markupFee = markupFee;
        
        if (ordersObj.totalQuantity >= helper.getCacheElement("CONFIG", "SCRAP_QUANTITY"))
            ordersObj.orderStatus = OrdersEnum.ASSIGN_TO_ADMIN;

        console.log("orderObj", ordersObj);
        const userOrderModelMapping = new UserOrderModel(ordersObj);
        
        const resp = await userOrderModelMapping.save({
            session
        });

        if (fieldValidator(resp))  throw new ApiError(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR, errorAndSuccessCodeConfiguration.HTTP_STATUS_INTERNAL_SERVER_ERROR, CommonMessage.SOMETHING_WENT_WRONG);
        
        const respValue = await cartModel.updateOne({
            addToCartId,
            enabled: true,
            userId
        }, {
            $pull: {
                items: {
                    scrapId: {
                        $in: scrapIds 
                    } 
                } 
            }
        }, {
            new: true,
            session: session
        });

        if (fieldValidator(respValue)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        await cartModel.deleteOne({
            $expr: {
                $eq: [{
                    $size: "$items" 
                },
                0 ]
            },
            userId
        });

        const userResp = await UserModel.updateOne({
            userId
        }, {
            $inc: {
                scrapSoldCount: scrapIds.length
            }
        }, {
            session: session
        });

        if (fieldValidator(userResp)) 
            throw new ApiError(statusCodeObject.HTTP_STATUS_CONFLICT, errorAndSuccessCodeConfiguration.HTTP_STATUS_CONFLICT, ScrapMessage.SCRAP_ALREADY_EXIST);

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json(
            new ApiResponse(statusCodeObject.HTTP_STATUS_OK, errorAndSuccessCodeConfiguration.HTTP_STATUS_OK, {}, ScrapMessage.SCRAP_SUCCESSFULLY_SAVED)
        );
    }
    catch (error) {
        console.error("Error while Creating User", error.message);
        await session.abortTransaction();
        await session.endSession();

        if (error instanceof ApiError) {
            console.log("Api Error instance");

            // Handle ApiError instances with dynamic status code and message
            return res.status(error.statusCode).json({
                error: error || CommonMessage.SOMETHING_WENT_WRONG
            });
        }
        else {
            // Handle other types of errors
            console.error("Error in registerUser:", error);

            return res.status(statusCodeObject.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
                error: CommonMessage.SOMETHING_WENT_WRONG 
            });
        }
    }
});

export default raisePickUp;