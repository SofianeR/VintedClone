require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const userRoutes = require("./Routes/users");
app.use(userRoutes);

const offerRoutes = require("./Routes/offers");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(400).json("Page Introuvable !");
});

app.listen(process.env.PORT, () => {
  console.log("Server launched !");
});
