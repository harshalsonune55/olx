const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');


router.get('/inbox', isLoggedIn, async (req, res) => {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).populate('sender receiver').sort({ createdAt: -1 });
  
    // Group by the OTHER user — keep only latest message per conversation
    const seen = new Set();
    const conversations = [];
  
    for (const msg of messages) {
      const otherId = msg.sender._id.equals(req.user._id)
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
  
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({
          otherUser: msg.sender._id.equals(req.user._id) ? msg.receiver : msg.sender,
          lastMessage: msg.text,
          time: msg.createdAt
        });
      }
    }
  
    res.render('chat/inbox', { conversations });
  });


router.get('/chat/:userId',isLoggedIn, async (req, res) => {
  const otherUser = await User.findById(req.params.userId);

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUser._id },
      { sender: otherUser._id, receiver: req.user._id }
    ]
  });

  res.render('chat/chat', { messages, otherUser });
});

router.get('/chat/:userId', isLoggedIn, async (req, res) => {
    const otherUser = await User.findById(req.params.userId);
  
    // 🔥 Mark all messages from this user as read
    await Message.updateMany(
      { sender: otherUser._id, receiver: req.user._id, read: false },
      { read: true }
    );
  
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUser._id },
        { sender: otherUser._id, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
  
    res.render('chat/chat', { messages, otherUser });
  });



module.exports = router;