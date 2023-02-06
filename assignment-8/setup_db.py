import email
import sqlite3
from sqlite3 import Error

database = r"./database.db"


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

    return conn

##### CREATE TABLES ######## 


sql_create_users_table = """CREATE TABLE "users" (
                            "id"	INTEGER,
                            "email"	TEXT,
                            "password"	TEXT,
                            PRIMARY KEY("id" AUTOINCREMENT)
                        );"""

sql_create_bookings_table = """CREATE TABLE "bookings" (
                                    "id"	INTEGER,
                                    "user_id"	INTEGER NOT NULL,
                                    "email"	TEXT NOT NULL,
                                    "telephone"	TEXT NOT NULL,
                                    "fullname"	TEXT NOT NULL,
                                    PRIMARY KEY("id" AUTOINCREMENT)
                                );"""

sql_create_tokens_table = """CREATE TABLE "tokens" (
                                    "id"	INTEGER NOT NULL,
                                    "user_id"	INTEGER NOT NULL,
                                    "token"	TEXT NOT NULL,
                                    PRIMARY KEY("id")
                                );"""




def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)

#### INSERT #########

def init_users(conn):
    init = [("mahmoud@gmail.com", "1234"),
            ("Layla@gmail.com", "1234"),
            ("Isabella@gmail.com", "1234")]
    for s in init:
        add_user(conn, s[0], s[1])

def add_user(conn, email, password):
    """
    Add a new user into the users table
    :param conn:
    :param email:
    :param password:
    """
    sql = ''' INSERT INTO users (email,password)
              VALUES(?,?) '''
    try:
        cur = conn.cursor()
        cur.execute(sql, (email, password))
        conn.commit()
    except Error as e:
        print(e)

#### SELECT #######

def select_bookings(conn, user_id):
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM bookings WHERE user_id = {}".format(user_id)) 

    bookings = []
    for (id,user_id, email, telephone, fullname ) in cur:
        bookings.append({ 
            "id": id, 
            "email": email,
            "telephone": telephone,
            "fullname":fullname
            })

    return bookings

def select_user(conn, id):
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = {}".format(id))

    users = []
    for (id,email, password) in cur:
        users.append({ 
            "id": id,
            "email": email, 
            "password": password
            })

    return users

#### SETUP ####

def setup():
    conn = create_connection(database)
    if conn is not None:
        create_table(conn, sql_create_users_table)
        create_table(conn, sql_create_bookings_table)
        create_table(conn, sql_create_tokens_table)
        init_users(conn)
        

        print(select_user(conn, 1))

        conn.close()


if __name__ == '__main__':
    # If executed as main, this will create tables and insert initial data
    setup()

