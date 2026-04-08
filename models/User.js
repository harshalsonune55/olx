const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // ✅ Only required if NOT Google user
      }
    },

    // ✅ ADD THIS
    googleId: {
      type: String
    },

    // 👇 Profile fields
    college: {
      type: String,
      trim: true
    },

    major: {
      type: String,
      trim: true
    },

    year: {
      type: String,
      enum: [
        'freshman',
        'sophomore',
        'junior',
        'senior',
        'graduate',
        'alumni'
      ]
    },

    studentId: {
      type: String,
      trim: true
    },

    avatar: {
      type: String,
      default: ''
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);

// =======================
// ✅ HASH PASSWORD (NO CHANGE)
// =======================
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// =======================
// ✅ MATCH PASSWORD (SAFE)
// =======================
userSchema.methods.matchPassword = async function (password) {
  if (!this.password) return false; // Google users won't have password
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);