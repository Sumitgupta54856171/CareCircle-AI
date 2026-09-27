const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// @route   GET /api/alerts
// @desc    Get all alerts for the user's Care Circle
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.json({ alerts: [], activeCount: 0 });
    }

    const alerts = await Alert.find({ careCircleId: req.circle._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('triggeredFor', 'fullName role')
      .populate('acknowledgedBy', 'fullName role')
      .populate('resolvedBy', 'fullName role');

    const activeCount = alerts.filter(
      (a) => a.status === 'new' || a.status === 'acknowledged'
    ).length;

    return res.json({ alerts, activeCount });
  } catch (error) {
    console.error('[Alerts GET Error]:', error);
    return res.status(500).json({ message: 'Failed to retrieve alerts: ' + error.message });
  }
});

// @route   PATCH /api/alerts/:id/acknowledge
// @desc    Acknowledge an alert
// @access  Private
router.patch('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    await alert.populate('acknowledgedBy', 'fullName role');

    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${alert.careCircleId}`).emit('alert:update', alert);
    }

    return res.json({ success: true, message: 'Alert acknowledged.', alert });
  } catch (error) {
    console.error('[Alert Acknowledge Error]:', error);
    return res.status(500).json({ message: 'Failed to acknowledge alert: ' + error.message });
  }
});

// @route   PATCH /api/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    alert.status = 'resolved';
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();
    await alert.save();

    await alert.populate('resolvedBy', 'fullName role');

    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${alert.careCircleId}`).emit('alert:update', alert);
    }

    return res.json({ success: true, message: 'Alert marked as resolved.', alert });
  } catch (error) {
    console.error('[Alert Resolve Error]:', error);
    return res.status(500).json({ message: 'Failed to resolve alert: ' + error.message });
  }
});

// @route   POST /api/alerts
// @desc    Create a manual alert (Emergency, Gentle Nudge, or Custom)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const { type, title, message, severity } = req.body;
    const patientName = req.circle.patientId?.fullName || req.user.fullName;

    let alertSeverity = severity || 'medium';
    let alertTitle = title;
    let alertMessage = message;
    let suggestedActions = [];

    if (type === 'emergency_signal') {
      alertSeverity = 'emergency';
      alertTitle = `${patientName} triggered an Emergency Signal`;
      alertMessage = `${patientName} pressed the emergency assistance button on their device. Please check in immediately.`;
      suggestedActions = [
        { label: `Call ${patientName}`, actionType: 'call' },
        { label: 'Chat with AI Co-Pilot', actionType: 'nav_chat' },
      ];
    } else if (type === 'gentle_nudge') {
      alertSeverity = 'low';
      alertTitle = `Gentle Care Nudge from ${req.user.fullName}`;
      alertMessage = message || `A warm reminder to check today's wellness plan and take a gentle rest break.`;
      suggestedActions = [
        { label: 'View Today’s Plan', actionType: 'nav_plan' },
        { label: 'Check Medications', actionType: 'nav_meds' },
      ];
    } else {
      if (!alertTitle || !alertMessage) {
        return res.status(400).json({ message: 'Alert title and message are required.' });
      }
      suggestedActions = [
        { label: 'View Today’s Plan', actionType: 'nav_plan' },
        { label: 'Ask AI Co-Pilot', actionType: 'nav_chat' },
      ];
    }

    const alert = await Alert.create({
      careCircleId: req.circle._id,
      triggeredFor: req.user._id,
      severity: alertSeverity,
      type: type || 'custom',
      title: alertTitle,
      message: alertMessage,
      suggestedActions,
      status: 'new',
    });

    await alert.populate('triggeredFor', 'fullName role');

    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${req.circle._id}`).emit('alert:new', alert);
    }

    return res.status(201).json({ success: true, alert });
  } catch (error) {
    console.error('[Create Alert Error]:', error);
    return res.status(500).json({ message: 'Failed to create alert: ' + error.message });
  }
});

module.exports = router;
