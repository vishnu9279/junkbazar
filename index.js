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

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// app.use("/api/customer", customerRoute);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to scrap-bazar app");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
