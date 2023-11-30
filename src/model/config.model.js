import mongoose from "mongoose";
const configSchema = new mongoose.Schema({
    key: {
        required: true,
        type: String,
        unique: true
    },
    value: {
        // Allow any type of value
        required: true, 
        type: mongoose.Schema.Types.Mixed
    }
});

const Config = mongoose.model("Config", configSchema);

export default Config;
