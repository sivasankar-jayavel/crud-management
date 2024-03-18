const mongoose = require('mongoose');


// Define the schema
const nurseSchema = new mongoose.Schema({

  // Name field
  name: {
    type: String,
    required: true
  },
  // License number field
  licenseNumber: {
    type: String,
    required: true,
    unique: true // assuming license numbers are unique
  },
  // Date of Birth field
  dob: {
    type: String,
    required: true
  },
  // Age field - calculated based on Date of Birth
  age: {
    type: Number,
    required: true
  },
  // created Time
  createdAt: {
    type: Date,
    required:true,
    default: Date.now,
  }
});

module.exports = mongoose.model('Nurse',nurseSchema);