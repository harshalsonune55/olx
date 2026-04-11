const express = require('express');
const Ad = require('../models/Ad');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'olx-ads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Show all ads
router.get('/', async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });
  res.render('index', { ads });
});



// Handle form POST
router.post('/ads', isLoggedIn, upload.single('image'), async (req, res) => {
  const { title, description, price, isDonation } = req.body;
  const image = req.file ? req.file.path : '/default.jpg';

  const ad = new Ad({
    title,
    description,
    price: isDonation === "true" ? 0 : price,
    image,
    user: req.user._id,
    isDonation: isDonation === "true"
  });

  await ad.save();
  res.redirect('/');
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
  const ad = await Ad.findById(req.params.id).populate('user'); // 🔥 FIX

  if (!ad) return res.status(404).send('Ad not found');

  res.render('ad-details', { ad }); // make sure this matches your file
});

// EDIT FORM
router.get('/ads/:id/edit', isLoggedIn, isOwner, async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  res.render('ads/edit', { ad });
});

// UPDATE
router.post('/ads/:id/edit', isLoggedIn, isOwner, upload.single('image'), async (req, res) => {
  const { title, description, price } = req.body;
  const updateData = { title, description, price };
  if (req.file) updateData.image = req.file.path;
  await Ad.findByIdAndUpdate(req.params.id, updateData);
  res.redirect(`/ads/${req.params.id}`);
});

// DELETE
router.post('/ads/:id/delete', isLoggedIn, isOwner, async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);
  res.redirect('/');
});
  
module.exports = router;
