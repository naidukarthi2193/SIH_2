import os
import ssl
import json
import numpy as np
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit
from flask import Flask, request, jsonify , render_template,redirect, url_for, abort
from firebase_admin import credentials, firestore, initialize_app
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant

arr = np.array([0])


# Initialize Twilio API
load_dotenv()
twilio_account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
twilio_api_key_sid = os.environ.get('TWILIO_API_KEY_SID')
twilio_api_key_secret = os.environ.get('TWILIO_API_KEY_SECRET')

# Initialize Firestore DB
cred = credentials.Certificate('./static/firebase-adminsdk.json')
default_app = initialize_app(cred)
db = firestore.client()
student_ref = db.collection('student')
lecturer_ref = db.collection('lecturer')
courses_ref = db.collection('courses')
templist = ["AS"]

# Initialize Socket
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/login', methods=['POST'])
def login():
    username = request.get_json(force=True).get('username')
    if not username:
        abort(401)

    token = AccessToken(twilio_account_sid, twilio_api_key_sid,
                        twilio_api_key_secret, identity=username)
    token.add_grant(VideoGrant(room='My Room'))
    return {'token': token.to_jwt().decode()}

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
    return render_template("student_course.html" , all_courses = final_list,email = email)

@app.route('/listlecturercourses/<email>')
def listlecturercourses(email):
    all_courses = [doc.to_dict() for doc in courses_ref.stream()]
    all_students = [doc.to_dict() for doc in student_ref.stream()]
    final_list = list()
    for c in all_courses:
        if email == c['email']:
            final_list.append(c)
    return render_template("lecturer_course.html" , all_courses = final_list  )
    
@app.route('/classroomlive/<email>/<code>')
def classroom(email,code):
    classroom = courses_ref.document(code).get().to_dict()
    # return jsonify(classroom)
    if email==classroom['email']:
        return render_template("Broadcast.html")
    else:
        return render_template("Viewer.html")
@app.route('/classroomreport/<email>/<code>')
def reports(email,code):
    x=courses_ref.document(code).get().to_dict()
    return render_template("reports.html",x=x,shardul=x['sharduldoke99'],default=x['default'])


@socketio.on('connect', namespace='/shardul.doke99')
def test_connect():
    print("KARTTTHIKO")
    print('Student connected')


@socketio.on('sessionid',namespace='/shardul.doke99')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: '+ str(json['data']))
    global arr
    x = round(100*float(str(json['data'])))
    arr = np.append(arr, x)
    print(arr)
    # templist.append(str(json['data']))
    emit('my response', {'data': json['data']},broadcast=True)
    # test_message()

@socketio.on('connect', namespace='/naidukarthi2193')
def test_connect():
    print("KARTTTHIKO")
    print('Student connected')


@socketio.on('sessionid',namespace='/naidukarthi2193')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: '+ str(json['data']))
    # templist.append(str(json['data']))
    emit('my response', {'data': json['data']},broadcast=True)


@socketio.on('connect', namespace='/default')
def test_connect():
    print("KARTTTHIKO")
    print('Student connected')


@socketio.on('sessionid',namespace='/default')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: '+ str(json['data']))
    # templist.append(str(json['data']))
    emit('my response', {'data': json['data']},broadcast=True)


@socketio.on('disconnect',namespace='/shardul.doke99')
def handle_disconnect():
	x = np.array_str(arr)
	courses_ref.document(u'CS101').update({ u'sharduldoke99': x})
	print(arr)
	print('Disconnected')

@socketio.on('disconnect',namespace='/default')
def handle_disconnect():
	x = np.array_str(arr)
	courses_ref.document(u'CS101').update({ u'default': x})
	print(arr)
	print('Disconnected')


@app.route('/')
def home():
    return render_template("index.html")

port = int(os.environ.get('PORT', 8080))
if __name__ == '__main__':
    socketio.run(app,debug=True, host='0.0.0.0', port=port)