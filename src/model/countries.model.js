"use strict";

import mongoose from "mongoose";
const countrySchema = new mongoose.Schema({
    key: {
        required: true,
        type: String
    },
    value: {
        // Allow any type of value
        required: true, 
        type: mongoose.Schema.Types.Mixed
    }
});

const CountryModel = mongoose.model("countries_states_citie", countrySchema);

export default CountryModel;
