const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Place an Order
// @route   POST /api/orders
// @access  Private
exports.placeOrder = asyncHandler(async (req, res, next) => {
  const { items, totalPrice } = req.body;

  const order = await Order.create({
    user: req.user.id,
    items,
    totalPrice,
  });

  // Send order confirmation email
  const message = `Your order has been successfully placed. Order details: \n\nItems: ${items
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(', ')} \n\nTotal Price: $${totalPrice}`;

  try {
    await sendEmail({
      email: req.user.email,
      subject: 'Order Confirmation',
      message,
    });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.log(err);
    return next(
      new ErrorResponse('Order placed, but email could not be sent', 500)
    );
  }
});
