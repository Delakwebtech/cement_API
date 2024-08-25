const express = require('express');
const { placeOrder } = require('../controller/order');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, placeOrder);

module.exports = router;
