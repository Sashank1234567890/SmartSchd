const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Settings = require('../models/Settings');

// Helper to ensure availability matrix matches D x P
async function getNormalizedAvailability(availability) {
  const settings = await Settings.getSingleton();
  const D = settings.workingDays.length;
  const P = settings.periods.length;

  if (Array.isArray(availability) && availability.length === D) {
    return availability.map(row => {
      if (Array.isArray(row) && row.length === P) {
        return row.map(cell => Boolean(cell));
      }
      return Array(P).fill(true);
    });
  }

  // Default: all available
  return Array.from({ length: D }, () => Array(P).fill(true));
}

// GET /api/rooms
router.get('/', async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms, error: null });
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Room '${req.params.id}' not found.` }
      });
    }
    res.json({ success: true, data: room, error: null });
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms
router.post('/', async (req, res, next) => {
  try {
    const { name, roomNumber, type, capacity, availability } = req.body;
    const normalizedAvailability = await getNormalizedAvailability(availability);

    const room = await Room.create({
      name,
      roomNumber,
      type,
      capacity,
      availability: normalizedAvailability
    });

    res.status(201).json({ success: true, data: room, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_ROOM_NUMBER', message: `Room with number '${req.body.roomNumber}' already exists.` }
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_VALIDATION_ERROR', message: err.message }
      });
    }
    next(err);
  }
});

// PUT /api/rooms/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, roomNumber, type, capacity, availability } = req.body;
    const updateData = { name, roomNumber, type, capacity };

    if (availability) {
      updateData.availability = await getNormalizedAvailability(availability);
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Room '${req.params.id}' not found.` }
      });
    }

    res.json({ success: true, data: room, error: null });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_DUPLICATE_ROOM_NUMBER', message: `Room with number '${req.body.roomNumber}' already exists.` }
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'E_VALIDATION_ERROR', message: err.message }
      });
    }
    next(err);
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'E_NOT_FOUND', message: `Room '${req.params.id}' not found.` }
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: { message: `Room '${room.roomNumber}' deleted successfully.` }, error: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
