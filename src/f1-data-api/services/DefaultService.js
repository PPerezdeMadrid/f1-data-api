/* eslint-disable no-unused-vars */
const Service = require('./Service');
const mongoose = require('mongoose');
const axios = require('axios');
const xml2js = require('xml2js');

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
const driverIdDriverPOST = (params) => new Promise(async (resolve, reject) => {
  try {
    const { id_driver, ...driverData } = params;

    if (!driverData || Object.keys(driverData).length === 0) {
      return reject(Service.rejectResponse('Driver data is required', 400));
    }

    const driverNumberInt = parseInt(id_driver);

    driverData.driverNumber = driverNumberInt;

    const existing = await mongoose.connection.db.collection('drivers')
      .findOne({ driverNumber: driverNumberInt });

    if (existing) {
      return reject(Service.rejectResponse('Driver with this number already exists', 409));
    }

    const result = await mongoose.connection.db.collection('drivers').insertOne(driverData);

    return resolve(Service.successResponse({
      message: 'Driver created successfully',
      insertedId: result.insertedId,
    }));
  } catch (e) {
    return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
  }
});



/**
* Update a driver
*
* idUnderscoredriver Integer 
* driver Driver  (optional)
* returns Message
* */
const driverIdDriverPUT = (params) => new Promise(async (resolve, reject) => {
  try {
    const { id_driver, ...driverData } = params;

    if (!driverData || Object.keys(driverData).length === 0) {
      return reject(Service.rejectResponse('Driver data is required', 400));
    }

    const result = await mongoose.connection.db.collection('drivers')
      .updateOne(
        { driverNumber: parseInt(id_driver) },
        { $set: driverData }
      );

    if (result.matchedCount === 0) {
      return reject(Service.rejectResponse('Driver not found', 404));
    }

    return resolve(Service.successResponse({ message: 'Driver updated successfully' }));
  } catch (e) {
    return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
  }
});


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
const driversIdRaceGET = ({ id_race, driverCode, team }) => new Promise(async (resolve, reject) => {
  try {
    const raceIdInt = parseInt(id_race);
    if (isNaN(raceIdInt)) {
      return reject(Service.rejectResponse('Invalid race ID', 400));
    }

    const raceExists = await mongoose.connection.db.collection('races').findOne({ id_race: raceIdInt });
    if (!raceExists) {
      return reject(Service.rejectResponse('Race not found', 404));
    }

    const matchQuery = { id_race: raceIdInt };
    const driverIds = await mongoose.connection.db.collection('laps').distinct('id_driver', matchQuery);

    if (driverIds.length === 0) {
      return resolve(Service.successResponse({ drivers: [] }));
    }

    const driversQuery = {
      id_driver: { $in: driverIds },
      ...(team && { team }),
      ...(driverCode && { code: driverCode })  // Aquí se añade el filtro por code
    };

    const drivers = await mongoose.connection.db.collection('drivers')
      .find(driversQuery, { projection: { _id: 0, id_driver: 0 } })
      .toArray();

    return resolve(Service.successResponse({ drivers }));
  } catch (e) {
    return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
  }
});

/*
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
);*/


/**
* Delete a race
*
* idUnderscorerace Integer 
* returns Message
* */

const raceIdRaceDELETE = ({ id_race }) => new Promise(
  async (resolve, reject) => {
    try {
      // Aseguramos que id_race sea un entero
      const raceIdInt = parseInt(id_race);
      if (isNaN(raceIdInt)) {
        throw new Error('Invalid race id');
      }

      const result = await mongoose.connection.db.collection('races')
        .deleteOne({ race_id: raceIdInt }); // aquí usas race_id, no id_race

      if (result.deletedCount === 0) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      return resolve(Service.successResponse({
        message: 'Race deleted successfully',
      }));

    } catch (e) {
      return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
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
const raceIdRaceLapLapNumberGET = ({ id_race, lap_number, driverCode }) => new Promise(
  async (resolve, reject) => {
    try {
      const raceIdInt = parseInt(id_race);
      if (isNaN(raceIdInt)) {
        return reject(Service.rejectResponse('Invalid race ID', 400));
      }

      const race = await mongoose.connection.db.collection('races').findOne({ id_race: raceIdInt });
      if (!race) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      const query = {
        id_race: raceIdInt,
        lapNumber: parseInt(lap_number),
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
      return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
    }
  }
);


/**
* Get all laps of a race
*
* idUnderscorerace Integer 
* returns _race__id_race__laps_get_200_response
* */
const raceIdRaceLapsGET = ({ id_race }) => new Promise(
  async (resolve, reject) => {
    try {
      const raceIdInt = parseInt(id_race);
      if (isNaN(raceIdInt)) {
        return reject(Service.rejectResponse('Invalid race ID', 400));
      }

      const race = await mongoose.connection.db.collection('races').findOne({ id_race: raceIdInt });
      if (!race) {
        return reject(Service.rejectResponse('Race not found', 404));
      }

      const laps = await mongoose.connection.db.collection('laps')
        .find({ id_race: raceIdInt }, { projection: { _id: 0 } })
        .toArray();

      return resolve(Service.successResponse({ laps }));
    } catch (e) {
      return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
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
const raceIdRacePUT = (params) => new Promise(async (resolve, reject) => {
  try {
    const { id_race, ...raceUpdateData } = params;

    if (!raceUpdateData || Object.keys(raceUpdateData).length === 0) {
      return reject(Service.rejectResponse('Race data is required', 400));
    }

    const raceIdNum = parseInt(id_race);
    if (isNaN(raceIdNum)) {
      return reject(Service.rejectResponse('Invalid race ID', 400));
    }

    // Filtrar valores null o undefined para evitar errores en $set
    const updateData = Object.fromEntries(
      Object.entries(raceUpdateData).filter(([_, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return reject(Service.rejectResponse('No valid fields to update', 400));
    }

    const result = await mongoose.connection.db.collection('races')
      .updateOne({ id_race: raceIdNum }, { $set: updateData });

    if (result.matchedCount === 0) {
      return reject(Service.rejectResponse('Race not found', 404));
    }

    return resolve(Service.successResponse({ message: 'Race updated successfully' }));
  } catch (e) {
    return reject(Service.rejectResponse(e.message || 'Invalid input', e.status || 405));
  }
});



/**
* Create a race
*
* race Race  (optional)
* returns CreatedResponse
* */
const racePOST = (race) => new Promise(
  async (resolve, reject) => {
    try {
      if (!race) throw new Error('race object is required!');

      // Ignora cualquier race_id que llegue por el body
      const { raceName, season, raceType } = race;

      
      const lastRace = await mongoose.connection.db.collection('races')
        .find().sort({ race_id: -1 }).limit(1).toArray();

      const nextId = lastRace.length > 0 ? lastRace[0].race_id + 1 : 1;
      const raceData = {
        race_id: nextId,
        raceName,
        season,
        raceType,
      };

      const result = await mongoose.connection.db.collection('races').insertOne(raceData);
      
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

const importExternalRaces = ({ season }) => new Promise(
  async (resolve, reject) => {
    console.log(`[importExternalRaces] Called with season:`, season);

    try {
      const seasonInt = parseInt(season);
      console.log(`[importExternalRaces] Parsed seasonInt:`, seasonInt);

      if (isNaN(seasonInt) || seasonInt < 2018 || seasonInt > 2024) {
        console.warn(`[importExternalRaces] Invalid season:`, seasonInt);
        return reject(Service.rejectResponse('Season must be an integer between 2018 and 2024', 400));
      }

      console.log(`[importExternalRaces] Making request to Hyprace API...`);

      const response = await axios.get('https://hyprace-api.p.rapidapi.com/v1/grands-prix', {
        params: { seasonYear: seasonInt },
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': 'hyprace-api.p.rapidapi.com'
        }
      });

      console.log(`[importExternalRaces] Response status:`, response.status);
      console.log(`[importExternalRaces] Response items:`, Array.isArray(response.data.items) ? response.data.items.length : 'Invalid format');

      const items = response.data.items;
      if (!Array.isArray(items)) {
        return reject(Service.rejectResponse('Unexpected format from external API', 502));
      }

      let count = 0;
      for (const item of items) {
        const simplifiedRace = {
          season: item.season?.year,
          raceName: item.name,
          raceType: "Main Race"
        };

        if (!simplifiedRace.season || !simplifiedRace.raceName) {
          console.warn("Invalid race object skipped:", simplifiedRace);
          continue;
        }

        try {
          await racePOST({ race: simplifiedRace });
          count++;
        } catch (err) {
          console.warn(`Error saving race ${simplifiedRace.raceName}:`, err.message);
        }
      }

      console.log(`[importExternalRaces] Total races imported:`, count);

      return resolve(Service.successResponse({
        message: 'Races imported successfully',
        imported: count
      }));

    } catch (error) {
      console.error('[importExternalRaces] ERROR:', error.message);
      return reject(Service.rejectResponse('Failed to fetch data from external API', 502));
    }
  }
);

const importExternalXML = () => new Promise(
  async (resolve, reject) => {
    try {
      console.log("[importExternalXML] Requesting XML from external API...");

      const { data: xml } = await axios.get('https://www.w3schools.com/xml/note.xml', {
        headers: { Accept: 'application/xml' }
      });

      console.log("[importExternalXML] Received XML:\n", xml);

      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xml);

      console.log("[importExternalXML] Parsed XML to JSON:", result);

      return resolve(Service.successResponse(result));
    } catch (error) {
      console.error("[importExternalXML] Error fetching or parsing XML:", error.message);
      return reject(Service.rejectResponse('Failed to fetch or parse XML from external API', 502));
    }
  }
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
  raceIdRaceGET,
  raceIdRaceLapLapNumberGET,
  raceIdRaceLapsGET,
  raceIdRacePUT,
  racePOST,
  racesGET,
  importExternalRaces,
  importExternalXML,
  raceIdRaceDELETE
};
