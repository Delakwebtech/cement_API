const Order = require("../models/Order");
const Cart = require("../models/Cart");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");

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
    return next(new ErrorResponse("No cart found for this user", 404));
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
  const carts = await Cart.findOne({ user: req.user.id });

  if (!carts || carts.items.length === 0) {
    return next(new ErrorResponse("No items in cart to place an order", 400));
  }

  const totalPrice = carts.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: req.user.id,
    items: carts.items,
    totalPrice,
  });

  // Prepare cart items for email
  const formattedCartItems = carts.items.map((item) => ({
    description: item.name,
    amount: (item.price * item.quantity).toFixed(2),
  }));

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      TemplateId: 37209866,
      TemplateModel: {
        userName: req.user.name,
        totalPrice: totalPrice.toFixed(2),
        cartItems: formattedCartItems
      },
    });

    // Clear the cart after placing the order
    carts.items = [];
    await carts.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.log(err);
    return next(
      new ErrorResponse("Order placed, but email could not be sent", 500)
    );
  }
});
