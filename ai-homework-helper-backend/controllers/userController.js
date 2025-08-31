const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import User model

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it-later';

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { username, password, school } = req.body;

  if (!username || !password || !school) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      school,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, school: user.school },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.time('bcrypt.compare');
    const isMatch = await bcrypt.compare(password, user.password);
    console.timeEnd('bcrypt.compare');
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Update user progress
// @route   POST /api/users/update-progress
const updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === undefined) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBoosterActive = user.xpBoosterExpires && user.xpBoosterExpires > Date.now();
    const xpGained = isBoosterActive ? 20 : 10;

    user.money += 100;
    user.xp += xpGained;

    // Update reputation based on XP
    const oldReputation = user.reputation;
    if (user.xp >= 500) {
      user.reputation = '프로';
    } else if (user.xp >= 250) {
      user.reputation = '미들';
    } else if (user.xp >= 50) {
      user.reputation = '루키';
    }

    const reputationChanged = oldReputation !== user.reputation;
    
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Progress updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        money: updatedUser.money,
        reputation: updatedUser.reputation,
        inventory: updatedUser.inventory,
        xpBoosterExpires: updatedUser.xpBoosterExpires,
      },
      reputationChanged,
    });

  } catch (error) {
    console.error('Error in /api/user/update-progress:', error);
    res.status(500).json({ message: 'Failed to update user progress' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  updateUserProgress,
};