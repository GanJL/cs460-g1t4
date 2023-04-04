# declare libraries
import sqlite3
from flask import Flask
import time
from datetime import datetime
import random
import json
from flask_cors import CORS
import RPi.GPIO as GPIO
import smbus
import Adafruit_DHT
from flask_socketio import SocketIO, emit
from api import ip_address 
# create flask app and setup CORS
app = Flask(__name__)
CORS(app, resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# declare sensor type
DHT_sensor = Adafruit_DHT.DHT11
DHT = 17

# declare raspberry pi i2c address
address = 0x48

# declare analog i2c addresses 
A0 = 0x40
A1 = 0x41
A2 = 0x42

# create bus channel for i2c
bus = smbus.SMBus(1)

# declare GPIO mode
GPIO.setmode(GPIO.BOARD)

# declare pin GPIO
soil_moisture = 11


# setup GPIO type
GPIO.setup(soil_moisture, GPIO.IN)
#GPIO.setup(water_pump, GPIO.OUT)

# get raw data from DHT sensor
def get_live_data():
        
    # get humidity and temperature data from digital sensor
    humidity, temperature = Adafruit_DHT.read_retry(DHT_sensor, DHT)
        
    # get reservoir level from analog sensor 
    reservoir = bus.read_byte_data(address,0)

    # get moisture level from analog sensor 
    moisture = bus.read_byte_data(address,1)
    
    # get sunlight level from analog sensor 
    sunlight = bus.read_byte_data(address,2)

    time = datetime.today().strftime('%d-%m-%Y %H:%M:%S')
    
    print("R: ",reservoir, " M: ", moisture, " S: ", sunlight)

    return json.dumps({
        'time': time,
        'moisture': moisture,
        'temperature': temperature,
        'humidity': humidity,
        'sunlight': sunlight,
        'reservoir': reservoir
    })
    
@socketio.on('connect')
def connected():
    print("Connected to client..")
    emit("connect",{'data': "Server is connected"},broadcast=True)

@socketio.on('disconnect')
def disconnected():
    print("Client is disconnected")
    emit("disconnect",{'data':"Server is disconnected"},broadcast=True)
    
@socketio.on('live_data')
def live_data_request(count):
    emit("live_data",{'data': get_live_data()}, broadcast=True)
    print(str(count),"- Sent data to client..")
    
@socketio.on('request')
def handle_client():
    emit("data",{'data':"request received"}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=8089, host=ip_address)


