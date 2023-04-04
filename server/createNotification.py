import sqlite3 as lite
import sys
con = lite.connect('watering.db')
with con: 
    cur = con.cursor() 
    cur.execute("DROP TABLE IF EXISTS notification")
    cur.execute("CREATE TABLE notification(id INTEGER PRIMARY KEY AUTOINCREMENT, number INTEGER, threshold DECIMAL, toggle BOOLEAN)")
    cur.execute("INSERT INTO notification (number, threshold, toggle) VALUES ((?), (?), (?))", (86862106,110.0,False))

