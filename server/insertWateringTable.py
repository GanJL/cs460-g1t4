import time
import sqlite3
import random

dbname='watering.db'

conn=sqlite3.connect(dbname)
curs=conn.cursor()
curs.execute("INSERT INTO watering values((?), (?), (?))", (70.0,2.0,False))
conn.commit()
conn.close()

