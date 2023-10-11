const express = require("express");
const app = express();

// Connect to the MongoDB database
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/scrap-metal-pickup-app");

// Create the Express.js server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

// Define the API endpoints
app.get("/", (req, res) => {
  res.send("Hello World!");
});
