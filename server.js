const express = require("express");
const app = express();
const cors = require("cors");
const connectToDB = require("./db/connectToDB");
require("dotenv").config();
const userRouter = require("./controllers/userController");
const eventRouter = require("./controllers/eventController");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
connectToDB()
const PORT = process.env.PORT || 3000;
app.use("/user",userRouter);
app.use("/event",eventRouter);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})