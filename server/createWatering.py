import sqlite3 as lite
import sys
con = lite.connect('watering.db')
with con: 
    cur = con.cursor() 
    cur.execute("DROP TABLE IF EXISTS watering")
    cur.execute("CREATE TABLE watering(id INTEGER PRIMARY KEY AUTOINCREMENT, threshold DECIMAL,duration DECIMAL, auto BOOLEAN)")
    cur.execute("INSERT INTO watering (threshold, duration, auto) VALUES ((?), (?), (?))", (69.0,2.0,False))

