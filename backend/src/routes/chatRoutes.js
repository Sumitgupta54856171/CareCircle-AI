const express = require('express');
const router = express.Router();
const axios = require('axios');
const ChatMessage = require('../models/ChatMessage');
const Medication = require('../models/Medication');
const PlanAndTask = require('../models/PlanAndTask');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// Context-aware AI Co-pilot fallback response engine
const generateEmpatheticResponse = (userMsg, role, patientInfo, medications, plan) => {
  const query = userMsg.toLowerCase();
  const patientName = patientInfo?.fullName || 'the patient';
  const conditions = patientInfo?.conditions?.length ? patientInfo.conditions.join(', ') : 'general recovery';

  // 1. Inquiries about medications
  if (query.includes('med') || query.includes('pill') || query.includes('dose') || query.includes('tablet')) {
    if (!medications || medications.length === 0) {
      return `Currently, there are no active medications recorded in ${patientName}'s Care Circle. You can add prescriptions under the Medications tab anytime!`;
    }
    const medList = medications.map((m) => `• **${m.name}** (${m.dosage}) at ${m.times.join(', ')} — ${m.instructions}`).join('\n');
    return `Here is ${patientName}'s current medication schedule:\n\n${medList}\n\nRemember to log each dose after taking it to keep the whole care circle in sync!`;
  }

  // 2. Inquiries about tasks / today's plan
  if (query.includes('task') || query.includes('plan') || query.includes('today') || query.includes('schedule')) {
    if (!plan) {
      return `Today's adaptive plan is ready in the Tasks section. You can track mobility, medications, and wellness breaks there.`;
    }
    const myTasks = role === 'caregiver' ? plan.caregiverTasks : plan.patientTasks;
    const pending = myTasks.filter((t) => t.status !== 'completed');
    if (pending.length === 0) {
      return `Wonderful job! All tasks on your ${role} plan for today have been completed. Make sure to rest and stay well hydrated.`;
    }
    const list = pending.map((t) => `• ${t.title} (~${t.estimatedMinutes || 15} mins)`).join('\n');
    return `You have ${pending.length} pending task(s) for today:\n\n${list}\n\nTake them one step at a time!`;
  }

  // 3. Caregiver burnout / stress / exhaustion
  if (query.includes('tired') || query.includes('burnout') || query.includes('exhausted') || query.includes('stress') || query.includes('overwhelm')) {
    if (role === 'caregiver') {
      return `Caregiving is deeply meaningful, but it can also be physically and emotionally demanding. Your well-being matters just as much as ${patientName}'s. Please take 5 to 10 minutes to sit quietly, breathe deeply, or step outside. You are doing an incredible job.`;
    } else {
      return `I hear you. Healing takes time and rest is a vital part of your recovery from ${conditions}. Don't hesitate to take a short nap or listen to calming music. I'll make sure your caregiver is aware to give you peaceful space.`;
    }
  }

  // 4. Inquiries about conditions
  if (query.includes('stroke') || query.includes('diabetes') || query.includes('blood') || query.includes('pressure')) {
    return `For ${conditions} management, maintaining steady hydration, gentle movement routines, and consistent medication timing is key. If you experience sudden headaches, vision changes, or numbness, please alert your emergency contact or doctor immediately.`;
  }

  // 5. Default supportive response
  if (role === 'caregiver') {
    return `I am here to assist your caregiving journey with ${patientName}. You can ask me about medication schedules, task prioritization, or ways to balance your daily care routine. How can I help you right now?`;
  } else {
    return `Hello! As your CareCircle Co-Pilot, I'm here to support your daily wellness, remind you about medications, and celebrate your recovery milestones. How are you feeling right now?`;
  }
};

// @route   GET /api/chat/history
// @desc    Get chat history for the user's circle
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    let messages = await ChatMessage.find({ careCircleId: req.circle._id })
      .sort({ createdAt: 1 })
      .limit(50);

    // If empty history, seed initial greeting
    if (messages.length === 0) {
      const patientName = req.circle.patientId?.fullName || 'the patient';
      const role = req.user.role;
      const initialGreeting =
        role === 'caregiver'
          ? `Welcome to CareCircle! I am your AI Co-Pilot supporting you in caring for ${patientName}. You can ask me about medication schedules, daily tasks, or caregiving guidance.`
          : `Hello ${req.user.fullName}! I am your CareCircle AI Co-Pilot. I'm here to help track your daily routine, medications, and wellness. How are you feeling today?`;

      const welcomeMsg = await ChatMessage.create({
        careCircleId: req.circle._id,
        senderType: 'ai',
        roleContext: role,
        message: initialGreeting,
        senderName: 'CareCircle AI Co-Pilot',
      });
      messages = [welcomeMsg];
    }

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/chat/message
// @desc    Send a message to AI Co-Pilot and receive supportive contextual response
// @access  Private
router.post('/message', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    // 1. Save user's message
    const userMsg = await ChatMessage.create({
      careCircleId: req.circle._id,
      senderId: req.user._id,
      senderName: req.user.fullName,
      senderType: 'user',
      roleContext: req.user.role,
      message: message.trim(),
    });

    // 2. Fetch context (medications, today's plan, patient profile)
    const medications = await Medication.find({ careCircleId: req.circle._id, isActive: true });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const plan = await PlanAndTask.findOne({
      careCircleId: req.circle._id,
      date: { $gte: startOfDay },
    });

    const patientInfo = req.circle.patientId || req.user;

    // Fetch active alerts for circle context
    const activeAlerts = await Alert.find({
      careCircleId: req.circle._id,
      status: { $in: ['new', 'acknowledged'] },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    let aiReplyText = '';

    // 3. Try forwarding to FastAPI AI engine if available
    try {
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${fastApiUrl}/api/copilot/chat`,
        {
          message: message.trim(),
          role: req.user.role,
          userName: req.user.fullName,
          patientName: patientInfo.fullName,
          conditions: patientInfo.conditions || [],
          medications: medications.map((m) => ({ name: m.name, dosage: m.dosage, times: m.times })),
          alerts: activeAlerts.map((a) => ({
            title: a.title,
            message: a.message,
            severity: a.severity,
          })),
        },
        { timeout: 4000 }
      );

      if (response.data && response.data.reply) {
        aiReplyText = response.data.reply;
      }
    } catch {
      // FastAPI not running or timeout -> Fallback to intelligent local clinical reasoning
    }

    if (!aiReplyText) {
      aiReplyText = generateEmpatheticResponse(message, req.user.role, patientInfo, medications, plan);
    }

    // 4. Save AI's response
    const aiMsg = await ChatMessage.create({
      careCircleId: req.circle._id,
      senderType: 'ai',
      roleContext: req.user.role,
      message: aiReplyText,
      senderName: 'CareCircle AI Co-Pilot',
    });

    return res.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
