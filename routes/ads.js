const express = require('express');
const Ad = require('../models/Ad');
const router = express.Router();

// Show all ads
router.get('/', async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });
  res.render('index', { ads });
});

// Show form
router.get('/ads/new', (req, res) => {
  res.render('new');
});

// Handle form POST
router.post('/ads', async (req, res) => {
  const { title, description, price, image } = req.body;
  const ad = new Ad({ title, description, price, image ,user: req.user._id});
  await ad.save();
  res.redirect('/');
});
router.get('/ads/:id', async (req, res) => {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).send('Ad not found');
    res.render('ad-details', { ad });
  });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }
  
  // Example: Protect ad posting
  router.get('/ads/new', isLoggedIn, (req, res) => {
    res.render('new');
  });



// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

async function isOwner(req, res, next) {
  const ad = await Ad.findById(req.params.id);
  if (!ad || !ad.user.equals(req.user._id)) {
    return res.status(403).send('Unauthorized');
  }
  next();
}

// VIEW SINGLE AD
router.get('/ads/:id', async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  res.render('ads/show', { ad });
});

// EDIT FORM
router.get('/ads/:id/edit', isLoggedIn, isOwner, async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  res.render('ads/edit', { ad });
});

// UPDATE
router.post('/ads/:id/edit', isLoggedIn, isOwner, async (req, res) => {
  const { title, description, price, image } = req.body;
  await Ad.findByIdAndUpdate(req.params.id, { title, description, price, image });
  res.redirect(`/ads/${req.params.id}`);
});

// DELETE
router.post('/ads/:id/delete', isLoggedIn, isOwner, async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);
  res.redirect('/');
});
  
module.exports = router;
