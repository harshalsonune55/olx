const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Ad = require('../models/Ad');
const User=require('../models/User')

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// GET profile
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("user/profile", { user: req.user });
});

// GET edit profile
router.get("/profile/edit", isLoggedIn, (req, res) => {
  res.render("edit-profile", { user: req.user });
});

// POST update
router.post("/profile/edit", isLoggedIn, async (req, res) => {
  const { college, major, year, studentId } = req.body;
  await User.findByIdAndUpdate(req.user._id, { college, major, year, studentId });
  res.redirect("/");
});


router.get('/cart', isLoggedIn, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('ads');
  res.render('user/cart', { ads: cart?.ads || [] });
});

router.post('/cart/:id', isLoggedIn, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, ads: [] });

  if (!cart.ads.includes(req.params.id)) {
    cart.ads.push(req.params.id);
    await cart.save();
  }

  res.redirect('/cart');
});

router.get('/orders', isLoggedIn, async (req, res) => {
  const order = await Order.findOne({ user: req.user._id }).populate('ads');
  res.render('user/orders', { ads: order?.ads || [] });
});

router.post('/orders/:id', isLoggedIn, async (req, res) => {
  let order = await Order.findOne({ user: req.user._id });
  if (!order) order = new Order({ user: req.user._id, ads: [] });

  if (!order.ads.includes(req.params.id)) {
    order.ads.push(req.params.id);
    await order.save();
  }

  res.redirect('/orders');
});

module.exports = router;
