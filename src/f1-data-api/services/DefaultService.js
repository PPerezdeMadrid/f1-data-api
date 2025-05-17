/* eslint-disable no-unused-vars */
const Service = require('./Service');
const mongoose = require('mongoose');

// TODO POR DEFECTO, HAY QUE MODIFICARLO

/**
* Delete a driver
*
* idUnderscoredriver Integer 
* returns Message
* */
const driverIdDriverDELETE = ({ id_driver }) => new Promise(
  async (resolve, reject) => {
    try {
      //Supongo que nos referiamos a driverNumber y no a _id
      const result = await mongoose.connection.db.collection('drivers').deleteOne({ driverNumber: parseInt(id_driver) });

      if(result.deletedCount === 0){
        return reject(Service.rejectResponse(
          'Driver not found',
          404
        ));
      }
      return resolve(Service.successResponse({ message: 'Driver deleted successfully' }));  
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Get driver by ID
*
* idUnderscoredriver Integer 
* returns Driver

TIENE QUE DEVOLVER LA RESPUESTA EN XML
* */
const driverIdDriverGET = ({ id_driver }) => new Promise(
  async (resolve, reject) => {
    try {
      //Supongo que nos referiamos a driverNumber y no a _id
      const driver = await mongoose.connection.db.collection('drivers').findOne({ id_driver: parseInt(id_driver) }, { projection: { _id: 0 } });

      if(!driver){
        return reject(Service.rejectResponse(
          'Driver not found',
          404
        ));
      }
      //return resolve(Service.successResponse(driver));
      return resolve(Service.successResponseXML(driver, "driver"));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Add a driver
*
* idUnderscoredriver Integer 
* driver Driver  (optional)
* returns CreatedResponse
* */
const driverIdDriverPOST = ({ idUnderscoredriver, driver }) => new Promise(
  async (resolve, reject) => {
    try {
      // Aquí asumimos que idUnderscoredriver es el número de piloto y debe coincidir con driver.driveNumber
      if (!driver) {
        return reject(Service.rejectResponse('Driver data is required', 400));
      }

      driver.driveNumber = parseInt(idUnderscoredriver);

      const existing = await mongoose.connection.db.collection('drivers').findOne({ driveNumber: driver.driveNumber });
      if (existing) {
        return reject(Service.rejectResponse('Driver with this number already exists', 409));
      }

      const result = await mongoose.connection.db.collection('drivers').insertOne(driver);

      return resolve(Service.successResponse({
        message: 'Driver created successfully',
        insertedId: result.insertedId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  },
);

/**
* Update a driver
*
* idUnderscoredriver Integer 
* driver Driver  (optional)
* returns Message
* */
const driverIdDriverPUT = ({ idUnderscoredriver, driver }) => new Promise(
  async (resolve, reject) => {
    try {
      if (!driver) {
        return reject(Service.rejectResponse('Driver data is required', 400));
      }

      const result = await mongoose.connection.db.collection('drivers')
        .updateOne({ driveNumber: parseInt(idUnderscoredriver) }, { $set: driver });

      if (result.matchedCount === 0) {
        return reject(Service.rejectResponse('Driver not found', 404));
      }

      return resolve(Service.successResponse({ message: 'Driver updated successfully' }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  },
);

/**
* Get all drivers (URIs)
*
* returns _drivers_get_200_response
* */
/** Sin Paginación:  
const driversGET = () => new Promise(
  async (resolve, reject) => {
    try {
      const drivers = await mongoose.connection.db.collection('drivers')
        .find({}, { projection: { _id: 0 } })
        .toArray();

      return resolve(Service.successResponse({ drivers }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  },
);
*/
const driversGET = ({ offset = 0, limit = 10 }) => new Promise(
  async (resolve, reject) => {
    try {
      offset = parseInt(offset);
      limit = parseInt(limit);

      const drivers = await mongoose.connection.db.collection('drivers')
        .find({}, { projection: { _id: 0 } })
        .skip(offset)
        .limit(limit)
        .toArray();

      const total = await mongoose.connection.db.collection('drivers').countDocuments();

      return resolve(Service.successResponse({ 
        offset,
        limit,
        total,
        drivers 
      }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  },
);

/**
* Get all drivers in a race (with optional filters)
*
* idUnderscorerace Integer 
* driverCode String Filter by driver code (optional)
* team String Filter by team name (optional)
* returns _drivers__id_race__get_200_response
* /drivers/{id_race} -> driverNumber, code, team
* */
const driversIdRaceGET = ({ id_race, id_driver, team }) => new Promise(
  async (resolve, reject) => {
    try {
      const raceIdInt = parseInt(id_race);
      if (isNaN(raceIdInt)) {
        return reject(Service.rejectResponse('Invalid race ID', 400));
      }

      // Verificar que la carrera existe (opcional)
      const raceExists = await mongoose.connection.db.collection('races').findOne({ id_race: raceIdInt });
      if (!raceExists) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      // Construir el filtro para laps con id_race y opcionalmente id_driver
      const matchQuery = {
        id_race: raceIdInt,
        ...(id_driver !== undefined && { id_driver: parseInt(id_driver) }),
      };

      // Sacar los id_driver únicos de esos laps
      const driverIds = await mongoose.connection.db.collection('laps').distinct('id_driver', matchQuery);

      if (driverIds.length === 0) {
        // No drivers found
        return resolve(Service.successResponse({ drivers: [] }));
      }

      // Construir filtro para drivers con id_driver y opcionalmente team
      const driversQuery = {
        id_driver: { $in: driverIds },
        ...(team && { team }),
      };

      const drivers = await mongoose.connection.db.collection('drivers')
        .find(driversQuery, { projection: { _id: 0, id_driver: 0 } }) // ocultamos _id y id_driver si quieres
        .toArray();

      return resolve(Service.successResponse({ drivers }));
    } catch (e) {
      return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);


/**
* Delete a race
*
* idUnderscorerace Integer 
* returns Message
* */
const raceIdRaceDELETE = ({ idUnderscorerace }) => new Promise(
  async (resolve, reject) => {
    try {
      const result = await mongoose.connection.db.collection('races')
        .deleteOne({ raceId: parseInt(idUnderscorerace) });

      if (result.deletedCount === 0) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      return resolve(Service.successResponse({
        message: 'Race deleted successfully',
      }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);


/**
* Get a race by ID
*
* idUnderscorerace Integer 
* returns Race
* */
const raceIdRaceGET = ({ id_race }) => new Promise(
  async (resolve, reject) => {
    try {
      const race = await mongoose.connection.db.collection('races')
        .findOne({ id_race: parseInt(id_race) }, { projection: { _id: 0 } });

      if (!race) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      return resolve(Service.successResponse(race));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);

/**
* Get a lap from a race (with optional filter by driver)
*
* idUnderscorerace Integer 
* lapUnderscorenumber Integer 
* driverCode String Filter by driver code (optional)
* returns _race__id_race__lap__lap_number__get_200_response
+ /race/{id_race}/lap/{lap_number}:
* */
const raceIdRaceLapLapNumberGET = ({ idUnderscorerace, lapUnderscorenumber, driverCode }) => new Promise(
  async (resolve, reject) => {
    try {
      const race = await mongoose.connection.db.collection('races').findOne({ raceId: parseInt(idUnderscorerace) });
      if (!race) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      const query = {
        raceName: race.raceName,
        lapNumber: parseInt(lapUnderscorenumber),
        ...(driverCode && { driverCode })
      };

      const laps = await mongoose.connection.db.collection('laps')
        .find(query, { projection: { _id: 0 } })
        .toArray();

      if (laps.length === 0) {
        return reject(Service.rejectResponse('Lap(s) not found', 404));
      }

      return resolve(Service.successResponse({ laps }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);

/**
* Get all laps of a race
*
* idUnderscorerace Integer 
* returns _race__id_race__laps_get_200_response
* */
const raceIdRaceLapsGET = ({ idUnderscorerace }) => new Promise(
  async (resolve, reject) => {
    try {
      const race = await mongoose.connection.db.collection('races').findOne({ raceId: parseInt(idUnderscorerace) });
      if (!race) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      const laps = await mongoose.connection.db.collection('laps')
        .find({ raceName: race.raceName }, { projection: { _id: 0 } })
        .toArray();

      return resolve(Service.successResponse({ laps }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);

/**
* Update a race
*
* idUnderscorerace Integer 
* race Race  (optional)
* returns Message
* */
const raceIdRacePUT = ({ idUnderscorerace, race }) => new Promise(
  async (resolve, reject) => {
    try {
      const result = await mongoose.connection.db.collection('races')
        .updateOne({ raceId: parseInt(idUnderscorerace) }, { $set: race });

      if (result.matchedCount === 0) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      return resolve(Service.successResponse({
        message: 'Race updated successfully',
      }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);

/**
* Create a race
*
* race Race  (optional)
* returns CreatedResponse
* */
const racePOST = ({ race }) => new Promise(
  async (resolve, reject) => {
    try {
      const lastRace = await mongoose.connection.db.collection('races')
        .find().sort({ raceId: -1 }).limit(1).toArray();

      const nextId = lastRace.length > 0 ? lastRace[0].raceId + 1 : 1;
      race.raceId = nextId;

      const result = await mongoose.connection.db.collection('races').insertOne(race);

      return resolve(Service.successResponse({
        message: 'Race created successfully',
        insertedId: result.insertedId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);

/**
* Get all races
*
* returns _races_get_200_response
* */
const racesGET = () => new Promise(
  async (resolve, reject) => {
    try {
      const races = await mongoose.connection.db.collection('races')
        .find({}, { projection: { _id: 0 } })
        .toArray();

      return resolve(Service.successResponse({ races }));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  },
);


module.exports = {
  driverIdDriverDELETE,
  driverIdDriverGET,
  driverIdDriverPOST,
  driverIdDriverPUT,
  driversGET,
  driversIdRaceGET,
  raceIdRaceDELETE,
  raceIdRaceGET,
  raceIdRaceLapLapNumberGET,
  raceIdRaceLapsGET,
  raceIdRacePUT,
  racePOST,
  racesGET,
};
