import random
import string
from flask import Flask, request, redirect, url_for
import sqlite3
from sqlite3 import Error

class User():    
    def __init__(self, data=[None for i in range(3)]):
        self.id = data[0]
        self.email = data[1]
        self.password = data[2]
    
    def toJSON(self):
        return {"id":self.id,"email":self.email,"password":self.password}

class Booking():
    def __init__(self, data=[None for i in range(5)]):
        self.id = data[0]
        self.user_id = data[1]
        self.email = data[2]
        self.telephone = data[3]
        self.fullname = data[4]
    
    def toJSON(self):
        return {"id":self.id,"user_id":self.user_id,"email":self.email,"telephone":self.telephone,"fullname":self.fullname}

class database():
    
    def __init__(self):
        self.connection = database.create_connection(r"./database.db")

    def create_connection(db_file):
        conn = None
        try:
            conn = sqlite3.connect(db_file)
            return conn
        except Error as e:
            print(e)

        return conn

    def login_user(self, email, password):
        res = self.connection.cursor().execute("SELECT * FROM users WHERE email='{}' and password='{}'".format(email, password)).fetchone()
        if res == None:
            return False, None
        user = User(res)
        token = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(30))

        query = "INSERT INTO tokens (user_id, token) VALUES ('{}','{}')".format(user.id, token)
        
        self.connection.cursor().execute(query)
        self.connection.commit()
        return True, token

    def logout_user(self, user):
        query = "DELETE FROM tokens WHERE user_id='{}'".format(user.id)
        self.connection.cursor().execute(query)
        self.connection.commit()

    def authenticate(self):
        try:
            Authorization = request.headers['Authorization']
            token = Authorization.split(' ')[1]
        except:
            return False, None
        query = "SELECT * FROM tokens WHERE token='{}'".format(token)
        res = self.connection.cursor().execute(query).fetchone()
        if res == None:
            return False, None
        user_id = res[1]
        query = "SELECT * FROM users WHERE id='{}'".format(user_id)
        res = self.connection.cursor().execute(query).fetchone()
        if res == None:
            return False, None
        user = User(res)
        return True, user

    def get_user_bookings(self, user):
        query = "SELECT * FROM bookings WHERE user_id='{}'".format(user.id)
        res = self.connection.cursor().execute(query).fetchall()
        bookings = [Booking(data) for data in res]
        return bookings

    def add_booking(self, booking):
        query = "INSERT INTO bookings (user_id, email, telephone, fullname) VALUES ('{}','{}','{}','{}')".format(booking.user_id, booking.email, booking.telephone, booking.fullname)
        res = self.connection.cursor().execute(query)
        self.connection.commit()
        
        return self.connection.cursor().lastrowid
    
    def get_booking(self, id):
        query = "SELECT * FROM bookings WHERE id='{}'".format(id)
        res = self.connection.cursor().execute(query).fetchone()
        return Booking(res) if res != None else None

    def update_booking(self, booking):
        query = "UPDATE bookings SET email='{}',telephone='{}',fullname='{}'".format(booking.email, booking.telephone, booking.fullname)
        self.connection.cursor().execute(query)
        self.connection.commit()

    def delete_booking(self, id):
        query = "DELETE FROM bookings WHERE id='{}'".format(id)
        self.connection.cursor().execute(query)
        self.connection.commit()

app = Flask(__name__)


d = database()

d.login_user('carlsen@gmail.com', '1234321@')

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route('/login',methods = ['GET'])
def login():
    return app.send_static_file("login.html")

############################################################

@app.route('/api/login',methods = ['POST'])
def api_login():
    try:
        email = request.form['email']
        password = request.form['password']
    except:
        return {'success':False, "message": "email and password are required"}
    myDB = database()
    logged_in, token = myDB.login_user(email, password)
    print(token)
    if(not logged_in):
        return {'success':False, "message": "email or password is incorrect"}
    return {'success':True, 'token': token}

@app.route('/api/logout',methods = ['POST'])
def api_logout():
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    myDB.logout_user(user)
    return {'success':True}

@app.route('/api/bookings',methods = ['GET'])
def api_booking_index():
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    bookings = myDB.get_user_bookings(user)
    return {'success':True, 'data': [booking.toJSON() for booking in bookings]}

@app.route('/api/bookings',methods = ['POST'])
def api_booking_store():
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    
    try:
        booking = Booking()
        booking.user_id = user.id
        booking.email = request.form['email']
        booking.telephone = request.form['telephone']
        booking.fullname = request.form['fullname']
    except:
        return {'success':False}
    
    row_id = myDB.add_booking(booking)
    booking.id = row_id
    return {'success':True, 'data': booking.toJSON()}

@app.route('/api/bookings/<id>',methods = ['GET'])
def api_booking_show(id):
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    
    booking = myDB.get_booking(id)
    if booking == None or booking.user_id != user.id:
        return {'success':False}
    
    return {'success':True, 'data': booking.toJSON()}

@app.route('/api/bookings/<id>',methods = ['PUT'])
def api_booking_update(id):
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    
    booking = myDB.get_booking(id)
    if booking == None or booking.user_id != user.id:
        return {'success':False}
    
    if 'email' in request.form:
        booking.email = request.form['email']
    if 'telephone' in request.form:
        booking.telephone = request.form['telephone']
    if 'fullname' in request.form:
        booking.fullname = request.form['fullname']
        
    myDB.update_booking(booking)
    return {'success':True, 'data': booking.toJSON()}

@app.route('/api/bookings/<id>',methods = ['DELETE'])
def api_booking_destroy(id):
    myDB = database()
    logged_in, user = myDB.authenticate()
    if(not logged_in):
        return {'success':False}
    
    booking = myDB.get_booking(id)
    if booking == None or booking.user_id != user.id:
        return {'success':False}
    
    myDB.delete_booking(booking.id)
    return {'success':True}


if __name__ == "__main__":
    app.run()

