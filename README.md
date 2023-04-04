# Getting Started with our Web Application and Backend Server

## Web Application


### `npm i`

Download npm package modules

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


## Backend Server


Create databases:

1. `sqlite3 watering.db` 
2. `sqlite3 sensors_data.db`

Run the following in order to create database tables:

1. `createSensorData.py`
2. `createWatering.py`
3. `createNotification.py`
4. `createFertiliser.py`

Run the following in order to start backend servers:

1. `api.py`
2. `dataLogging.py`
3. `liveData.py`
4. `sensorData.py`

### Note: Notifications require a Twilio uid and api key to work.