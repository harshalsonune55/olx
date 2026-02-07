const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
  orderedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
