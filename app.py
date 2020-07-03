import os
from flask import Flask, request, jsonify , render_template,redirect, url_for
from firebase_admin import credentials, firestore, initialize_app
import json

app = Flask(__name__)

# Initialize Firestore DB
cred = credentials.Certificate('./static/prefs-305a5-firebase-adminsdk-7ljrd-d40db11141.json')
default_app = initialize_app(cred)
db = firestore.client()
student_ref = db.collection('student')
lecturer_ref = db.collection('lecturer')
courses_ref = db.collection('courses')

@app.route('/checklogin', methods=['GET','POST'])
def checklogin():
    try:
        if request.method == "POST":
            email = str(request.form['email'])
            password = str(request.form['password'])
            
            if str(request.form['role']) == 'student':
                if student_ref.document(email).get().to_dict():
                    cred = student_ref.document(email).get().to_dict()
                    if password==cred['password']:
                        return  redirect(url_for('liststudentcourses',email=email))
                    else:
                        return render_template("login_error.html")
                else:
                    return  render_template("login_error.html")
            else:
                if lecturer_ref.document(email).get().to_dict():
                    cred = lecturer_ref.document(email).get().to_dict()
                    if password==cred['password']:
                        return  redirect(url_for('listlecturercourses',email=email))
                    else:
                        return render_template("login_error.html")
                else:
                    return  render_template("login_error.html")

        else:
            return render_template("login_error.html")
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/adduser',methods=['GET','POST'])
def adduser():
    try:
        if request.method == "POST":
            email = str(request.form['add_email'])
            password = str(request.form['add_password'])
            name = str(request.form['add_name'])
            contact = str(request.form['add_contact'])
            if str(request.form['add_role']) == 'student':
                student_ref.document(email).set( {'name' :name,'email':email,'number':contact,'password':password})
                return render_template('login_create.html')
            else:
                lecturer_ref.document(email).set( {'name' :name,'email':email,'number':contact,'password':password})
                return render_template('login_create.html')
        if request.method == "GET":
            return "GET method called"
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/listcourses')
def listcourses():
    all_courses = [doc.to_dict() for doc in courses_ref.stream()]
    return render_template("student_courses.html",all_courses=all_courses)

@app.route('/liststudentcourses/<email>')
def liststudentcourses(email):
    all_courses = [doc.to_dict() for doc in courses_ref.stream()]
    student_courses = student_ref.document(email).get().to_dict()['course'].split(",")
    final_list = list()
    for c in all_courses:
        if c['code'] in student_courses:
            final_list.append(c)
    cred = student_ref.document(email).get().to_dict()
    return render_template("student_course.html" , all_courses = final_list)

@app.route('/listlecturercourses/<email>')
def listlecturercourses(email):
    all_courses = [doc.to_dict() for doc in courses_ref.stream()]
    all_students = [doc.to_dict() for doc in student_ref.stream()]
    final_list = list()
    for c in all_courses:
        count=0
        for stud in all_students:
            courses = stud['course'].split(",")
        
        if c['code'] in courses:
                count+=1
        if email == c['email']:
            final_list.append(c)
    return render_template("lecturer_course.html" , all_courses = final_list ,count = count )
    



@app.route('/')
def home():
    return render_template("index.html")


port = int(os.environ.get('PORT', 8080))
if __name__ == '__main__':
    app.run(debug=True,threaded=True, host='0.0.0.0', port=port)