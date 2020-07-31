// Video part

const container = document.getElementById('container');
var connected = false;
var room;

var username = extractEmails(window.location.href);
console.log(username)
var socket = io.connect('https://' + document.domain + ':' + location.port );


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


const URL = "https://sih2309.azurewebsites.net/static/my_model/";
let model_video, webcam_video, labelContainer_video, maxPredictions_video;
var arr_video = []

// A $( document ).ready() block.
$(document).ready(function() {
    socket.emit('join',{"channel": "CS101", "username" :username});

    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia({video: true}, function() { 
        init_video();
     }, function(){ 
        console.log("AUDIO")
        init_audio();
    });
    connect(username);
});

// Load the image model and setup the webcam
async function init_video() {
    const modelURL_video = URL + "model_video.json";
    const metadataURL_video = URL + "metadata_video.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model_video = await tmImage.load(modelURL_video, metadataURL_video);
    maxPredictions_video = model_video.getTotalClasses();

    // Convenience function to setup a webcam
    const flip_video = true; // whether to flip the webcam
    webcam_video = new tmImage.Webcam(200, 200, flip_video); // width, height, flip
    await webcam_video.setup(); // request access to the webcam
    await webcam_video.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam_video.canvas);
    labelContainer_video = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer_video.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam_video.update(); // update the webcam frame
    predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction_video = await model_video.predict(webcam_video.canvas);
    arr_video.push(parseFloat(JSON.stringify(prediction_video[0]["probability"])));
    // console.dir(arr);
    
    if(arr_video.length > 50){
        var sum = arr_video.reduce((previous, current) => current += previous);
        let avg = sum / arr_video.length;
        avg = Math.round(100*avg);
        console.log(avg)
        setTimeout(function(){
            socket.emit('sessionid', {data: {'uid' : username , 'value' : JSON.stringify(avg) , 'time': new Date()} });
        },200 );
        
        arr_video = [];
    }
    for (let i = 0; i < maxPredictions_video; i++) {
        const classPrediction =
            prediction_video[i].className + ": " + prediction_video[i].probability.toFixed(2);
        labelContainer_video.childNodes[i].innerHTML = classPrediction;
    }
}

async function createModel() {
    console.log("CRWEATEsadasfd");
    const checkpointURL = URL + "model_audio.json"; // model topology
    const metadataURL = URL + "metadata_audio.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

        console.log("KJHGIKUHGIU");
    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    console.log("SDASDD")
    return recognizer;
}

async function init_audio() {
    var array_audio = [0];
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // listen() takes two arguments:


    // SHARDUL ABHI VIDEO EK BAR RUN KARKE DEKH AND THEN INCOGNITIO PE AUDIO DEKH.
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        array_audio.push(result.scores[1]);
        console.log("AUDIO RESULTS")
        pred = Math.round(100*result.scores[1]);
        console.log(pred);
        // socket.emit('sessionid', {data: {'uid' : username , 'value' : JSON.stringify(pred) } });

        if(array_audio.length > 10){
            var sum = array_audio.reduce((previous, current) => current += previous);
            let avg = sum / array_audio.length;
            avg = Math.round(100*avg);
            console.log(avg)



        setTimeout(function(){
            socket.emit('sessionid', {data: {'uid' : username , 'value' : JSON.stringify(avg) , 'time': new Date()} });
        },500 );
        
        array_audio = [];
        }


        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 5000);
}