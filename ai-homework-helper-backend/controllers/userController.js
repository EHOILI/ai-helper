const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store (for prototyping)
const users = [];
const JWT_SECRET = 'your-super-secret-key-change-it-later'; // It's better to use environment variables for this

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

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

module.exports = {
  registerUser,
  loginUser,
};
