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
      status: 'pending',
    });

    // Send high-priority notification to all administrators
    try {
      const allUsers = (await db.users.list()) || [];
      const admins = allUsers.filter((u) => u.role === 'admin');
      for (const admin of admins) {
        await db.notifications.create({
          user_id: admin.id,
          message: `New Researcher Registration: "${newUser.full_name}" (${newUser.email}) registered and is awaiting admin verification.`,
        });
      }
    } catch (notifErr) {
      console.warn('[AUTH] Could not send admin notification:', notifErr);
    }

    // Do NOT generate a login token. User must be approved by admin first.
    res.status(201).json({
      success: true,
      pendingVerification: true,
      message: 'Account created! Waiting for admin verification.',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        status: 'pending',
      },
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

    if (user.status === 'pending' || user.status === 'pending_verification') {
      return res.status(403).json({
        success: false,
        isPendingVerification: true,
        message: 'Account created, waiting for admin verification. Please wait for an administrator to approve your account before signing in.',
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
