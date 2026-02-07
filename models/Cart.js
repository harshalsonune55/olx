const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }]
});

module.exports = mongoose.model('Cart', cartSchema);
