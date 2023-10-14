require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/user", userRoutes);

const url = process.env.DB_URL;
mongoose.connect(url).then(() => {
  console.log("Database is now connected");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
