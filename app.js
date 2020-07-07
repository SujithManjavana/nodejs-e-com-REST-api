require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const path = require('path');
const port = process.env.PORT || 8000;


//Remove
// app.use(express.static(path.join(__dirname, 'build')));

//My routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const catRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const stripeRoutes = require("./routes/stripePayment");

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch(() => {
    console.log("FAILED TO CONNECT DB");
  });

//Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", catRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", stripeRoutes);

app.get("/", (req, res) => {
  res.send("Hello from backend!")
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
