require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const expressAsyncErrors = require("express-async-errors");
// const customerRoute = require("./routes/customerRoute");
const userRouter = require("./routes/userRouter");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

process.on("unhandledRejection", (ex) => {
  throw ex;
});

const url = process.env.DB_URL;
mongoose.connect(url).then(() => {
  console.log("Database is now connected");
});

// app.use("/api/customer", customerRoute);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
