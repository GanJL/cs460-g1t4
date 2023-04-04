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
import threading
from api import ip_address 
# create flask app and setup CORS
app = Flask(__name__)
CORS(app, resources={r"/*":{"origins":"*"}})

# declare sensor type
DHT_sensor = Adafruit_DHT.DHT11

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
#water_pump = 12
DHT = 17

# setup GPIO type
GPIO.setup(soil_moisture, GPIO.IN)
#GPIO.setup(water_pump, GPIO.OUT)

# get last row of data from sensors database
@app.route('/getdata')
def get_data():
    conn = sqlite3.connect('sensors_data.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM sensors_data ORDER BY timestamp DESC LIMIT 1")
    data = r.fetchall()
    return json.dumps(data)
    
# get all rows of data from sensors database
@app.route('/getalldata')
def get_all_data():
    conn = sqlite3.connect('sensors_data.db')
    curs=conn.cursor()
    r = curs.execute("SELECT * FROM sensors_data ORDER BY timestamp DESC")
    data = r.fetchall()
    conn.close()
    return json.dumps({"status": 200, "data": data})



if __name__ == '__main__':
    app.run(debug=True, port=8088, host=ip_address)


