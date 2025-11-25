const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  school: {
    type: String,
  },
  xp: {
    type: Number,
    default: 0,
  },
  money: {
    type: Number,
    default: 0,
  },
  explanationTickets: {
    type: Number,
    default: 3,
  },
  reputation: {
    type: String,
    default: '루키',
  },
  inventory: {
    type: Array,
    default: [],
  },
  xpBoosterExpires: {
    type: Date,
    default: null,
  },
  equippedTheme: {
    type: String,
    default: 'default',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('User', userSchema);
