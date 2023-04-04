import sqlite3 as lite
import sys
from datetime import datetime

con = lite.connect('sensors_data.db')
with con: 
    dt = datetime.today().strftime('%d-%m-%Y %H:%M:%S')
    cur = con.cursor() 
    cur.execute("DROP TABLE IF EXISTS sensors_data")
    cur.execute("CREATE TABLE sensors_data(id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME, moisture DECIMAL,temperature DECIMAL,humidity DECIMAL,sunlight DECIMAL, reservoir DECIMAL)")
