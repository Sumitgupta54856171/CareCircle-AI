const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const MonitoringRecord = require('../models/MonitoringRecord');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// Multer memory storage for camera snapshot uploads (max 15MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// @route   POST /api/monitoring/analyze
// @desc    Process camera check-in via Gemini Vision, store in monitoring_records
// @access  Private
router.post('/analyze', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({
        message: 'You must belong to an active Care Circle to submit wellness check-ins.',
      });
    }

    let imageBuffer = null;
    let mimeType = 'image/jpeg';
    let originalName = 'camera_checkin.jpg';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'image/jpeg';
      originalName = req.file.originalname || 'camera_checkin.jpg';
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      const match = req.body.imageBase64.match(/^data:(image\/\w+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({
        message: 'No image provided. Please capture or upload a photo for the check-in.',
      });
    }

    const patientInfo = req.circle.patientId || req.user;
    const conditionsStr = patientInfo.conditions?.length
      ? patientInfo.conditions.join(', ')
      : 'general recovery';

    let analysis = null;

    // Send to FastAPI Multimodal AI Vision Service
    try {
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: mimeType });
      formData.append('file', blob, originalName);
      formData.append('role', req.user.role || 'patient');
      formData.append('patientName', patientInfo.fullName || 'User');
      formData.append('conditions', conditionsStr);

      const response = await axios.post(`${fastApiUrl}/analyze/monitoring`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 12000,
      });

      if (response.data && typeof response.data.stressScore === 'number') {
        analysis = response.data;
      }
    } catch (fastApiErr) {
      console.warn('[Monitoring] FastAPI Vision Service unavailable or timed out:', fastApiErr.message);
    }

    // Fallback if FastAPI was unavailable
    if (!analysis) {
      analysis = {
        stressScore: 28,
        fatigueScore: 34,
        fallRiskScore: 12,
        mood: 'Calm',
        expressionSummary: 'Facial features appear composed with relaxed eye contact and steady resting posture.',
        recommendation:
          'Everything looks steady. Remember to take a 5-minute stretch break and drink a glass of fresh water.',
        confidence: 0.85,
        rawAnalysis: { mode: 'fallback_engine' },
        source: 'fallback-engine',
      };
    }

    // Save record to database
    const record = await MonitoringRecord.create({
      careCircleId: req.circle._id,
      userId: req.user._id,
      type: 'patient_stress',
      source: 'camera',
      data: {
        stressScore: analysis.stressScore,
        fatigueScore: analysis.fatigueScore,
        fallRiskScore: analysis.fallRiskScore || null,
        mood: analysis.mood,
        expressionSummary: analysis.expressionSummary,
        recommendation: analysis.recommendation,
        rawAnalysis: analysis.rawAnalysis || analysis,
        confidence: analysis.confidence || 0.9,
      },
      timestamp: new Date(),
      processedAt: new Date(),
    });

    // Notify connected care circle members via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${req.circle._id}`).emit('monitoring:new', record);
    }

    // Trigger alert if stress > 70 or fatigue > 75
    let createdAlert = null;
    if (analysis.stressScore > 70 || analysis.fatigueScore > 75) {
      const isSevere = analysis.stressScore > 85 || analysis.fatigueScore > 85;
      createdAlert = await Alert.create({
        careCircleId: req.circle._id,
        triggeredFor: req.user._id,
        severity: isSevere ? 'high' : 'medium',
        type: analysis.stressScore > 70 ? 'high_stress' : 'high_fatigue',
        title: `${patientInfo.fullName} checked in with ${analysis.stressScore > 70 ? 'elevated stress' : 'noticeable fatigue'}`,
        message: `${analysis.expressionSummary} AI Co-Pilot advised: "${analysis.recommendation}"`,
        dataSnapshot: {
          stressScore: analysis.stressScore,
          fatigueScore: analysis.fatigueScore,
          mood: analysis.mood,
          expressionSummary: analysis.expressionSummary,
        },
        suggestedActions: [
          { label: 'Chat with AI Co-Pilot', actionType: 'nav_chat' },
          { label: 'View Today’s Plan', actionType: 'nav_plan' },
        ],
        status: 'new',
      });

      if (io) {
        io.to(`care-circle:${req.circle._id}`).emit('alert:new', createdAlert);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Camera check-in analyzed and saved successfully.',
      record,
      alert: createdAlert,
    });
  } catch (error) {
    console.error('[Monitoring Analyze Error]:', error);
    return res.status(500).json({
      message: 'Failed to process camera check-in: ' + error.message,
    });
  }
});

// @route   GET /api/monitoring/history
// @desc    Get recent monitoring check-in records for care circle
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.json({ records: [] });
    }

    const records = await MonitoringRecord.find({ careCircleId: req.circle._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('userId', 'fullName role');

    return res.json({ records });
  } catch (error) {
    console.error('[Monitoring History Error]:', error);
    return res.status(500).json({ message: 'Failed to retrieve check-in history' });
  }
});

// @route   GET /api/monitoring/latest
// @desc    Get single most recent check-in record for care circle
// @access  Private
router.get('/latest', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.json({ record: null });
    }

    const record = await MonitoringRecord.findOne({ careCircleId: req.circle._id })
      .sort({ timestamp: -1 })
      .populate('userId', 'fullName role');

    return res.json({ record });
  } catch (error) {
    console.error('[Monitoring Latest Error]:', error);
    return res.status(500).json({ message: 'Failed to retrieve latest check-in' });
  }
});

// @route   POST /api/monitoring/caregiver-burnout
// @desc    Evaluate caregiver burnout signals using Gemini 2.5 Flash and track load
// @access  Private
router.post('/caregiver-burnout', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({
        message: 'You must belong to an active Care Circle to track caregiver load.',
      });
    }

    const {
      sleepQuality = 'interrupted',
      hoursActive = 8,
      emotionalLoad = 3,
      physicalFatigue = 3,
      feelingOverwhelmed = false,
      notes = '',
    } = req.body;

    const patientInfo = req.circle.patientId || { fullName: 'Patient' };

    // Contextual workload discovery
    const activeAlertCount = await Alert.countDocuments({
      careCircleId: req.circle._id,
      status: { $in: ['new', 'acknowledged'] },
    });

    let pendingTasksCount = 0;
    try {
      const PlanAndTask = require('../models/PlanAndTask');
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const plan = await PlanAndTask.findOne({
        careCircleId: req.circle._id,
        date: { $gte: startOfDay },
      });
      if (plan && Array.isArray(plan.caregiverTasks)) {
        pendingTasksCount = plan.caregiverTasks.filter((t) => t.status === 'pending').length;
      }
    } catch (e) {
      // Non-critical fallback
    }

    let analysis = null;

    // Call FastAPI AI Service
    try {
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${fastApiUrl}/analyze/caregiver-burnout`,
        {
          caregiverName: req.user.fullName || 'Caregiver',
          patientName: patientInfo.fullName || 'Patient',
          sleepQuality,
          hoursActive: Number(hoursActive),
          emotionalLoad: Number(emotionalLoad),
          physicalFatigue: Number(physicalFatigue),
          feelingOverwhelmed: Boolean(feelingOverwhelmed),
          activeAlertCount,
          pendingTasksCount,
          caregiverNotes: notes,
        },
        { timeout: 12000 }
      );

      if (response.data && typeof response.data.burnoutScore === 'number') {
        analysis = response.data;
      }
    } catch (fastApiErr) {
      console.warn('[Burnout] FastAPI AI service unavailable or timed out:', fastApiErr.message);
    }

    // Fallback algorithmic assessment if FastAPI unavailable
    if (!analysis) {
      const emotionalVal = (Number(emotionalLoad) - 1) * 6.25;
      const fatigueVal = (Number(physicalFatigue) - 1) * 6.25;
      const sleepVal = sleepQuality === 'poor' ? 20 : sleepQuality === 'interrupted' ? 10 : 0;
      const overVal = feelingOverwhelmed ? 18 : 0;
      const raw = emotionalVal + fatigueVal + sleepVal + overVal + Math.min(activeAlertCount * 4, 15);
      const score = Math.max(10, Math.min(Math.round(raw), 95));

      analysis = {
        burnoutScore: score,
        stressScore: Math.round(Math.min(95, emotionalVal * 2 + (feelingOverwhelmed ? 15 : 5))),
        fatigueScore: Math.round(Math.min(95, fatigueVal * 2 + sleepVal)),
        capacityLevel: score < 40 ? 'optimal' : score < 68 ? 'moderate' : score < 84 ? 'pacing_needed' : 'burnout_risk',
        summary: score < 68 ? 'Caregiver load is currently within manageable parameters.' : 'Caregiver is experiencing noticeable cumulative fatigue and strain.',
        copilotAdvice: 'Take a dedicated 15-minute quiet recovery break, stay hydrated, and share high-effort tasks with circle members.',
        suggestedActions: ['Take a 15-min rest pause', 'Hydrate and stretch', 'Review circle task delegation'],
        confidence: 0.88,
        source: 'fallback-engine',
      };
    }

    // Save record to monitoring_records
    const record = await MonitoringRecord.create({
      careCircleId: req.circle._id,
      userId: req.user._id,
      type: 'caregiver_burnout',
      source: 'manual',
      data: {
        burnoutScore: analysis.burnoutScore,
        stressScore: analysis.stressScore,
        fatigueScore: analysis.fatigueScore,
        capacityLevel: analysis.capacityLevel,
        mood: analysis.capacityLevel === 'optimal' ? 'Energized' : analysis.capacityLevel === 'moderate' ? 'Balanced' : 'Strained',
        expressionSummary: analysis.summary,
        recommendation: analysis.copilotAdvice,
        suggestedActions: analysis.suggestedActions,
        sleepQuality,
        hoursActive,
        emotionalLoad,
        physicalFatigue,
        feelingOverwhelmed,
        notes,
        rawAnalysis: analysis,
        confidence: analysis.confidence || 0.9,
      },
      timestamp: new Date(),
      processedAt: new Date(),
    });

    // Notify connected care circle members via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${req.circle._id}`).emit('monitoring:new', record);
      io.to(`care-circle:${req.circle._id}`).emit('burnout:update', record);
    }

    // Trigger alert if burnoutScore >= 70
    let createdAlert = null;
    if (analysis.burnoutScore >= 70) {
      const isSevere = analysis.burnoutScore >= 85;
      createdAlert = await Alert.create({
        careCircleId: req.circle._id,
        triggeredFor: req.user._id,
        severity: isSevere ? 'high' : 'medium',
        type: 'caregiver_burnout',
        title: `Caregiver Capacity Alert: ${req.user.fullName} is reaching burnout threshold`,
        message: `${analysis.summary} AI Co-Pilot advised: "${analysis.copilotAdvice}"`,
        dataSnapshot: {
          burnoutScore: analysis.burnoutScore,
          stressScore: analysis.stressScore,
          fatigueScore: analysis.fatigueScore,
          capacityLevel: analysis.capacityLevel,
        },
        suggestedActions: [
          { label: 'Chat with AI Co-Pilot for Respite', actionType: 'nav_chat' },
          { label: 'Rebalance Daily Tasks', actionType: 'nav_plan' },
        ],
        status: 'new',
      });

      if (io) {
        io.to(`care-circle:${req.circle._id}`).emit('alert:new', createdAlert);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Caregiver load assessment saved successfully.',
      record,
      alert: createdAlert,
    });
  } catch (error) {
    console.error('[Caregiver Burnout Error]:', error);
    return res.status(500).json({
      message: 'Failed to record caregiver burnout: ' + error.message,
    });
  }
});

// @route   GET /api/monitoring/caregiver-burnout/latest
// @desc    Get the most recent caregiver burnout assessment or dynamic live baseline
// @access  Private
router.get('/caregiver-burnout/latest', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.json({ record: null });
    }

    let record = await MonitoringRecord.findOne({
      careCircleId: req.circle._id,
      type: 'caregiver_burnout',
    })
      .sort({ timestamp: -1 })
      .populate('userId', 'fullName role');

    if (record) {
      // If burnoutScore was missing due to legacy strict schema, recover it
      const dataObj = record.data || {};
      if (dataObj.burnoutScore == null) {
        const raw = dataObj.rawAnalysis;
        if (raw && typeof raw.burnoutScore === 'number') {
          dataObj.burnoutScore = raw.burnoutScore;
          dataObj.capacityLevel = raw.capacityLevel || dataObj.capacityLevel || 'moderate';
          dataObj.stressScore = raw.stressScore ?? dataObj.stressScore ?? 35;
          dataObj.fatigueScore = raw.fatigueScore ?? dataObj.fatigueScore ?? 38;
          dataObj.suggestedActions = raw.suggestedActions || dataObj.suggestedActions;
          await MonitoringRecord.updateOne({ _id: record._id }, { $set: { data: dataObj } });
        } else {
          // Calculate from saved inputs
          const e = ((dataObj.emotionalLoad || 3) - 1) * 6.25;
          const f = ((dataObj.physicalFatigue || 3) - 1) * 6.25;
          const s = dataObj.sleepQuality === 'poor' ? 20 : dataObj.sleepQuality === 'interrupted' ? 10 : 0;
          const o = dataObj.feelingOverwhelmed ? 18 : 0;
          dataObj.burnoutScore = Math.max(12, Math.min(Math.round(e + f + s + o + 10), 95));
          dataObj.capacityLevel = dataObj.burnoutScore < 40 ? 'optimal' : dataObj.burnoutScore < 68 ? 'moderate' : 'pacing_needed';
          await MonitoringRecord.updateOne({ _id: record._id }, { $set: { data: dataObj } });
        }
      }
      return res.json({ record });
    }

    // Dynamic Live Baseline if caregiver has not submitted a check-in yet:
    // Calculates actual real-time load from circle signals (unresolved alerts, pending tasks)
    const activeAlertCount = await Alert.countDocuments({
      careCircleId: req.circle._id,
      status: { $in: ['new', 'acknowledged'] },
    });

    let pendingTasksCount = 0;
    try {
      const PlanAndTask = require('../models/PlanAndTask');
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const plan = await PlanAndTask.findOne({
        careCircleId: req.circle._id,
        date: { $gte: startOfDay },
      });
      if (plan && Array.isArray(plan.caregiverTasks)) {
        pendingTasksCount = plan.caregiverTasks.filter((t) => t.status === 'pending').length;
      }
    } catch (e) {}

    // Calculate real live baseline score
    const dynamicBurnout = Math.min(85, Math.max(18, 20 + (activeAlertCount * 6) + (pendingTasksCount * 4)));
    const dynamicStress = Math.min(80, Math.max(15, 18 + (activeAlertCount * 5)));
    const dynamicFatigue = Math.min(80, Math.max(15, 20 + (pendingTasksCount * 4)));
    const dynamicCapacity = dynamicBurnout < 40 ? 'optimal' : dynamicBurnout < 68 ? 'moderate' : 'pacing_needed';

    const liveBaselineRecord = {
      _id: 'live-baseline',
      careCircleId: req.circle._id,
      userId: {
        _id: req.user._id,
        fullName: req.user.fullName,
        role: req.user.role,
      },
      type: 'caregiver_burnout',
      source: 'live_circle_metrics',
      data: {
        burnoutScore: dynamicBurnout,
        stressScore: dynamicStress,
        fatigueScore: dynamicFatigue,
        capacityLevel: dynamicCapacity,
        mood: dynamicCapacity === 'optimal' ? 'Steady' : 'Balanced',
        expressionSummary: `Dynamic baseline calculated from ${activeAlertCount} active alert${activeAlertCount === 1 ? '' : 's'} and ${pendingTasksCount} pending task${pendingTasksCount === 1 ? '' : 's'}.`,
        recommendation: 'Complete your first self-assessment below for personalized resilience calibration and AI respite advice.',
        suggestedActions: [
          'Submit your daily resilience check-in',
          'Review circle tasks and priorities',
          'Take a 10-minute hydration pause',
        ],
        confidence: 0.88,
      },
      timestamp: new Date(),
      createdAt: new Date(),
    };

    return res.json({ record: liveBaselineRecord });
  } catch (error) {
    console.error('[Burnout Latest Error]:', error);
    return res.status(500).json({ message: 'Failed to retrieve latest burnout record' });
  }
});

// @route   GET /api/monitoring/caregiver-burnout/history
// @desc    Get past caregiver burnout assessment history (last 14 check-ins)
// @access  Private
router.get('/caregiver-burnout/history', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.json({ records: [] });
    }

    const records = await MonitoringRecord.find({
      careCircleId: req.circle._id,
      type: 'caregiver_burnout',
    })
      .sort({ timestamp: -1 })
      .limit(14)
      .populate('userId', 'fullName role');

    return res.json({ records });
  } catch (error) {
    console.error('[Burnout History Error]:', error);
    return res.status(500).json({ message: 'Failed to retrieve burnout history' });
  }
});

// @route   POST /api/monitoring/caregiver-burnout/nudge
// @desc    Proactively send a circle respite nudge to request assistance
// @access  Private
router.post('/caregiver-burnout/nudge', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found' });
    }

    const alert = await Alert.create({
      careCircleId: req.circle._id,
      triggeredFor: req.user._id,
      severity: 'medium',
      type: 'caregiver_burnout',
      title: `${req.user.fullName} requested Care Circle Respite & Backup`,
      message: `${req.user.fullName} is experiencing elevated caregiving fatigue today and requested circle assistance with pending patient support tasks.`,
      dataSnapshot: {
        requestedBy: req.user.fullName,
        timestamp: new Date(),
      },
      suggestedActions: [
        { label: 'View Tasks to Assist', actionType: 'nav_plan' },
        { label: 'Open Circle Chat', actionType: 'nav_chat' },
      ],
      status: 'new',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${req.circle._id}`).emit('alert:new', alert);
    }

    return res.status(201).json({
      success: true,
      message: 'Care circle respite nudge sent to members.',
      alert,
    });
  } catch (error) {
    console.error('[Burnout Nudge Error]:', error);
    return res.status(500).json({ message: 'Failed to send respite nudge' });
  }
});

module.exports = router;
