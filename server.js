const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const Message = require('./models/Message'); 

// 🔥 NEW (Socket.io)
const http = require('http');
const { Server } = require('socket.io');

const chatRoutes = require('./routes/chat');

dotenv.config();

const app = express();

// 🔥 CREATE SERVER + SOCKET
const server = http.createServer(app);
const io = new Server(server);

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

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Current user
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;

  // 🔥 Count unread messages for navbar badge
  if (req.user) {
    const Message = require('./models/Message');
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });
    res.locals.unreadCount = unreadCount;
  } else {
    res.locals.unreadCount = 0;
  }

  next();
});

// ==========================
// 🔥 SOCKET.IO LOGIC
// ==========================


io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    const { text, receiverId, senderId } = data;
    await Message.create({ sender: senderId, receiver: receiverId, text });
    socket.to(receiverId).emit('receiveMessage', { text });

    // 🔥 Push updated unread count to receiver
    const unreadCount = await Message.countDocuments({ receiver: receiverId, read: false });
    socket.to(receiverId).emit('updateBadge', { count: unreadCount });
  });

  // 🔥 Handle markRead — called when user opens a chat
  socket.on('markRead', async ({ senderId, receiverId }) => {
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { read: true }
    );

    // Push updated count back to the reader
    const unreadCount = await Message.countDocuments({ receiver: receiverId, read: false });
    socket.to(receiverId).emit('updateBadge', { count: unreadCount });

    // Also emit to self (same socket) since they're the one reading
    socket.emit('updateBadge', { count: unreadCount });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// ==========================
// ROUTES
// ==========================
const adRoutes = require('./routes/ads');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/', adRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', chatRoutes);

// ==========================
// 🔥 START SERVER (IMPORTANT)
// ==========================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});