const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    report: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    notification: {
        type: Boolean,
        default: true
    }
});

const Item = mongoose.model("reports", reportSchema);

module.exports = Item;
