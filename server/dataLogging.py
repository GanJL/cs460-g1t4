# declare libraries
import RPi.GPIO as GPIO
import smbus
import Adafruit_DHT
import sqlite3
import requests
import json
import time
from datetime import datetime
from api import ip_address, moisture_analog_wet, moisture_analog_dry

# declare sensor type
DHT_sensor = Adafruit_DHT.DHT11

# declare raspberry pi i2c address
address = 0x48

# declare GPIO mode
GPIO.setmode(GPIO.BOARD)

# declare pin GPIO
soil_moisture = 11
#water_pump = 12
DHT = 17

# setup GPIO type
GPIO.setup(soil_moisture, GPIO.IN)
#GPIO.setup(water_pump, GPIO.OUT)

# declare DB name
dbname='sensors_data.db'

# declare logging frequency
logging_frequency = 1*60
 
# get raw data from DHT sensor
def getData():
        
        # get humidity and temperature data from digital sensor
        humidity, temperature = Adafruit_DHT.read_retry(DHT_sensor, DHT)

        # get reservoir level from analog sensor 
        
        bus = smbus.SMBus(1)
        reservoir = bus.read_byte_data(address,0)
        bus.close()
        # get soil moisture level from analog sensor 
        
        bus = smbus.SMBus(1)
        moisture = bus.read_byte_data(address,1)
        bus.close()
                
        # get lighting level from analog sensor
        bus = smbus.SMBus(1)
        sunlight = bus.read_byte_data(address,2)
        bus.close()

        
        return moisture,temperature,humidity,sunlight,reservoir

# log data with no processing
def logData(moisture,temperature,humidity,sunlight,reservoir):
                        
        dt = datetime.today().strftime('%d-%m-%Y %H:%M:%S')
        conn=sqlite3.connect(dbname)
        curs=conn.cursor()
        curs.execute("INSERT INTO sensors_data (timestamp,moisture,temperature,humidity,sunlight,reservoir) VALUES ((?), (?), (?), (?), (?), (?))", (dt,moisture,temperature,humidity,sunlight,reservoir))
        conn.commit()
        conn.close()

# running function
try:
        
    while True:
        
        
        moisture,temperature,humidity,sunlight,reservoir = getData()
        
        # workaround smbus issue where reservoir data will overwrite the rest
        while (reservoir == moisture or reservoir == sunlight):
               moisture,temperature,humidity,sunlight,reservoir = getData() 
        print("R: ",reservoir, " M: ", moisture, " S: ", sunlight)
        logData(moisture,temperature,humidity,sunlight,reservoir)
        
        response_watering = requests.post(url='http://' + ip_address + ':8087/auto_water_plant',data=json.dumps({'moisture': moisture, 'reservoir': reservoir}))
        result_watering = response_watering.json()
        
        response_fertilising = requests.post(url='http://' + ip_address + ':8087/auto_fertiliser')
        result_fertilising  = response_fertilising.json()
        
        response_notification = requests.post(url='http://' + ip_address + ':8087/send_notification',data=json.dumps({'reservoir': reservoir}))
        result_notification  = response_notification.json()
        
        print("Status for Watering ",result_watering['status'],"-", result_watering['data'])
        print("Status for Fertilising ",result_fertilising['status'],"-", result_fertilising['data'])
        print("Status for Notification ",result_notification['status'],"-", result_notification['data'])
        
        time.sleep(logging_frequency)    
            
finally:
        
    GPIO.cleanup() 
