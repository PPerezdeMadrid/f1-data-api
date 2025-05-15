const mongoose = require('mongoose');

const RaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

const RaceModel = mongoose.model('Race', RaceSchema);

// Simulated response
async function getAll() {
  const racesData = [
    { name: 'Monaco GP', date: new Date(), location: 'Monaco' },
    { name: 'Silverstone Sprint', date: new Date(), location: 'UK' },
  ];
  return racesData;
}

module.exports = {
  RaceModel,
  getAll,
};


