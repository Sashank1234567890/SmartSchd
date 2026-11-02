const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: [
      'Classroom',
      'Laboratory',
      'ComputerLab',
      'ElectronicsLab',
      'ElectricalLab',
      'MechanicalWorkshop',
      'CivilLab',
      'PhysicsLab',
      'ChemistryLab',
      'SportsGround'
    ]
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  // D x P boolean matrix (default initialized in service/controller if not provided)
  availability: {
    type: [[Boolean]],
    default: []
  }
}, {
  timestamps: true
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
