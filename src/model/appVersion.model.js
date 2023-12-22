"use strict";

import mongoose from "mongoose";
const configSchema = new mongoose.Schema({
    app_version: {
        required: true, 
        type: String
    },
    type: {
        required: true,
        type: String
    },
    updateForceFully: {
        required: true, 
        type: Boolean
    }
});

const AppVersion = mongoose.model("app_version", configSchema);

export default AppVersion;
