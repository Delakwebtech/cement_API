const express = require("express");
const {
  addToCart,
  getCart,
  placeOrderFromCart,
} = require("../controller/order");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart);

router
  .route('/order')
  .post(protect, placeOrderFromCart);

module.exports = router;
