import os
import ssl
import json
import numpy as np
import string
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit , join_room
from flask import Flask, request, jsonify , render_template,redirect, url_for, abort
from firebase_admin import credentials, firestore, initialize_app
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
import redis
rC = redis.StrictRedis(host='localhost',port=6379, db=0,encoding="utf-8", decode_responses=True)
rC.flushall()
def clear_punctuation(s):
    clear_string = ""
    for symbol in s:
        if symbol not in string.punctuation:
            clear_string += symbol
    return clear_string


arr = np.array([0])
# total_data = dict()


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
socketio = SocketIO(app, cors_allowed_origins='http://192.168.0.7:8080')

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
    
@app.route('/classroom/<email>/<code>')
def classroom(email,code):
    classroom = courses_ref.document(code).get().to_dict()
    # return jsonify(classroom)
    if email==classroom['email']:
        return render_template("Broadcast.html")
    else:
        return render_template("Viewer.html")

@app.route('/classroom/<email>/<code>/report')
def showReport(email,code):
    tabular_data = list()
    total_duration=0
    mini =0
    maxi_name=""

    total_average = list()

    classroom = courses_ref.document(code).get().to_dict()
    all_students = [doc.to_dict() for doc in student_ref.stream()]
    # print(all_students)

    for x in classroom['users']:
        tab_val = dict()
        for stud in all_students:
            if x == clear_punctuation(stud["email"].split("@")[0]):
                # print("COMPARE {} {}".format(x, clear_punctuation(stud["email"].split("@")[0])))
                tab_val["name"] = stud["name"]
                # tab_val["number"]= stud["number"]
                tab_val["email"]= stud["email"]
                # print(classroom[x])
                summer = [int(y) for y in classroom[x]]
                tab_val["attention"] = summer
                v = sum(summer)// len(classroom[x]) 
                total_average.append(v)
                tab_val["avg"] = v
                if v>mini:
                    print(stud["name"])
                    maxi_name = stud["name"]
                    mini=v
                # print(x,len(classroom[x]))
                if len(classroom[x])>total_duration:
                    total_duration = len(classroom)
                
                break
        tabular_data.append(tab_val)
    tot_avg = sum(total_average) //len(total_average)

    print("TABLE DATA",tabular_data)
    print("NO OF PARTICIPANTS",len(classroom['users']))
    print("DURATION",total_duration)
    print("TOTAL AVERAGE",tot_avg)
    print("CODE",code)
    print("MMMMMMMMMMMMMADDDDDDDDDDDDRRRRRRRRRRRRRRRRRRRRRRRRR  {}".format(maxi_name))
    print("ADITYA KA BHAI",maxi_name)
    print("RANDI KA NMAM",classroom["email"])

    # print(classroom)
    
    return render_template("report2.html",maxi_name=maxi_name,tabular_data=tabular_data,nop=len(classroom["users"]),duration=total_duration,tot_avg=tot_avg,code=code,email=email)





# @app.route('/audio')???YE UDHA DIYA THA NA?
# def audio():
#     return render_template("3.html")



@socketio.on('join')
def on_join(data):
    username = data['username']
    channel = data['channel']
    join_room(channel)
    rC.delete(username)
    print(channel,username)
    if len(rC.keys())>0:
        zers = ["0"] * rC.llen(rC.keys()[0])
        rC.rpush(username,*zers)
    rC.rpush("users",username)
    print("ROMMMMMMMMMM JOINED")


@socketio.on('sessionid')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: '+ str(json['data']))
    data = json["data"]
    rC.rpush(data["uid"],data["value"])

    # templist.append(str(json['data']))
    emit('my response', {'data': json['data']},broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    # channel = data['channel']
    temp_dict = dict()
    print(rC.lrange("users",0,-1))
    for i in rC.lrange("users",0,-1):
        temp_dict[clear_punctuation(i)] = rC.lrange(i,0,-1)
        print(rC.lrange(i,0,-1))
        print(rC.llen(i))
    x = np.array_str(arr)
    temp_dict['users'] = rC.lrange("users",0,-1)
    courses_ref.document(u'CS101').update(temp_dict)
    print(arr)
    print('Disconnected')


@app.route('/')
def home():
    return render_template("index.html")

port = int(os.environ.get('PORT', 8080))
if __name__ == '__main__':
    socketio.run(app,debug=True, host='192.168.0.7', port=port)