import sqlite3 as lite
import sys
con = lite.connect('watering.db')
with con: 
    cur = con.cursor() 
    cur.execute("DROP TABLE IF EXISTS fertiliser")
    cur.execute("CREATE TABLE fertiliser(id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT,duration DECIMAL, auto BOOLEAN)")
    cur.execute("INSERT INTO fertiliser (time, duration, auto) VALUES ((?), (?), (?))", ("00:00",2.0,False))

