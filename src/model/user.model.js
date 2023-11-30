import mongoose from "mongoose";
import RolesEnum  from "../../src/utils/roles.js";
const userSchema = new mongoose.Schema(
    {
        dialCode: {
            required: true,
            type: String
        },
        OTP: {
            type: String
        },
        otpExpiryTime: {
            required: true,
            type: Number
        },
        
        phoneNumber: {
            required: true,
            type: String,
            unique: true
        },
        
        roles: {
            default: RolesEnum.USER,
            type: Number
        },
        
        status: {
            default: "Offline",
            type: String
        },

        verified: {
            default: false,
            type: Boolean
        }
    },
    {
        timestamps: true 
    }
);

const User = mongoose.model("users", userSchema);

export default User;
