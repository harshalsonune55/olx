const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');

dotenv.config();

const app = express();

// Passport Config
require('./config/passport')(passport);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS + Layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Body Parser & Static Files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make currentUser available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes
const adRoutes = require('./routes/ads');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/', adRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
