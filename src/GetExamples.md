# 📘 Race & Lap API – `GET` Endpoint Response Examples

This document provides realistic examples of what the **Race & Lap API** will return for each `GET` endpoint defined in the OpenAPI specification.

---

## 🔹 `GET /races`

**Description:** Returns all registered races.

**200 Response:**

```json
{
  "races": [
    {
      "season": 2023,
      "raceName": "Grand Prix de Monaco",
      "raceType": "Main Race"
    },
    {
      "season": 2023,
      "raceName": "Grand Prix de Belgique",
      "raceType": "Sprint"
    }
  ]
}
```

---

## 🔹 `GET /race/{id_race}`

**Description:** Returns detailed information about a specific race by its ID.

**200 Response:**

```json
{
  "season": 2023,
  "raceName": "Grand Prix de Monaco",
  "raceType": "Main Race"
}
```

---

## 🔹 `GET /drivers`

**Description:** Returns a list of driver URIs.

**200 Response:**

```json
{
  "drivers": [
    "/driver/1",
    "/driver/2"
  ]
}
```

---

## 🔹 `GET /drivers/{id_race}`

**Description:** Returns all drivers participating in a specific race. Can be filtered by driver code or team.

**200 Response:**

```json
{
  "drivers": [
    {
      "driverNumber": 44,
      "code": "HAM",
      "team": "Mercedes",
      "nationality": "British"
    },
    {
      "driverNumber": 1,
      "code": "VER",
      "team": "Red Bull",
      "nationality": "Dutch"
    }
  ]
}
```

---

## 🔹 `GET /driver/{id_driver}`

**Description:** Returns detailed information about a specific driver.

**200 Response:**

```json
{
  "driverNumber": 16,
  "code": "LEC",
  "team": "Ferrari",
  "nationality": "Monegasque"
}
```

---

## 🔹 `GET /race/{id_race}/laps`

**Description:** Returns all laps from a specific race.

**200 Response:**

```json
{
  "laps": [
    {
      "lapNumber": 1,
      "driverCode": "VER",
      "position": 1,
      "lapTime": "1:32.123",
      "isPersonalBest": false,
      "sector1Time": "0:29.123",
      "sector2Time": "0:31.456",
      "sector3Time": "0:31.544",
      "compound": "Soft",
      "pitInTime": null,
      "pitOutTime": null,
      "pitStopDuration": null,
      "finishingPosition": 1,
      "gridPosition": 1,
      "finalStatus": "Finished"
    },
    {
      "lapNumber": 1,
      "driverCode": "HAM",
      "position": 2,
      "lapTime": "1:33.222",
      "isPersonalBest": false,
      "sector1Time": "0:29.500",
      "sector2Time": "0:31.800",
      "sector3Time": "0:31.922",
      "compound": "Medium",
      "pitInTime": null,
      "pitOutTime": null,
      "pitStopDuration": null,
      "finishingPosition": 2,
      "gridPosition": 2,
      "finalStatus": "Finished"
    }
  ]
}
```

---

## 🔹 `GET /race/{id_race}/lap/{lap_number}`

**Description:** Returns information about a specific lap in a race. Can be filtered by `driverCode`.

**200 Response:**

```json
{
  "lap_number": 10,
  "times": {
    "lapNumber": 10,
    "driverCode": "HAM",
    "position": 2,
    "lapTime": "1:31.900",
    "isPersonalBest": true,
    "sector1Time": "0:28.950",
    "sector2Time": "0:31.100",
    "sector3Time": "0:31.850",
    "compound": "Soft",
    "pitInTime": null,
    "pitOutTime": null,
    "pitStopDuration": null,
    "finishingPosition": 2,
    "gridPosition": 2,
    "finalStatus": "Finished"
  }
}
```

---

## 🔸 Error Responses

When a resource is not found or a request is invalid, the API will respond with:

```json
{
  "error": "Not Found"
}
```
