const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// =======================
// ✅ REGISTER
// =======================
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const user = new User({ username, password });
  await user.save();

  res.redirect('/login');
});

// =======================
// ✅ LOCAL LOGIN
// =======================
router.get('/login', (req, res) => res.render('auth/login'));

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

// =======================
// ✅ GOOGLE LOGIN (ADD THIS)
// =======================

// Step 1 → Redirect to Google
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Step 2 → Callback from Google
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/'); // or /dashboard
  }
);

// =======================
// ✅ LOGOUT
// =======================
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;