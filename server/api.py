# declare libraries
import sqlite3
from flask import Flask, request, jsonify
import time
from datetime import datetime
import random
import json
from flask_cors import CORS
import RPi.GPIO as GPIO
import smbus
import Adafruit_DHT
from flask_socketio import SocketIO, emit
from twilio.rest import Client

# declare IP address
ip_address = "192.168.68.64"

# moisture boundaries
moisture_analog_wet = 180
moisture_analog_dry = 230

# create flask app and setup CORS
app = Flask(__name__)
CORS(app, resources={r"/*":{"origins":"*"}})

# declare GPIO mode
GPIO.setmode(GPIO.BOARD)

# declare pin GPIO
water_pump = 13
fertiliser_pump = 15

address = 0x48

# setup GPIO type
GPIO.setup(water_pump, GPIO.OUT)
GPIO.setup(fertiliser_pump, GPIO.OUT)
GPIO.output(water_pump, GPIO.HIGH)
GPIO.output(fertiliser_pump, GPIO.HIGH)

############################################################# WATERING START #############################################################

# execute auto watering
@app.route('/auto_water_plant',methods=['POST'])
def auto_water_plant():
    data = json.loads(request.data)
    moisture = data['moisture']
    reservoir = data['reservoir']
       
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM watering ORDER BY id DESC LIMIT 1")
    db_data = r.fetchall()

    threshold = moisture_analog_dry-(moisture_analog_dry-moisture_analog_wet)*(db_data[0][1]/100)
    duration = db_data[0][2]
    auto = db_data[0][3]
    try:
        if (moisture > threshold and auto == 1):
            
            GPIO.output(water_pump, GPIO.LOW)
            time.sleep(duration)
            GPIO.output(water_pump, GPIO.HIGH)
        
            return json.dumps({"status": 200, "data":"Auto watering successful."})
        else:
            return json.dumps({"status": 400, "data":"Auto watering switched off or moisture level sufficient."})
    except: 
        return json.dumps({"status": 400, "data":"Error with auto watering. Please try again later."})

# execute manual watering
@app.route('/manual_water_plant',methods=['POST'])
def manual_water_plant():
    data = json.loads(request.data)
    duration = data['duration']
    
    bus = smbus.SMBus(1)
    reservoir = bus.read_byte_data(address,0)
    bus.close()

    try:
        GPIO.output(water_pump, GPIO.LOW)
        time.sleep(duration)
        GPIO.output(water_pump, GPIO.HIGH)
        return jsonify({"status": 200, "data": "Manual watering successful."}) 
    except:
        return jsonify({"status": 400, "data": "Error with manual watering. Please try again later."}) 
              

# update auto watering
@app.route('/update_auto_watering',methods=['PUT'])
def update_watering():
    data = json.loads(request.data)
    threshold = data['threshold']
    duration = data['duration']
    auto = data['auto']
    print(data)
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    curs.execute("INSERT INTO watering (threshold,duration,auto) VALUES ((?), (?), (?))", (threshold,duration,auto))
    conn.commit()
    r = curs.execute("SELECT * FROM watering") 
    db_data = r.fetchall()
    conn.close()

    return json.dumps({"status": 200, "data": "Auto watering updated successfully."})

@app.route('/get_auto_watering',methods=['GET'])
def get_watering_table():
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM watering ORDER BY id DESC LIMIT 1") 
    db_data = r.fetchall()
    conn.close()
    return json.dumps({"status": 200, "data": db_data})

############################################################# WATERING END #############################################################

############################################################# FERTILISER START #############################################################

# execute auto fertiliser
@app.route('/auto_fertiliser',methods=['POST'])
def auto_fertiliser():

    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM fertiliser ORDER BY id DESC LIMIT 1")
    db_data = r.fetchall()
    setTime = db_data[0][1]
    duration = db_data[0][2]
    auto = db_data[0][3]
    time_now = datetime.today().strftime('%H:%M')
    
    if (setTime == setTime and auto == 1):

        GPIO.output(fertiliser_pump, GPIO.LOW)
        time.sleep(duration)
        GPIO.output(fertiliser_pump, GPIO.HIGH)
       
        return json.dumps({"status": 200, "data":"Auto fertiliser successful."})
    else:
        return json.dumps({"status": 400, "data":"Auto fertiliser switched off."})
        
    return json.dumps({"status": 400, "data":"Error with auto fertiliser. Please try again later."})

# execute manual fertiliser
@app.route('/manual_fertiliser',methods=['POST'])
def manual_fertiliser():
    data = json.loads(request.data)
    duration = data['duration']
    print("received", duration)
        
    try:
        GPIO.output(fertiliser_pump, GPIO.LOW)
        time.sleep(duration)
        GPIO.output(fertiliser_pump, GPIO.HIGH)
        return jsonify({"status": 200, "data": "Manual fertiliser successful."}) 
    except:
        return jsonify({"status": 400, "data": "Error with manual fertiliser. Please try again later."}) 
              

# update auto fertiliser
@app.route('/update_auto_fertiliser',methods=['PUT'])
def update_auto_fertiliser():
    data = json.loads(request.data)
    time = data['time']
    duration = data['duration']
    auto = data['auto']

    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    curs.execute("INSERT INTO fertiliser (time,duration,auto) VALUES ((?), (?), (?))", (time,duration,auto))
    conn.commit()
    r = curs.execute("SELECT * FROM fertiliser") 
    db_data = r.fetchall()
    conn.close()

    return json.dumps({"status": 200, "data": "Auto fertiliser updated successfully."})

@app.route('/get_auto_fertiliser',methods=['GET'])
def get_auto_fertiliser():
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM fertiliser ORDER BY id DESC LIMIT 1") 
    db_data = r.fetchall()
    conn.close()
    return json.dumps({"status": 200, "data": db_data})

############################################################# FERTILISER END #############################################################

############################################################# NOTIFICATION START #############################################################

# execute SMS notification

@app.route('/send_notification',methods=['POST'])
def send_notification():

    data = json.loads(request.data)
    reservoir_level = data['reservoir']
    
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM notification ORDER BY id DESC LIMIT 1")
    db_data = r.fetchall()
    number = db_data[0][1]
    threshold = db_data[0][2]
    toggle = db_data[0][3]
    client = Client("<uid>", "<password>")
    
    try: 
        if (reservoir_level < threshold and toggle == 1):
            client.messages.create(to="+65"+ str(number), from_= "+15073535567", body="\n[SMART PLANT SYSTEM]\n\nHello Owner! Your system reservoir is currently below " + str(convert_threshold(threshold)) + ".\n\nPlease fill up the reservoir!")
            return json.dumps({"status": 200, "data":"Message sent successfully."})
        else:
            return json.dumps({"status": 400, "data":"Reservoir level is sufficient or notifications switched off."})
    except:
        return json.dumps({"status": 400, "data":"Message failed to send.. Please try again later."})
    
def convert_threshold(input):
    reservoir_full = 125
    return round((input/reservoir_full)*100)

# update notification
@app.route('/update_notification',methods=['PUT'])
def update_notification():
    data = json.loads(request.data)
    number = data['number']
    threshold = data['threshold']
    toggle = data['toggle']

    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    curs.execute("INSERT INTO notification (number,threshold,toggle) VALUES ((?), (?), (?))", (number,threshold,toggle))
    conn.commit()
    r = curs.execute("SELECT * FROM notification") 
    db_data = r.fetchall()
    conn.close()

    return json.dumps({"status": 200, "data": "Notification settings updated successfully."})

@app.route('/get_notification_settings',methods=['GET'])
def get_notification_settings():
    conn = sqlite3.connect('watering.db')
    curs = conn.cursor()
    r = curs.execute("SELECT * FROM notification ORDER BY id DESC LIMIT 1") 
    db_data = r.fetchall()
    conn.close()
    return json.dumps({"status": 200, "data": db_data})
        
############################################################# NOTIFICATION END #############################################################

if __name__ == '__main__':
    app.run(debug=True, port=8087, host=ip_address)


