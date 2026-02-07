const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register
router.get('/register', (req, res) => res.render('auth/register'));
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.redirect('/login');
});

// Login
router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
