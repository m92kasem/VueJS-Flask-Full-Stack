"""
Flask: Using templates
"""
from asyncore import read
from re import M
from turtle import title
from setup_db import select_students, select_courses
import sqlite3
from sqlite3 import Error
from flask import Flask, render_template, request, redirect, url_for, g

app = Flask(__name__)


DATABASE = './database.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/")
def index():
    # get the database connection
    conn = get_db()
    
     
         
    return render_template("index.html", 
                            students=select_students(conn),
                            courses=select_courses(conn)
                        )




@app.route("/courses", methods=["POST", "GET"])
def courses():
    # get the database connection
    if request.method == 'GET':
     return render_template("courses_page.html" 
                    # select_students executes SELECT SQL statement on database connetion
                    # returns list of students
                    
    )
    else:
        conn = get_db()    
        courseID=request.form['courseid']
        cur = conn.cursor()
        cur.execute("SELECT students.name, grades.course_id, courses.name, grades.grade FROM grades INNER JOIN students on students.student_no = grades.student_no INNER JOIN courses on grades.course_id = courses.id WHERE courses.id = ? ORDER BY grades.grade", (courseID,))
        select_courses_id = []
        for (students_name, course_id, coursesname, gradesgrade) in cur:
                select_courses_id.append({
                    "students.name": students_name,
                    "grades.course_id": course_id, 
                    "courses.name": coursesname,
                    "grades.grade": gradesgrade
                })                      
                
        print(select_courses_id)
        return render_template("courses_page.html", select_courses_id=select_courses_id)
   





@app.route("/studentsP", methods=["POST", "GET"])
def studentsP():
    # get the database connection
    conn = get_db()
    studentNo=None
    
    if request.method == 'GET':

        return render_template("courses_page.html", 
                          
    )

    else:
            conn = get_db()    
            studentNo=request.form['student_id']
            #studentNo=request.form['data']
            cur = conn.cursor()
            cur2 = conn.cursor()
            cur2.execute("SELECT student_no, name FROM students WHERE student_no = ? ", (studentNo,))
            select_student_name = []
    for (student_n, studentsname) in cur2:
            select_student_name.append({
               "student_no":student_n,
               "name": studentsname
            })                      
            break
       

    print("Profile: ",select_student_name)
    
    cur.execute("SELECT grades.course_id, courses.name, grades.grade FROM grades INNER JOIN students on students.student_no = grades.student_no INNER JOIN courses on grades.course_id = courses.id WHERE students.student_no = ?", (studentNo,))

    select_student_no = []
    for (coursid,coursesname,gradesgrade) in cur:
        select_student_no.append({ 
            "grades.course_id": coursid, 
            "courses.name": coursesname,
            "grades.grade": gradesgrade
            })

        
        #print(select_student_no.index(coursesname))

    return render_template("students_profile.html", 
                        studentss=select_student_no,
                        select_student_nam = select_student_name)
            
   
@app.route("/addStudent", methods=["POST", "GET"])                    
def addStudent():
    
    
    if request.method == 'GET':
        # send the form
        return render_template('add_student.html')
    
    
    else:
        student_no1 = request.form['student_id_no'] 
        name1 = request.form['name']
        conn = get_db()
        cur = conn.cursor()
   

    try:
            
            

            sql = ''' INSERT INTO students(student_no,name)
              VALUES(?,?) '''
            cur.execute(sql, (student_no1, name1))
            conn.commit(),


            
            return redirect(url_for('index'))


      
    except Error as e: # if error
            # then display the error in 'error.html' page
           
            return render_template('error.html', msg="Error adding new student.", error=e)
    finally:
            conn.close()
     
     

@app.route("/addGrade", methods=["POST", "GET"])
def addGrade():
    
    
    if request.method == 'GET':
        conn = get_db()
        grades = [("A"), ("B"), ("C"), ("D"), ("E"), ("F")]
        gra=grades
        cur = conn.cursor()
        #cur.execute("SELECT student_no FROM students WHERE name = ? ", (studentname,))
        cur.execute("SELECT student_no FROM students")
        select_student_name = []
        for (student_n) in cur:
                select_student_name.append({
               "student_no":student_n
            })                      
                break
        
    
        return render_template("add_grade.html", 
                    students=select_students(conn),
                    courses=select_courses(conn),
                    gra = gra
                    )
    
    
    else:
        conn = get_db()
        cur = conn.cursor()
        studno = request.form['studno']
        course = request.form['course'] 
        grade = request.form['grade']
   

    try:
            
            

            sql = ''' INSERT INTO grades(student_no,course_id,grade)
              VALUES(?,?,?) '''
            cur.execute(sql, (studno, course, grade))
            conn.commit(),


            
            return redirect(url_for('index'))


      
    except Error as e: # if error
            # then display the error in 'error.html' page
           
            return render_template('error.html', msg="Error adding new grade.", error=e)
    finally:
            conn.close()
     


if __name__ == "__main__":
    app.run(debug=True)