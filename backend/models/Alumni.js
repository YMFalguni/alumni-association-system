const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  employmentStatus: {
    type: String,
    required: true,
  },
  currentCompany: {
    type: String,
  },
  designation: {
    type: String,
  },
  city: {
    type: String,
  },
  salary: {
    type: Number,
  },
  role: {
    type: String,
    default: "alumni",
  },
}, { timestamps: true });

const Alumni = mongoose.model("Alumni", AlumniSchema);
module.exports = Alumni;
