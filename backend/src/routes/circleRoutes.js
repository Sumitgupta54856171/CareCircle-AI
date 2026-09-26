const express = require('express');
const router = express.Router();
const CareCircle = require('../models/CareCircle');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/circles/my-circle
// @desc    Get current user's active care circle
// @access  Private
router.get('/my-circle', protect, async (req, res) => {
  try {
    const circle = await CareCircle.findOne({
      $or: [{ patientId: req.user._id }, { 'members.userId': req.user._id }],
      status: 'active',
    })
      .populate('patientId', 'fullName email conditions phone')
      .populate('members.userId', 'fullName email role');

    if (!circle) {
      return res.status(404).json({ message: 'No active Care Circle found for this user.' });
    }

    return res.json(circle);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/circles/join
// @desc    Join a Care Circle via inviteCode or Patient Email
// @access  Private
router.post('/join', protect, async (req, res) => {
  try {
    const { inviteCode, patientEmail } = req.body;

    if (!inviteCode && !patientEmail) {
      return res.status(400).json({ message: 'Please provide either an invite code or the patient email.' });
    }

    let query = { status: 'active' };
    if (inviteCode) {
      query.inviteCode = inviteCode.trim().toUpperCase();
    } else if (patientEmail) {
      const patient = await User.findOne({ email: patientEmail.toLowerCase().trim() });
      if (!patient) {
        return res.status(404).json({ message: 'Patient with this email not found.' });
      }
      query.patientId = patient._id;
    }

    const circle = await CareCircle.findOne(query);
    if (!circle) {
      return res.status(404).json({ message: 'Care Circle not found with the provided details.' });
    }

    // Check if user is already a member
    const isMember = circle.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (isMember) {
      const populated = await CareCircle.findById(circle._id)
        .populate('patientId', 'fullName email conditions phone')
        .populate('members.userId', 'fullName email role');
      return res.json({ message: 'Already a member of this circle.', circle: populated });
    }

    // Add to members
    const roleInCircle = req.user.role === 'caregiver' ? 'primary_caregiver' : 'family';
    circle.members.push({
      userId: req.user._id,
      roleInCircle,
      permissions: ['view_monitoring', 'receive_alerts', 'edit_plans'],
      joinedAt: new Date(),
    });

    await circle.save();

    const populated = await CareCircle.findById(circle._id)
      .populate('patientId', 'fullName email conditions phone')
      .populate('members.userId', 'fullName email role');

    return res.json({ message: 'Successfully joined Care Circle!', circle: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/circles/invite-email
// @desc    Invite a caregiver/member by email
// @access  Private
router.post('/invite-email', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Recipient email is required.' });
    }

    if (!req.circle) {
      return res.status(400).json({ message: 'You must have an active Care Circle to invite members.' });
    }

    const emailNorm = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailNorm });

    if (existingUser) {
      // Add existing user directly if not already in members
      const alreadyMember = req.circle.members.some(
        (m) => m.userId.toString() === existingUser._id.toString()
      );
      if (!alreadyMember) {
        req.circle.members.push({
          userId: existingUser._id,
          roleInCircle: existingUser.role === 'caregiver' ? 'primary_caregiver' : 'family',
          permissions: ['view_monitoring', 'receive_alerts', 'edit_plans'],
          joinedAt: new Date(),
        });
        await req.circle.save();
      }
    }

    return res.json({
      message: `Invite prepared for ${emailNorm}. They can join using Circle Code: ${req.circle.inviteCode}`,
      inviteCode: req.circle.inviteCode,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
