const { getAll } = require('../models/Races');

async function racesGET(req, res) {
  try {
    const races = await getAll();
    res.status(200).json({ races });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  racesGET,
};
