const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");

// Define routes for delivery management
router.post("/deliveries", deliveryController.createDelivery);
router.get("/deliveries/:deliveryId", deliveryController.getDelivery);
router.put("/deliveries/:deliveryId", deliveryController.updateDelivery);
router.delete("/deliveries/:deliveryId", deliveryController.deleteDelivery);

module.exports = router;
