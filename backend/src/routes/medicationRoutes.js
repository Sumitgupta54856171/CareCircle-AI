const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const { protect } = require('../middleware/auth');

// @route   GET /api/medications
// @desc    Get all active medications for user's care circle
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const medications = await Medication.find({
      careCircleId: req.circle._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.json(medications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/medications/today
// @desc    Get medications with today's adherence log status
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const medications = await Medication.find({
      careCircleId: req.circle._id,
      isActive: true,
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await MedicationLog.find({
      careCircleId: req.circle._id,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    });

    // Combine medication schedule with logs
    const schedule = [];
    let totalDoses = 0;
    let takenDoses = 0;

    medications.forEach((med) => {
      const times = med.times && med.times.length > 0 ? med.times : ['08:00'];

      times.forEach((timeStr) => {
        totalDoses++;
        const log = logs.find(
          (l) =>
            l.medicationId.toString() === med._id.toString() &&
            l.scheduledTimeSlot === timeStr
        );

        const status = log ? log.status : 'pending';
        if (status === 'taken') takenDoses++;

        schedule.push({
          medicationId: med._id,
          name: med.name,
          dosage: med.dosage,
          timeSlot: timeStr,
          instructions: med.instructions,
          status,
          logId: log ? log._id : null,
          confirmedAt: log ? log.confirmedAt : null,
        });
      });
    });

    // Sort schedule by time
    schedule.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    return res.json({
      schedule,
      summary: {
        totalDoses,
        takenDoses,
        adherenceRate,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/medications
// @desc    Add a new medication
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found. Please join or create a circle.' });
    }

    const { name, dosage, frequency, times, instructions } = req.body;
    if (!name || !dosage) {
      return res.status(400).json({ message: 'Medication name and dosage are required.' });
    }

    const timeList = Array.isArray(times) && times.length > 0 ? times : ['08:00'];

    const med = await Medication.create({
      careCircleId: req.circle._id,
      patientId: req.circle.patientId._id || req.circle.patientId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency || 'once_daily',
      times: timeList,
      instructions: instructions || 'Take with food and water',
      createdBy: req.user._id,
    });

    return res.status(201).json(med);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/medications/:id/log
// @desc    Log medication status (Taken / Missed / Skipped)
// @access  Private
router.post('/:id/log', protect, async (req, res) => {
  try {
    if (!req.circle) {
      return res.status(400).json({ message: 'No active Care Circle found.' });
    }

    const { status, timeSlot, notes, confirmationMethod } = req.body;
    const medId = req.params.id;

    const med = await Medication.findById(medId);
    if (!med) {
      return res.status(404).json({ message: 'Medication not found.' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const targetTimeSlot = timeSlot || (med.times && med.times[0]) || '08:00';

    // Find existing log for today and slot, or create new
    let log = await MedicationLog.findOne({
      medicationId: med._id,
      scheduledTimeSlot: targetTimeSlot,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    });

    if (log) {
      log.status = status;
      log.confirmedAt = status === 'taken' ? new Date() : null;
      log.confirmationMethod = confirmationMethod || 'manual';
      log.notes = notes || log.notes;
      log.loggedBy = req.user._id;
      await log.save();
    } else {
      log = await MedicationLog.create({
        medicationId: med._id,
        careCircleId: req.circle._id,
        patientId: req.circle.patientId._id || req.circle.patientId,
        scheduledTime: new Date(),
        scheduledTimeSlot: targetTimeSlot,
        status: status || 'taken',
        confirmedAt: status === 'taken' ? new Date() : null,
        confirmationMethod: confirmationMethod || 'manual',
        notes: notes || '',
        loggedBy: req.user._id,
      });
    }

    return res.json({ message: `Medication marked as ${status}`, log });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/medications/:id
// @desc    Deactivate medication
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    med.isActive = false;
    await med.save();
    return res.json({ message: 'Medication removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
