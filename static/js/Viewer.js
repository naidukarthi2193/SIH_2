const container = document.getElementById('container');
var connected = false;
var room;

var username = extractEmails(window.location.href);
console.log(username)
var socket = io.connect('http://' + document.domain + ':' + location.port );


function extractEmails (text)
{
    var mail = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
    return (mail.split('@')[0]);
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
            // room.participants.forEach(participantConnected);
            room.participants.forEach(participant => {
               if(participant.identity=='Broadcaster'){
                    participantConnected(participant);
                }
            })
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            updateParticipantCount();
            resolve();
        }).catch(() => {
            reject();
        });
    });
    return promise;
};

function participantConnected(participant) {

        if(participant.identity=='Broadcaster'){
            var participant_div = document.createElement('div');
            participant_div.setAttribute('id', 'Broadcaster');
            participant_div.setAttribute('class', 'participant');

            var tracks_div = document.createElement('div');
            participant_div.appendChild(tracks_div);

            var label_div = document.createElement('div');
            label_div.innerHTML = participant.identity;
            participant_div.appendChild(label_div);

            container.appendChild(participant_div);


            participant.tracks.forEach(publication => {
                if (publication.isSubscribed)
                    trackSubscribed(tracks_div, publication.track);
            });
            participant.on('trackSubscribed', track => trackSubscribed(tracks_div, track));
            participant.on('trackUnsubscribed', trackUnsubscribed);
        }
};

function participantDisconnected(participant) {
    document.getElementById('Broadcaster').remove();
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
};


const URL = "http://192.168.0.106:8080/static/my_model/";
let model, webcam, labelContainer, maxPredictions;
var arr = []

// A $( document ).ready() block.
$(document).ready(function() {
    socket.emit('join',{"channel": "CS101", "username" :username});
    init();
    connect(username);
});

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    arr.push(parseFloat(JSON.stringify(prediction[0]["probability"])));
    // console.dir(arr);
    
    if(arr.length > 50){
        var sum = arr.reduce((previous, current) => current += previous);
        let avg = sum / arr.length;
        avg = Math.round(100*avg);
        console.log(avg)
        socket.emit('sessionid', {data: {'uid' : username , 'value' : JSON.stringify(avg) } });
        arr = [];
    }
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}[]