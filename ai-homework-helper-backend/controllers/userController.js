const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// Helper function to read users from file
const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper function to write users to file
const writeUsers = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};


const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it-later';

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const users = await readUsers();

  // Check if user already exists
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user object
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);
  await writeUsers(users);

  // Create token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({
    token,
    user: { id: user.id, username: user.username },
  });
};

// @desc    Authenticate a user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const users = await readUsers();

  // Check for user
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Create token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({
    token,
    user: { id: user.id, username: user.username },
  });
};

// @desc    Update user progress
// @route   POST /api/users/update-progress
const updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === undefined) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = users[userIndex];

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
    
    await writeUsers(users);

    res.status(200).json({
      message: 'Progress updated successfully',
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
        money: user.money,
        reputation: user.reputation,
        inventory: user.inventory,
        xpBoosterExpires: user.xpBoosterExpires,
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
  updateUserProgress
};
