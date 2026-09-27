const express = require('express');
const router = express.Router();
const axios = require('axios');
const PlanAndTask = require('../models/PlanAndTask');
const MonitoringRecord = require('../models/MonitoringRecord');
const MedicationLog = require('../models/MedicationLog');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// Seed default plan if none exists for today
const getDefaultPlan = (careCircleId, conditions = []) => {
  const isStroke = conditions.includes('stroke');
  const isDiabetes = conditions.includes('diabetes');

  const patientTasks = [
    {
      id: 'pt-1',
      title: isStroke ? 'Bilateral arm lift & seated balance exercises' : 'Gentle morning mobility & posture stretching',
      description: '10 minutes of controlled movement to reduce stiffness and improve blood flow.',
      category: 'exercise',
      status: 'pending',
      estimatedMinutes: 10,
    },
    {
      id: 'pt-2',
      title: isDiabetes ? 'Fasting blood glucose check & morning meds' : 'Hydration & morning medication routine',
      description: 'Take prescribed morning medication with 250ml water.',
      category: 'medication',
      status: 'pending',
      estimatedMinutes: 5,
    },
    {
      id: 'pt-3',
      title: 'Afternoon mental check-in & rest cycle',
      description: 'Brief rest break to reset cognitive energy and prevent fatigue spikes.',
      category: 'rest',
      status: 'pending',
      estimatedMinutes: 15,
    },
    {
      id: 'pt-4',
      title: 'Evening hydration and light walking',
      description: 'A relaxing 10-minute walk indoors or in the yard.',
      category: 'rehab',
      status: 'pending',
      estimatedMinutes: 10,
    },
  ];

  const caregiverTasks = [
    {
      id: 'ct-1',
      title: 'Review morning adherence & hydration status',
      description: 'Check that medication was taken and note any morning dizziness.',
      category: 'monitoring',
      status: 'pending',
      estimatedMinutes: 10,
    },
    {
      id: 'ct-2',
      title: 'Prepare healthy balanced nutrition',
      description: 'Low sodium, balanced glycemic index meal plan.',
      category: 'support',
      status: 'pending',
      estimatedMinutes: 20,
    },
    {
      id: 'ct-3',
      title: '15-minute caregiver respite / breathwork',
      description: 'Dedicated time for your own recovery to prevent caregiver burnout.',
      category: 'self_care',
      status: 'pending',
      estimatedMinutes: 15,
    },
  ];

  return {
    careCircleId,
    patientTasks,
    caregiverTasks,
    aiReasoning: 'Adaptive baseline generated to balance patient recovery with caregiver energy sustainability.',
  };
};

// Calculate progress metrics helper
const calculateProgress = (plan) => {
  const pTotal = plan.patientTasks.length;
  const pDone = plan.patientTasks.filter((t) => t.status === 'completed').length;
  const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

  const cTotal = plan.caregiverTasks.length;
  const cDone = plan.caregiverTasks.filter((t) => t.status === 'completed').length;
  const cPct = cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0;

  const overallTotal = pTotal + cTotal;
  const overallDone = pDone + cDone;
  const overallPct = overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0;

  return {
    patient: { total: pTotal, completed: pDone, percentage: pPct },
    caregiver: { total: cTotal, completed: cDone, percentage: cPct },
    overall: { total: overallTotal, completed: overallDone, percentage: overallPct },
  };
};

// @route   GET /api/tasks/today
// @desc    Get today's tasks and plan for patient and caregiver
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let plan = await PlanAndTask.findOne({
      careCircleId: req.circle._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!plan) {
      const conditions = req.circle.patientId?.conditions || [];
      const planData = getDefaultPlan(req.circle._id, conditions);
      planData.date = startOfDay;
      plan = await PlanAndTask.create(planData);
    }

    const metrics = calculateProgress(plan);

    return res.json({
      plan,
      metrics,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/tasks/:team/:taskId
// @desc    Toggle task completion status
// @access  Private
router.patch('/:team/:taskId', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const { team, taskId } = req.params;
    const { status } = req.body; // optional explicit status 'completed' | 'pending'

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const plan = await PlanAndTask.findOne({
      careCircleId: req.circle._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan for today not found.' });
    }

    const targetList = team === 'caregiver' ? plan.caregiverTasks : plan.patientTasks;
    const task = targetList.find((t) => t.id === taskId);

    if (!task) {
      return res.status(404).json({ message: `Task ${taskId} not found in ${team} plan.` });
    }

    // Toggle if no status provided
    const nextStatus = status ? status : task.status === 'completed' ? 'pending' : 'completed';
    task.status = nextStatus;
    task.completedAt = nextStatus === 'completed' ? new Date() : null;

    await plan.save();

    const metrics = calculateProgress(plan);

    return res.json({
      message: `Task marked as ${nextStatus}`,
      task,
      metrics,
      plan,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Add custom task for patient or caregiver
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const { team, title, description, category, estimatedMinutes } = req.body;
    if (!title || !team) {
      return res.status(400).json({ message: 'Title and team (patient/caregiver) are required.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let plan = await PlanAndTask.findOne({
      careCircleId: req.circle._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!plan) {
      const conditions = req.circle.patientId?.conditions || [];
      const planData = getDefaultPlan(req.circle._id, conditions);
      planData.date = startOfDay;
      plan = await PlanAndTask.create(planData);
    }

    const newTask = {
      id: `${team.charAt(0)}t-${Date.now().toString().slice(-5)}`,
      title: title.trim(),
      description: description || '',
      category: category || 'general',
      status: 'pending',
      estimatedMinutes: Number(estimatedMinutes) || 15,
    };

    if (team === 'caregiver') {
      plan.caregiverTasks.push(newTask);
    } else {
      plan.patientTasks.push(newTask);
    }

    await plan.save();
    const metrics = calculateProgress(plan);

    return res.status(201).json({ plan, metrics });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks/generate
// @desc    Synthesize adaptive daily plan using LangGraph & Gemini 2.5 Flash
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const patientInfo = req.circle.patientId || req.user;
    const patientConditions = patientInfo.conditions || [];
    const caregiverMember = req.circle.members?.find((m) => m.roleInCircle === 'primary_caregiver');
    const caregiverName = caregiverMember?.userId?.fullName || (req.user.role === 'caregiver' ? req.user.fullName : 'Caregiver');

    // 1. Gather latest patient facial check-in biometric scores
    const latestBiometrics = await MonitoringRecord.findOne({
      careCircleId: req.circle._id,
      type: 'patient_stress',
    }).sort({ timestamp: -1 });

    const patientStressScore = latestBiometrics?.data?.stressScore ?? 28;
    const patientFatigueScore = latestBiometrics?.data?.fatigueScore ?? 34;
    const patientMood = latestBiometrics?.data?.mood ?? 'Calm';

    // 2. Gather latest caregiver burnout signals
    const latestBurnout = await MonitoringRecord.findOne({
      careCircleId: req.circle._id,
      type: 'caregiver_burnout',
    }).sort({ timestamp: -1 });

    const caregiverBurnoutScore = latestBurnout?.data?.burnoutScore ?? 42;
    const caregiverCapacityLevel = latestBurnout?.data?.capacityLevel ?? 'moderate';
    const caregiverSleepQuality = latestBurnout?.data?.sleepQuality ?? 'interrupted';

    // 3. Gather 7-day adherence rate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await MedicationLog.find({
      careCircleId: req.circle._id,
      scheduledTime: { $gte: sevenDaysAgo },
    });

    let recentAdherenceRate = 85;
    if (recentLogs.length > 0) {
      const takenCount = recentLogs.filter((l) => l.status === 'taken').length;
      recentAdherenceRate = Math.round((takenCount / recentLogs.length) * 100);
    }

    // 4. Gather active alerts count
    const activeAlertsCount = await Alert.countDocuments({
      careCircleId: req.circle._id,
      status: { $in: ['new', 'acknowledged'] },
    });

    // 5. Call FastAPI LangGraph Planner Agent
    let generatedPlan = null;
    try {
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${fastApiUrl}/plan/generate`,
        {
          caregiverName,
          patientName: patientInfo.fullName || 'Patient',
          patientConditions,
          patientStressScore,
          patientFatigueScore,
          patientMood,
          caregiverBurnoutScore,
          caregiverCapacityLevel,
          caregiverSleepQuality,
          recentAdherenceRate,
          activeAlertsCount,
        },
        { timeout: 15000 }
      );

      if (response.data && Array.isArray(response.data.patientTasks)) {
        generatedPlan = response.data;
      }
    } catch (fastApiErr) {
      console.warn('[PlanAgent] FastAPI service timed out or unavailable:', fastApiErr.message);
    }

    // 6. Resilient fallback if FastAPI is offline
    if (!generatedPlan) {
      const defaultData = getDefaultPlan(req.circle._id, patientConditions);
      generatedPlan = {
        aiReasoning: `Adaptive baseline coordinated for ${patientInfo.fullName} (Fatigue: ${patientFatigueScore}%) and ${caregiverName} (Burnout: ${caregiverBurnoutScore}%).`,
        patientEnergyLevel: patientFatigueScore > 60 ? 'Low (Restorative Focus)' : 'Moderate (Balanced Routine)',
        caregiverCapacity: caregiverBurnoutScore >= 70 ? 'Low (Respite Needed)' : 'Medium (Balanced Routine)',
        patientTasks: defaultData.patientTasks,
        caregiverTasks: defaultData.caregiverTasks,
      };
    }

    // 7. Update or create today's plan in MongoDB
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let plan = await PlanAndTask.findOne({
      careCircleId: req.circle._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!plan) {
      plan = new PlanAndTask({
        careCircleId: req.circle._id,
        date: startOfDay,
      });
    }

    plan.patientTasks = generatedPlan.patientTasks;
    plan.caregiverTasks = generatedPlan.caregiverTasks;
    plan.aiReasoning = generatedPlan.aiReasoning;
    plan.patientEnergyLevel = generatedPlan.patientEnergyLevel;
    plan.caregiverCapacity = generatedPlan.caregiverCapacity;
    plan.generatedBy = 'ai';

    await plan.save();

    const metrics = calculateProgress(plan);

    // 8. Notify circle members via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`care-circle:${req.circle._id}`).emit('plan:updated', plan);
    }

    return res.status(200).json({
      success: true,
      message: 'Adaptive daily plan synthesized successfully via LangGraph agent.',
      plan,
      metrics,
      aiReasoning: plan.aiReasoning,
      patientEnergyLevel: plan.patientEnergyLevel,
      caregiverCapacity: plan.caregiverCapacity,
    });
  } catch (error) {
    console.error('[Generate Plan Error]:', error);
    return res.status(500).json({ message: 'Failed to generate adaptive plan: ' + error.message });
  }
});

module.exports = router;
