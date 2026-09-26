const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CareCircle = require('../models/CareCircle');
const PlanAndTask = require('../models/PlanAndTask');
const { protect } = require('../middleware/auth');

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'carecircle_jwt_secret_dev_key_2026', {
    expiresIn: '30d',
  });
};

// Generate human-friendly Care Circle invite code (e.g. CARE-9A4B)
const generateInviteCode = () => {
  return 'CARE-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

// @route   POST /api/auth/register
// @desc    Register a new user (Email based)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role, conditions, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required.' });
    }

    const emailNorm = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: emailNorm });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const assignedRole = role === 'caregiver' ? 'caregiver' : 'patient';

    const user = await User.create({
      email: emailNorm,
      passwordHash,
      fullName: fullName.trim(),
      role: assignedRole,
      conditions: assignedRole === 'patient' && Array.isArray(conditions) ? conditions : [],
      phone: phone || '',
    });

    let circle = null;

    // If patient registers, automatically instantiate their Care Circle
    if (assignedRole === 'patient') {
      let code = generateInviteCode();
      // Ensure uniqueness
      while (await CareCircle.findOne({ inviteCode: code })) {
        code = generateInviteCode();
      }

      circle = await CareCircle.create({
        patientId: user._id,
        name: `${user.fullName}'s Care Circle`,
        inviteCode: code,
        members: [
          {
            userId: user._id,
            roleInCircle: 'patient',
            permissions: ['view_monitoring', 'receive_alerts', 'edit_plans'],
          },
        ],
      });

      // Seed initial tasks for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await PlanAndTask.create({
        careCircleId: circle._id,
        date: today,
        patientTasks: [
          {
            id: 'pt-1',
            title: 'Morning gentle mobility & stretching',
            description: '10 minutes of guided arm and leg range-of-motion movements.',
            category: 'exercise',
            status: 'pending',
            estimatedMinutes: 10,
          },
          {
            id: 'pt-2',
            title: 'Hydration & medication check',
            description: 'Drink 300ml water and take morning prescribed medications.',
            category: 'medication',
            status: 'pending',
            estimatedMinutes: 5,
          },
          {
            id: 'pt-3',
            title: 'Afternoon mental check-in',
            description: 'Record daily mood and review rest status with Co-Pilot.',
            category: 'checkin',
            status: 'pending',
            estimatedMinutes: 5,
          },
        ],
        caregiverTasks: [
          {
            id: 'ct-1',
            title: 'Verify morning vitals & medication adherence',
            description: 'Ensure morning meds logged and review rest pattern.',
            category: 'monitoring',
            status: 'pending',
            estimatedMinutes: 10,
          },
          {
            id: 'ct-2',
            title: 'Prepare healthy balanced lunch',
            description: 'Ensure low-sodium diet and adequate hydration.',
            category: 'support',
            status: 'pending',
            estimatedMinutes: 25,
          },
          {
            id: 'ct-3',
            title: '15-minute personal respite break',
            description: 'Step outside or practice deep breathing for caregiver wellness.',
            category: 'self_care',
            status: 'pending',
            estimatedMinutes: 15,
          },
        ],
        aiReasoning: 'Initial baseline daily routine tailored for collaborative care.',
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        conditions: user.conditions,
      },
      circle,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user with email and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update lastActiveAt
    user.lastActiveAt = new Date();
    await user.save();

    // Find linked Care Circle
    const circle = await CareCircle.findOne({
      $or: [{ patientId: user._id }, { 'members.userId': user._id }],
      status: 'active',
    }).populate('patientId', 'fullName email conditions phone');

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        conditions: user.conditions,
        burnoutScore: user.burnoutScore,
        capacityLevel: user.capacityLevel,
      },
      circle,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile and active circle
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      user: req.user,
      circle: req.circle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching user data.' });
  }
});

module.exports = router;
