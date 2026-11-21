import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db-index.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new researcher / member
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.users.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists. Please log in.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.users.create({
      full_name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'researcher',
    });

    // Create welcome notification
    await db.notifications.create({
      user_id: newUser.id,
      message: `Welcome to Niger Delta University Library, ${newUser.full_name}! You can now submit manuscripts and track peer reviews online.`,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now signed in.',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('[AUTH REGISTER ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.users.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the Library Admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/status
// @desc    Get current user profile if authenticated
router.get('/status', (req, res) => {
  if (req.user) {
    const { password, ...safeUser } = req.user;
    return res.json({
      loggedIn: true,
      user: safeUser,
    });
  }
  res.json({
    loggedIn: false,
    user: null,
  });
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Signed out successfully.' });
});

export default router;
