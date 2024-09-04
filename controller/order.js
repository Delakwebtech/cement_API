const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add items to Cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items,
    });
  } else {
    cart.items.push(...items);
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Fetch user Cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('No cart found for this user', 404));
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Place an Order from Cart
// @route   POST /api/orders
// @access  Private
exports.placeOrderFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('No items in cart to place an order', 400));
  }

  const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    totalPrice,
  });

  // Clear the cart after placing the order
  cart.items = [];
  await cart.save();

  // Send order confirmation email
  const message = `Your order has been successfully placed. Order details:\n\nItems: ${cart.items
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(', ')}\n\nTotal Price: $${totalPrice}`;

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
