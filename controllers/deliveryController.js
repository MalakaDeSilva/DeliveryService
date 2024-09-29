const { dynamoClient } = require("../config");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// Create a new delivery
exports.createDelivery = async (req, res) => {
  const { orderId, deliveryAddress } = req.body;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_DELIVERIES,
    Item: {
      deliveryId: uuidv4(),
      orderId,
      deliveryAddress,
      deliveryStatus: "DISPATCHED",
    },
  };

  try {
    await dynamoClient.put(params).promise();
    await axios.put(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      deliveryStatus: "DISPATCHED",
    });
    res
      .status(201)
      .send({
        message: "Delivery created successfully",
        delivery: params.Item,
      });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to create delivery", details: error.message });
  }
};

// Get a specific delivery by ID
exports.getDelivery = async (req, res) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_DELIVERIES,
    Key: {
      deliveryId: req.params.deliveryId,
    },
  };

  try {
    const data = await dynamoClient.get(params).promise();
    if (!data.Item) {
      return res.status(404).send({ error: "Delivery not found" });
    }
    res.send(data.Item);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to get delivery", details: error.message });
  }
};

// Update delivery status
exports.updateDelivery = async (req, res) => {
  const { deliveryStatus } = req.body;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_DELIVERIES,
    Key: {
      deliveryId: req.params.deliveryId,
    },
    UpdateExpression: "set deliveryStatus = :status",
    ExpressionAttributeValues: {
      ":status": deliveryStatus,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await dynamoClient.update(params).promise();

    // Notify Order Management Service about the delivery status change
    const delivery = data.Attributes;
    await axios.put(
      `${process.env.ORDER_SERVICE_URL}/api/orders/${delivery.orderId}`,
      {
        deliveryStatus: delivery.deliveryStatus,
      }
    );

    res.send({
      message: "Delivery updated",
      updatedAttributes: data.Attributes,
    });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to update delivery", details: error.message });
  }
};

// Delete a delivery
exports.deleteDelivery = async (req, res) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_DELIVERIES,
    Key: {
      deliveryId: req.params.deliveryId,
    },
  };

  try {
    await dynamoClient.delete(params).promise();
    res.send({ message: "Delivery deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to delete delivery", details: error.message });
  }
};
