const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
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
      type: String, // image URL (future‑proof)
      default: ''
    },

    // 👇 System fields
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true } // adds createdAt & updatedAt
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
module.exports = mongoose.model('User', userSchema);

