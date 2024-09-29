const express = require("express");
const bodyParser = require("body-parser");
const deliveryRoutes = require("./routes/deliveryRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());

// Delivery Routes
app.use("/api", deliveryRoutes);

app.listen(port, () => {
  console.log(`Delivery Management Service running on port ${port}`);
});
