// Video Part

const usernameInput = document.getElementById('username');
const button = document.getElementById('join_leave');
const container = document.getElementById('container');
const count = document.getElementById('count');
var connected = false;
var room;

function addLocalVideo() {
    Twilio.Video.createLocalVideoTrack().then(track => {
        var video = document.getElementById('local').firstChild;
        video.appendChild(track.attach());
    });
};

function connect(username) {
    var promise = new Promise((resolve, reject) => {
        // get a token from the back end
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({'username': username})
        }).then(res => res.json()).then(data => {
            // join video call
            return Twilio.Video.connect(data.token);
        }).then(_room => {
            room = _room;
            room.participants.forEach(participantConnected);
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            console.log("Here")
            updateParticipantCount();
            resolve();
        }).catch(() => {
            reject();
        });
    });
    return promise;
};

function updateParticipantCount() {
    if (!connected)
        count.innerHTML = 'Disconnected.';
    else
        count.innerHTML = (room.participants.size + 1) + ' participants online.';
};

function participantConnected(participant) {

    participant.tracks.forEach(publication => {
        if (publication.isSubscribed)
            trackSubscribed(tracks_div, publication.track);
    });
    participant.on('trackSubscribed', track => trackSubscribed(tracks_div, track));
    participant.on('trackUnsubscribed', trackUnsubscribed);

    updateParticipantCount();
};

function participantDisconnected(participant) {
    document.getElementById(participant.sid).remove();
    updateParticipantCount();
};

function trackSubscribed(div, track) {
    div.appendChild(track.attach());
};

function trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
};

function disconnect() {
    room.disconnect();
    while (container.lastChild.id != 'local')
        container.removeChild(container.lastChild);
    button.innerHTML = 'Join call';
    connected = false;
    updateParticipantCount();
};

addLocalVideo();
var username = 'Broadcaster';
connect(username);

// Socket Part


document.addEventListener('DOMContentLoaded', function(){
var socket = io.connect('http://' + document.domain + ':' + location.port );
var socket2 = io.connect('http://' + document.domain + ':' + location.port +"/timestamp")
let container1 = document.getElementById("container1");
let globalUser = [];

class Cuser {
  constructor(username) {
      this.username = username;
      this.chart = null;
  }

  createValues(value){
      this.values=[];
  }

  
  drawChart() {
      let username = this.username;
      let value = this.values;
      let chart = document.createElement("div");
      chart.setAttribute("class", "col-6 mx-auto my-3 ");
      let canvas = document.createElement("canvas");

      canvas.setAttribute("class", "canvas");
      canvas.setAttribute("id", this.username);
      chart.appendChild(canvas);
      container1.append(chart);

      let ctx = canvas.getContext("2d");
      let myChart = new Chart(ctx, {
      type: "line",
      data: {
          labels: value,
          datasets: [
          {
              label: username,
              data: value,
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1,
          },
          ],
      },
      options: { 
        scales: { 
            xAxes : [{
              display:false
            }],
            yAxes: [{
                ticks: {
                    max: 100,
                    min: 0,
                    stepSize: 20
                }
            }]
        },
        legend: {
            display: true,
            position: 'bottom',
            labels:{
                fontSize:20,
                boxWidth: 0
            }
        },
    }
      });
      this.chart = myChart;
  }

  addData(val) {
      this.values.push(val);
      if (this.values.length>50){
          this.removeData();
      }
      this.chart.update();
  }

  removeData() {
      this.chart.data.labels.shift();
      this.chart.update();
  }
  }

  function randomUser(uid,value) {
  if (globalUser.length==0){
      let user = new Cuser(uid);
      user.createValues();
      user.drawChart();
      user.addData(value);
      globalUser.push(user);
  }
  else{
      let flag=-1;
      for (let i = 0 ;i<globalUser.length;i++){
          console.log( globalUser[i].username,  uid, globalUser[i].username === uid)
          if (globalUser[i].username === uid){
              flag=i;
              break;
          }
      }
      if(flag >=0){
          globalUser[flag].addData(value);

      }
      else if(flag==-1){

          let user = new Cuser(uid);
          user.createValues();
          user.drawChart();
          user.addData(value);
          globalUser.push(user);
          
      }
  }
  }



socket.on('my response', function(msg) {
  console.log(msg.data);
  console.log(msg.data.uid);
  console.log(msg.data.value);
  randomUser(msg.data.uid,parseInt(msg.data.value));
  // let user = new Cuser(msg.data.uid,[ parseInt( msg.data.value)]);
  // user.drawChart();
  // globalUser.push(user);

    
});

});