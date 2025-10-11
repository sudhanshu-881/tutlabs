const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Using a simple in-memory store for users.
// In a production app, you would use a database like PostgreSQL or MongoDB.
const users = [];
let userIdCounter = 1;

// A secret key for signing JWTs. In production, use an environment variable.
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-secure';

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create and store the new user
    const newUser = {
      id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
    };
    users.push(newUser);

    // Create and sign a JWT
    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        token,
        user: payload,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User matched, create and sign a JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: payload,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
